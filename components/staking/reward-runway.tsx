"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useAprTiers,
  useCurrentAprBps,
  useRewardReserve,
  useTotalStaked,
  useTotalWeightedStaked,
} from "@/hooks/use-staking-reads";
import { useMounted } from "@/hooks/use-mounted";
import { RWAN_DECIMALS } from "@/lib/utils/constants";
import { formatBps, formatToken } from "@/lib/utils/format";
import { AprTier, aprForTVL } from "@/lib/utils/staking";
import { getCardGlow } from "@/lib/utils/card-styles";
import { cn } from "@/lib/utils/cn";

const YEAR_SECONDS = 365n * 24n * 60n * 60n;
const DAY_SECONDS = 24n * 60n * 60n;

export function RewardRunway() {
  const mounted = useMounted();
  const rewardReserve = useRewardReserve();
  const totalWeighted = useTotalWeightedStaked();
  const totalStaked = useTotalStaked();
  const aprTiers = useAprTiers();
  const currentApr = useCurrentAprBps();

  const { rewardPerDay, runwayDays, aprBps } = useMemo(() => {
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

    // If no weighted stake yet, show APR but no emissions
    if (!totalWeighted.data || totalWeighted.data === 0n) {
      return { rewardPerDay: 0n, runwayDays: null, aprBps: baseApr };
    }

    const rewardRatePerSecond =
      (totalWeighted.data * baseApr) / 10_000n / YEAR_SECONDS;
    const daily = rewardRatePerSecond * DAY_SECONDS;
    
    if (!rewardReserve.data || rewardRatePerSecond === 0n) {
      return { rewardPerDay: daily, runwayDays: null, aprBps: baseApr };
    }
    
    const runwaySeconds = rewardReserve.data / rewardRatePerSecond;
    const days = Number(runwaySeconds / DAY_SECONDS);
    return { rewardPerDay: daily, runwayDays: days, aprBps: baseApr };
  }, [
    totalWeighted.data,
    rewardReserve.data,
    totalStaked.data,
    aprTiers.tiers,
    currentApr.data,
  ]);

  const isLoading =
    rewardReserve.isLoading ||
    totalWeighted.isLoading ||
    totalStaked.isLoading ||
    aprTiers.isLoading;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn("glass glass-solid interactive-card rounded-2xl p-5", getCardGlow('rewards'))}
      >
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Reward Reserve
        </div>
        <div className="mt-3 text-2xl font-semibold">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Estimated runway
          </div>
          <div className="mt-2 text-lg font-semibold">—</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Emissions ≈ — $Rwaan/day
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("glass glass-solid interactive-card rounded-2xl p-5", getCardGlow('rewards'))}
    >
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Reward Reserve
      </div>
      <div className="mt-3 text-2xl font-semibold">
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : rewardReserve.data !== undefined ? (
          `${formatToken(rewardReserve.data, RWAN_DECIMALS)} $Rwaan`
        ) : (
          <span className="text-muted-foreground">Loading...</span>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <>Current base APR: {formatBps(aprBps)}</>
        )}
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Estimated runway
        </div>
        <div className="mt-2 text-lg font-semibold">
          {runwayDays === null ? "—" : `${runwayDays} days`}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Emissions ≈ {formatToken(rewardPerDay, RWAN_DECIMALS)} $Rwaan/day
        </div>
      </div>
    </motion.div>
  );
}
