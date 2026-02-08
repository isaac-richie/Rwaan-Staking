"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAprTiers, useCurrentAprBps, useLockOptions, useTotalStaked } from "@/hooks/use-staking-reads";
import { useMounted } from "@/hooks/use-mounted";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { STAKING_PLANS } from "@/lib/utils/constants";
import { formatBps, formatUsd } from "@/lib/utils/format";
import { AprTier, aprForTVL } from "@/lib/utils/staking";
import { useCryptoPrices } from "@/components/crypto/use-crypto-prices";

const YEAR_SECONDS = 365 * 24 * 60 * 60;

export function RewardPreview() {
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState("1000");
  const [selectedPlanId, setSelectedPlanId] = useState("flexible");
  const lockOptions = useLockOptions();
  const totalStaked = useTotalStaked();
  const aprTiers = useAprTiers();
  const currentApr = useCurrentAprBps();
  const { prices } = useCryptoPrices();
  const rwanPriceUsd = prices.find((item) => item.symbol === "$Rwaan")?.priceUsd ?? 0;

  const planOptions = useMemo(
    () => [
      { id: "flexible", label: "Flexible", durationSeconds: 0 },
      ...STAKING_PLANS,
    ],
    []
  );

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

  const selectedPlan = planOptions.find((plan) => plan.id === selectedPlanId);
  const selectedOption = lockOptions.options
    .filter(
      (option): option is NonNullable<typeof option> => Boolean(option)
    )
    .find(
      (option) =>
        Boolean(selectedPlan) &&
        option.duration === BigInt(selectedPlan!.durationSeconds)
    );

  const multiplierBps =
    selectedPlanId === "flexible"
      ? 10_000n
      : selectedOption?.multiplierBps ? BigInt(selectedOption.multiplierBps) : 10_000n;
  const effectiveAprBps =
    baseAprBps > 0n ? (baseAprBps * multiplierBps) / 10_000n : 0n;

  const normalizedAmount = amount.replace(/,/g, "").trim();
  const parsedAmount = Number(normalizedAmount);
  const amountUsd =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && rwanPriceUsd > 0
      ? parsedAmount * rwanPriceUsd
      : null;
  const yearlyReward =
    Number.isFinite(parsedAmount) && parsedAmount > 0
      ? (parsedAmount * Number(effectiveAprBps)) / 10_000
      : 0;
  const periodReward =
    selectedPlan && selectedPlan.durationSeconds > 0
      ? (yearlyReward * selectedPlan.durationSeconds) / YEAR_SECONDS
      : yearlyReward / 12;

  return (
    <motion.div
      initial={isMobile ? false : { opacity: 0, y: 12 }}
      whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
      viewport={isMobile ? undefined : { once: true, amount: 0.2 }}
      transition={isMobile ? undefined : { duration: 0.3 }}
      className="glass glass-solid interactive-card rounded-2xl p-5 sm:p-6"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Staking simulator
      </div>
      <div className="mt-3 grid gap-3 sm:gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-3">
          <Input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Amount to stake"
            inputMode="decimal"
          />
          <div className="text-xs text-muted-foreground">
            {amountUsd !== null ? `≈ ${formatUsd(amountUsd)}` : "—"}
          </div>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              {planOptions.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Base APR:</span>
            <span className="text-foreground">
              {baseAprBps ? formatBps(baseAprBps) : "—"}
            </span>
            <span>· Multiplier:</span>
            <span className="text-foreground">
              {!mounted ? (
                <Skeleton className="inline-block h-4 w-8" />
              ) : (
                `${Number(multiplierBps) / 10_000}x`
              )}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Estimated rewards
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {yearlyReward.toLocaleString(undefined, { maximumFractionDigits: 2 })} $Rwaan/year
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {selectedPlanId === "flexible"
              ? `~${periodReward.toLocaleString(undefined, { maximumFractionDigits: 2 })} $Rwaan/month`
              : `~${periodReward.toLocaleString(undefined, { maximumFractionDigits: 2 })} $Rwaan over ${selectedPlan?.label}`}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Estimates use the current APR tier and assume no compounding.
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Rewards accrue immediately and can be claimed anytime.
        Estimates use current APR tiers and live emissions.
      </div>
    </motion.div>
  );
}
