"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAprTiers, useCurrentAprBps, useTotalStaked } from "@/hooks/use-staking-reads";
import { useMounted } from "@/hooks/use-mounted";
import { RWAN_DECIMALS } from "@/lib/utils/constants";
import { formatBps, formatToken } from "@/lib/utils/format";
import { AprTier, aprForTVL, clamp } from "@/lib/utils/staking";
import { getCardGlow } from "@/lib/utils/card-styles";
import { cn } from "@/lib/utils/cn";

export function AprTierMeter() {
  const mounted = useMounted();
  const totalStaked = useTotalStaked();
  const aprTiers = useAprTiers();
  const currentApr = useCurrentAprBps();

  const { currentTier, nextTier, progress, aprBps } = useMemo(() => {
    // Calculate base APR with 3-tier fallback
    let baseApr = 0n;
    if (currentApr.data !== undefined && currentApr.data !== null) {
      const aprValue = BigInt(currentApr.data);
      if (aprValue > 0n) baseApr = aprValue;
    }
    
    if (baseApr === 0n) {
      const tiers = aprTiers.tiers.filter(Boolean) as AprTier[];
      if (totalStaked.data !== undefined && totalStaked.data !== null && tiers.length > 0) {
        const calculated = aprForTVL(totalStaked.data, tiers);
        if (calculated > 0n) baseApr = calculated;
      }
    }
    
    // Final fallback to default 16%
    if (baseApr === 0n) {
      baseApr = 1600n;
    }

    const tiers = aprTiers.tiers.filter(Boolean) as AprTier[];
    if (!totalStaked.data || totalStaked.data === 0n || tiers.length === 0) {
      return {
        currentTier: tiers[0] ?? null,
        nextTier: tiers[1] ?? null,
        progress: 0,
        aprBps: baseApr,
      };
    }
    
    const tvl = totalStaked.data;

    let current = tiers[0];
    let next: typeof tiers[0] | null = null;
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (tvl >= tier.minTVL) {
        current = tier;
        next = tiers[i + 1] ?? null;
      } else {
        break;
      }
    }

    const range = next ? Number(next.minTVL - current.minTVL) : 0;
    const travelled = next ? Number(tvl - current.minTVL) : 0;
    const pct = range > 0 ? clamp(travelled / range, 0, 1) : 1;

    return {
      currentTier: current,
      nextTier: next,
      progress: pct,
      aprBps: baseApr,
    };
  }, [totalStaked.data, aprTiers.tiers, currentApr.data]);

  const isLoading = totalStaked.isLoading || aprTiers.isLoading;

  // Prevent hydration mismatch by not rendering contract data during SSR
  if (!mounted) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn("glass glass-solid interactive-card rounded-2xl p-5", getCardGlow('analytics'))}
      >
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Current APR Tier
        </div>
        <div className="mt-3 text-2xl font-semibold">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Loading TVL tiers...
        </div>
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500"
              style={{ width: "0%" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>0 TVL</span>
            <span>Loading...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("glass glass-solid interactive-card rounded-2xl p-5", getCardGlow('analytics'))}
    >
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Current APR Tier
      </div>
      <div className="mt-3 text-2xl font-semibold">
        {isLoading ? <Skeleton className="h-6 w-24" /> : formatBps(aprBps)}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {isLoading ? (
          "Loading TVL tiers..."
        ) : !currentTier ? (
          <>
            TVL now:{" "}
            <span className="text-foreground">
              {totalStaked.data !== undefined 
                ? `${formatToken(totalStaked.data, RWAN_DECIMALS)} $Rwaan`
                : "0 $Rwaan"}
            </span>
          </>
        ) : (
          <>
            TVL now:{" "}
            <span className="text-foreground">
              {formatToken(totalStaked.data, RWAN_DECIMALS)} $Rwaan
            </span>
          </>
        )}
      </div>
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {currentTier
              ? `${formatToken(currentTier.minTVL, RWAN_DECIMALS)} TVL`
              : "0 TVL"}
          </span>
          <span>
            {nextTier
              ? `Next tier at ${formatToken(nextTier.minTVL, RWAN_DECIMALS)}`
              : currentTier
                ? "Top tier reached"
                : "Next: 10M $Rwaan"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
