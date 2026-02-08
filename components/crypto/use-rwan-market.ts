"use client";

import { useEffect, useState } from "react";

type RwanMarketData = {
  fully_diluted_valuation?: { usd?: number };
};

type RwanMarketResponse = {
  market_data?: RwanMarketData;
};

const RWAN_FDV_FALLBACK = 42_000_000;

export function useRwanMarket() {
  const [fdv, setFdv] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchMarket = async () => {
      try {
        setError(null);
        const response = await fetch("/api/rwan-market", {
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Market feed error: ${response.status}`);
        }
        const data = (await response.json()) as RwanMarketResponse;
        const nextFdv = data.market_data?.fully_diluted_valuation?.usd ?? null;
        if (active) {
          setFdv(nextFdv ?? RWAN_FDV_FALLBACK);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to fetch FDV.");
          setFdv(RWAN_FDV_FALLBACK);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 30_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { fdv, isLoading, error };
}
