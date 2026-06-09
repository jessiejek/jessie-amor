import { useEffect, useState } from "react";
import { exchangeRates as fallbackRates } from "../data/itinerary";

export type ExchangeRates = {
  php: number;
  sgd: number;
  updatedAt?: string;
  source: "live" | "cached" | "fallback";
};

// Fetch live rates with PHP as the API base, then normalize them back into the
// app's existing RM-based conversion shape so stored budget data stays stable.
const FRANKFURTER_LATEST_URL = "https://api.frankfurter.dev/v1/latest?base=PHP&symbols=MYR,SGD";
const CACHE_KEY = "ja-exchange-rates";

const readCachedRates = (): ExchangeRates | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.php && parsed?.sgd) {
      return { php: parsed.php, sgd: parsed.sgd, updatedAt: parsed.updatedAt, source: "cached" };
    }
  } catch {}
  return null;
};

const writeCachedRates = (rates: ExchangeRates) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      php: rates.php,
      sgd: rates.sgd,
      updatedAt: rates.updatedAt,
    }));
  } catch {}
};

const getInitialRates = (): ExchangeRates => {
  const cached = readCachedRates();
  if (cached) return cached;
  return {
    php: fallbackRates.php,
    sgd: fallbackRates.sgd,
    source: "fallback",
  };
};

export const staticExchangeRates: ExchangeRates = {
  php: fallbackRates.php,
  sgd: fallbackRates.sgd,
  source: "fallback",
};

export const formatLiveRateLabel = (rates: ExchangeRates) =>
  `RM 1 = PHP ${rates.php.toFixed(2)} | RM 1 = SGD ${rates.sgd.toFixed(4)}`;

export const useLiveExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates>(getInitialRates);

  useEffect(() => {
    let cancelled = false;

    const loadRates = async () => {
      try {
        const response = await fetch(FRANKFURTER_LATEST_URL, { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          base?: string;
          date?: string;
          rates?: {
            MYR?: number;
            PHP?: number;
            SGD?: number;
          };
        };

        const myrPerPhp = payload.rates?.MYR;
        const sgdPerPhp = payload.rates?.SGD;
        if (!myrPerPhp || !sgdPerPhp || cancelled) return;

        const phpPerMyr = 1 / myrPerPhp;
        const sgdPerMyr = sgdPerPhp / myrPerPhp;

        const live: ExchangeRates = {
          php: phpPerMyr,
          sgd: sgdPerMyr,
          updatedAt: payload.date,
          source: "live",
        };
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
  }, []);

  return rates;
};
