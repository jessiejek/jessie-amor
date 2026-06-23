import { useEffect, useState } from "react";
import { exchangeRates as fallbackRates } from "../data/itinerary";

export type ExchangeRates = {
  rates: Record<string, number>;
  php: number;
  sgd: number;
  updatedAt?: string;
  source: "live" | "cached" | "fallback";
};

const CACHE_KEY = "ja-exchange-rates";

const buildRatesSnapshot = (rates: Record<string, number>, source: ExchangeRates["source"], updatedAt?: string): ExchangeRates => ({
  rates,
  php: rates.PHP ?? fallbackRates.php,
  sgd: rates.SGD ?? fallbackRates.sgd,
  updatedAt,
  source,
});

const readCachedRates = (): ExchangeRates | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.rates && typeof parsed.rates === "object") {
      return buildRatesSnapshot(parsed.rates, "cached", parsed.updatedAt);
    }
  } catch {}
  return null;
};

const writeCachedRates = (rates: ExchangeRates) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      rates: rates.rates,
      updatedAt: rates.updatedAt,
    }));
  } catch {}
};

const getInitialRates = (): ExchangeRates => {
  const cached = readCachedRates();
  if (cached) return cached;
  return buildRatesSnapshot({
    PHP: fallbackRates.php,
    SGD: fallbackRates.sgd,
  }, "fallback");
};

export const staticExchangeRates: ExchangeRates = {
  rates: {
    PHP: fallbackRates.php,
    SGD: fallbackRates.sgd,
  },
  php: fallbackRates.php,
  sgd: fallbackRates.sgd,
  source: "fallback",
};

export const formatLiveRateLabel = (rates: ExchangeRates) =>
  `RM 1 = PHP ${rates.php.toFixed(2)} | RM 1 = SGD ${rates.sgd.toFixed(4)}`;

export async function fetchExchangeRates(
  baseCurrency: string = "PHP",
  additionalSymbols: string[] = ["MYR", "SGD"],
): Promise<ExchangeRates> {
  const normalizedBase = baseCurrency.toUpperCase();
  const normalizedSymbols = Array.from(
    new Set(
      additionalSymbols
        .map((symbol) => symbol.toUpperCase())
        .filter((symbol) => Boolean(symbol) && symbol !== normalizedBase),
    ),
  );
  const url = `https://api.frankfurter.dev/v1/latest?base=${normalizedBase}&symbols=${normalizedSymbols.join(",")}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Exchange rate request failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    date?: string;
    rates?: Record<string, number | undefined>;
  };

  const myrPerBase = payload.rates?.MYR;
  if (!myrPerBase) {
    throw new Error("Missing MYR conversion rate");
  }

  const normalizedRates: Record<string, number> = {};
  const basePerMyr = 1 / myrPerBase;
  normalizedRates[normalizedBase] = basePerMyr;

  for (const symbol of normalizedSymbols) {
    if (symbol === "MYR") continue;
    if (symbol === normalizedBase) {
      normalizedRates[symbol] = basePerMyr;
      continue;
    }

    const symbolPerBase = payload.rates?.[symbol];
    if (!symbolPerBase) continue;
    normalizedRates[symbol] = symbolPerBase / myrPerBase;
  }

  return buildRatesSnapshot(normalizedRates, "live", payload.date);
}

export const useLiveExchangeRates = (additionalSymbols: string[] = ["MYR", "SGD"]) => {
  const [rates, setRates] = useState<ExchangeRates>(getInitialRates);
  // Use a stable string key so array identity changes don't cause spurious refetches
  const symbolsKey = additionalSymbols.join(",");

  useEffect(() => {
    let cancelled = false;
    const symbols = symbolsKey ? symbolsKey.split(",") : ["MYR", "SGD"];

    const loadRates = async () => {
      try {
        const live = await fetchExchangeRates("PHP", ["MYR", ...symbols]);
        if (cancelled) return;
        writeCachedRates(live);
        setRates(live);
      } catch {
        // Keep current rates (cached or fallback)
      }
    };

    void loadRates();

    return () => {
      cancelled = true;
    };
  }, [symbolsKey]);

  return rates;
};
