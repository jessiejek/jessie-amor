import { useEffect, useState } from "react";
import { exchangeRates as fallbackRates } from "../data/itinerary";

export type ExchangeRates = {
  php: number;
  sgd: number;
  updatedAt?: string;
  source: "live" | "fallback";
};

const FRANKFURTER_LATEST_URL = "https://api.frankfurter.dev/v1/latest?base=MYR&symbols=PHP,SGD";

export const staticExchangeRates: ExchangeRates = {
  php: fallbackRates.php,
  sgd: fallbackRates.sgd,
  source: "fallback",
};

export const formatLiveRateLabel = (rates: ExchangeRates) =>
  `RM 1 = PHP ${rates.php.toFixed(2)} | RM 1 = SGD ${rates.sgd.toFixed(4)}`;

export const useLiveExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates>(staticExchangeRates);

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
            PHP?: number;
            SGD?: number;
          };
        };

        const php = payload.rates?.PHP;
        const sgd = payload.rates?.SGD;
        if (!php || !sgd || cancelled) return;

        setRates({
          php,
          sgd,
          updatedAt: payload.date,
          source: "live",
        });
      } catch {
        // Keep fallback rates on network or API failure.
      }
    };

    void loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  return rates;
};
