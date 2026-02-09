import { motion } from "framer-motion";
import { formatUnits } from "viem";

import { Skeleton } from "@/components/ui/skeleton";
import { usePositionsWithRewards } from "@/hooks/use-positions";
import { useAprTiers, useCurrentAprBps, useLockOptions, useTotalStaked } from "@/hooks/use-staking-reads";
import { useMounted } from "@/hooks/use-mounted";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { RWAN_DECIMALS } from "@/lib/utils/constants";
import { formatBps, formatToken, formatUsd } from "@/lib/utils/format";
import { AprTier, aprForTVL } from "@/lib/utils/staking";
import { useCryptoPrices } from "@/components/crypto/use-crypto-prices";

export function StatsRow({
  decimals = RWAN_DECIMALS,
  showData = true,
}: {
  decimals?: number;
  showData?: boolean;
}) {
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const totalStaked = useTotalStaked();
  const { positions } = usePositionsWithRewards();
  const lockOptions = useLockOptions();
  const aprTiers = useAprTiers();
  const currentApr = useCurrentAprBps();
  const { prices } = useCryptoPrices();
  const rwanPriceUsd = prices.find((item) => item.symbol === "$Rwaan")?.priceUsd ?? 0;

  const totalRewards = positions.reduce(
    (sum, position) => sum + position.pendingRewards,
    0n
  );
  const maxMultiplier = lockOptions.options
    .filter(
      (option): option is NonNullable<typeof option> => Boolean(option)
    )
    .reduce<bigint | null>(
      (max, option) => {
        const multiplier = BigInt(option.multiplierBps);
        return max === null || multiplier > max ? multiplier : max;
      },
      null
    );

  const baseAprBps = (() => {
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
  })();
  const maxAprBps =
    maxMultiplier && baseAprBps > 0n
      ? (baseAprBps * maxMultiplier) / 10_000n
      : 0n;
  const totalStakedUsd =
    totalStaked.data !== undefined && rwanPriceUsd > 0
      ? Number(formatUnits(totalStaked.data, decimals)) * rwanPriceUsd
      : null;

  // Prevent hydration mismatch - show skeleton during SSR
  if (!mounted) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          whileHover={isMobile ? undefined : { y: -4 }}
          transition={isMobile ? undefined : { duration: 0.2 }}
          className="glass glass-solid interactive-card rounded-2xl p-4 sm:p-5"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Total Staked
          </div>
          <div className="mt-3 text-2xl font-semibold">
            <Skeleton className="h-6 w-32" />
          </div>
        </motion.div>
        <motion.div
          whileHover={isMobile ? undefined : { y: -4 }}
          transition={isMobile ? undefined : { duration: 0.2 }}
          className="glass glass-solid interactive-card rounded-2xl p-4 sm:p-5"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Base APR
          </div>
          <div className="mt-3 text-2xl font-semibold">
            <Skeleton className="h-6 w-28" />
          </div>
        </motion.div>
        <motion.div
          whileHover={isMobile ? undefined : { y: -4 }}
          transition={isMobile ? undefined : { duration: 0.2 }}
          className="glass glass-solid interactive-card rounded-2xl p-4 sm:p-5"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {showData ? "Your Claimable" : "Connect Wallet"}
          </div>
          <div className="mt-3 text-2xl font-semibold">
            <Skeleton className="h-6 w-28" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
      <motion.div
        whileHover={isMobile ? undefined : { y: -4 }}
        transition={isMobile ? undefined : { duration: 0.2 }}
        className="sleek-card interactive-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1 w-1 rounded-full bg-[#F3BA2F]/50"></span>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Total Staked
          </div>
        </div>
        <div className="mt-3 text-2xl font-semibold">
          {totalStaked.isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : totalStaked.data !== undefined ? (
            <div className="flex flex-col gap-1">
              <span>{formatUsd(totalStakedUsd ?? undefined, 0)}</span>
              <span className="text-sm text-muted-foreground">
                {formatToken(totalStaked.data, decimals)} $Rwaan
              </span>
            </div>
          ) : (
            "—"
          )}
        </div>
      </motion.div>
      <motion.div
        whileHover={isMobile ? undefined : { y: -4 }}
        transition={isMobile ? undefined : { duration: 0.2 }}
        className="sleek-card interactive-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1 w-1 rounded-full bg-[#F3BA2F]/50"></span>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Base APR
          </div>
        </div>
        <div className="mt-3 text-2xl font-semibold">
          {currentApr.isLoading || lockOptions.isLoading ? (
            <Skeleton className="h-6 w-28" />
          ) : baseAprBps > 0n ? (
            formatBps(baseAprBps)
          ) : (
            "—"
          )}
        </div>
      </motion.div>
      <motion.div
        whileHover={isMobile ? undefined : { y: -4 }}
        transition={isMobile ? undefined : { duration: 0.2 }}
        className="sleek-card interactive-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1 w-1 rounded-full bg-[#F3BA2F]/50"></span>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {showData ? "Your Claimable" : "Connect Wallet"}
          </div>
        </div>
        <div className="mt-3 text-2xl font-semibold">
          {!showData ? (
            <span className="text-sm text-muted-foreground">
              Connect to view your rewards
            </span>
          ) : positions.length === 0 ? (
            <span className="text-muted-foreground">No positions</span>
          ) : (
            `${formatToken(totalRewards, decimals)} $Rwaan`
          )}
        </div>
      </motion.div>
    </div>
  );
}
