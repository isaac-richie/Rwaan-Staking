"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAprTiers, useCurrentAprBps, useLockOptions, useTotalStaked } from "@/hooks/use-staking-reads";
import { useMounted } from "@/hooks/use-mounted";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { STAKING_PLANS } from "@/lib/utils/constants";
import { formatBps, formatDuration } from "@/lib/utils/format";
import { AprTier, aprForTVL } from "@/lib/utils/staking";
import { getCardGlow } from "@/lib/utils/card-styles";
import { cn } from "@/lib/utils/cn";

const cardHover = { y: -6 };

export function PlanCards() {
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const lockOptions = useLockOptions();
  const totalStaked = useTotalStaked();
  const aprTiers = useAprTiers();
  const currentApr = useCurrentAprBps();

  const baseAprBps = useMemo(() => {
    // First try: Use on-chain currentAprBps
    if (currentApr.data !== undefined && currentApr.data !== null) {
      const aprValue = BigInt(currentApr.data);
      if (aprValue > 0n) return aprValue;
    }

    // Second try: Calculate from TVL and tiers
    if (totalStaked.data !== undefined && totalStaked.data !== null) {
      const tiers = aprTiers.tiers.filter(Boolean) as AprTier[];
      if (tiers.length > 0) {
        const calculated = aprForTVL(totalStaked.data, tiers);
        if (calculated > 0n) return calculated;
      }
    }

    // Fallback: Return the default APR from constants (1600 bps = 16%)
    return 1600n;
  }, [currentApr.data, totalStaked.data, aprTiers.tiers]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {STAKING_PLANS.map((plan) => (
        (() => {
          const option = lockOptions.options
            .filter(
              (item): item is NonNullable<typeof item> => Boolean(item)
            )
            .find((item) => item.duration === BigInt(plan.durationSeconds));
          const multiplierBps = option?.multiplierBps ? BigInt(option.multiplierBps) : 10_000n;
          const effectiveAprBps =
            baseAprBps > 0n ? (baseAprBps * multiplierBps) / 10_000n : 0n;

          return (
            <motion.div
              key={plan.id}
              whileHover={isMobile ? undefined : cardHover}
              whileTap={{ scale: 0.98 }}
              transition={isMobile ? undefined : { duration: 0.2 }}
              className={cn("sleek-card interactive-card p-6 sm:p-7", getCardGlow('staking'))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-1 w-1 rounded-full bg-[#F3BA2F]"></span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#F3BA2F]/80 font-medium">
                      {plan.label} Plan
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white sm:text-4xl">
                    {formatDuration(plan.durationSeconds)}
                  </div>
                </div>
                <Badge variant="outline" className="border-gold-subtle bg-[#F3BA2F]/10 text-[#F3BA2F] px-4 py-1.5 backdrop-blur-md">
                  {!mounted ? (
                    <Skeleton className="h-4 w-16 bg-[#F3BA2F]/20" />
                  ) : effectiveAprBps ? (
                    <span className="text-sm font-bold tracking-wide">{formatBps(effectiveAprBps)} APR</span>
                  ) : (
                    "APR —"
                  )}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Lock duration</span>
                  <span className="text-foreground">
                    {formatDuration(plan.durationSeconds)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Boost multiplier</span>
                  <span className="text-foreground">
                    {!mounted ? (
                      <Skeleton className="inline-block h-4 w-8" />
                    ) : (
                      `${(Number(multiplierBps) / 10000).toFixed(1)}x`
                    )}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-default items-center justify-between">
                        <span>Claiming</span>
                        <span className="text-foreground">Anytime</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Rewards accrue immediately and can be claimed anytime.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          );
        })()
      ))}
    </div>
  );
}
