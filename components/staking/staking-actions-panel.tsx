"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTokenAllowance, useTokenBalance, useTokenMetadata, useApproveToken } from "@/hooks/use-erc20";
import { useReferral } from "@/hooks/use-referral";
import { useTransactionToasts } from "@/hooks/use-transaction-toasts";
import { useAprTiers, useCurrentAprBps, useLockOptions, useStakingToken, useTotalStaked } from "@/hooks/use-staking-reads";
import { useStakeFlexible, useStakeLocked } from "@/hooks/use-staking-writes";
import {
  RWAN_DECIMALS,
  RWAN_TOKEN_ADDRESS,
  STAKING_PLANS,
} from "@/lib/utils/constants";
import { formatAddress, formatBps, formatToken, formatUsd } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AprTier, aprForTVL } from "@/lib/utils/staking";
import { useCryptoPrices } from "@/components/crypto/use-crypto-prices";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { HowToStakeGuide } from "@/components/staking/how-to-stake-guide";
import { HelpCircle } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";

export function StakingActionsPanel() {
  const mounted = useMounted();
  const { address } = useAccount();
  const tokenAddress = useStakingToken();
  // Use hardcoded token address as fallback if contract read fails
  const effectiveTokenAddress = (tokenAddress.data as `0x${string}` | undefined) ?? RWAN_TOKEN_ADDRESS;
  const tokenMeta = useTokenMetadata(effectiveTokenAddress);
  const decimals = tokenMeta.decimals ?? RWAN_DECIMALS;
  const balance = useTokenBalance(effectiveTokenAddress, address);
  const allowance = useTokenAllowance(effectiveTokenAddress, address);
  const approve = useApproveToken(effectiveTokenAddress);
  const { stakeLocked, isPending: isStakeLockedPending } = useStakeLocked();
  const { stakeFlexible, isPending: isStakeFlexiblePending } = useStakeFlexible();
  const { trackTx } = useTransactionToasts();
  const lockOptions = useLockOptions();
  const totalStaked = useTotalStaked();
  const aprTiers = useAprTiers();
  const currentApr = useCurrentAprBps();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { referrer, shareUrl } = useReferral(address);
  const { prices } = useCryptoPrices();
  const rwanPriceUsd = prices.find((item) => item.symbol === "$Rwaan")?.priceUsd ?? 0;

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"flexible" | "locked">("locked");
  const [selectedPlanId, setSelectedPlanId] = useState<
    (typeof STAKING_PLANS)[number]["id"]
  >(STAKING_PLANS[0].id);
  const [showHowToStake, setShowHowToStake] = useState(false);

  const parsedAmount = useMemo(() => {
    if (!amount) return null;
    try {
      return parseUnits(amount, decimals);
    } catch {
      return null;
    }
  }, [amount, decimals]);

  const normalizedAmount = amount.replace(/,/g, "").trim();
  const amountNumber = Number(normalizedAmount);
  const amountUsd =
    Number.isFinite(amountNumber) && amountNumber > 0 && rwanPriceUsd > 0
      ? amountNumber * rwanPriceUsd
      : null;

  const selectedPlan = STAKING_PLANS.find((plan) => plan.id === selectedPlanId);
  const selectedOption = lockOptions.options
    .filter(
      (option): option is NonNullable<typeof option> => Boolean(option)
    )
    .find(
      (option) =>
        Boolean(selectedPlan) &&
        option.active &&
        option.duration === BigInt(selectedPlan!.durationSeconds)
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

  const balanceFormatted = formatToken(balance.data, decimals);
  const needsApproval =
    parsedAmount !== null &&
    allowance.data !== undefined &&
    allowance.data < parsedAmount;

  const disabled =
    !address ||
    !parsedAmount ||
    parsedAmount <= 0n ||
    tokenAddress.isLoading ||
    !tokenAddress.data ||
    allowance.isLoading;

  const handleApprove = async () => {
    // CRITICAL: Prevent approve if wallet disconnected
    if (!address) {
      console.error("[StakingPanel] Cannot approve without connected wallet");
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to approve tokens.",
      });
      return;
    }
    if (!parsedAmount) return;
    const hash = await approve.approve(parsedAmount);
    if (!hash) return;
    trackTx(hash, {
      title: "Approve $Rwaan",
      successMessage: "Approval confirmed.",
      errorMessage: "Approval failed.",
      retry: handleApprove,
    });
  };

  const handleStakeLocked = async () => {
    // CRITICAL: Prevent stake if wallet disconnected
    if (!address) {
      console.error("[StakingPanel] Cannot stake without connected wallet");
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake.",
      });
      return;
    }
    if (!parsedAmount || !selectedOption) return;
    const hash = await stakeLocked(parsedAmount, selectedOption.id, referrer ?? undefined);
    if (!hash) return;

    // Format the staked amount for notification
    const formattedAmount = formatToken(parsedAmount, decimals);
    const planLabel = STAKING_PLANS.find(p => BigInt(p.durationSeconds) === selectedOption.duration)?.label || "locked";

    trackTx(hash, {
      title: "Stake $Rwaan",
      successMessage: "Locked position created.",
      errorMessage: "Stake failed.",
      retry: handleStakeLocked,
      action: "Staked",
      amount: `${formattedAmount} $Rwaan (${planLabel})`,
    });
    // Trigger confetti celebration
    confetti({
      particleCount: isMobile ? 40 : 100,
      spread: isMobile ? 40 : 70,
      origin: { y: 0.6 },
      colors: ["#F3BA2F", "#ffffff"],
    });
    setAmount("");
  };

  const handleStakeFlexible = async () => {
    // CRITICAL: Prevent stake if wallet disconnected
    if (!address) {
      console.error("[StakingPanel] Cannot stake without connected wallet");
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake.",
      });
      return;
    }
    if (!parsedAmount) return;
    const hash = await stakeFlexible(parsedAmount, referrer ?? undefined);
    if (!hash) return;

    // Format the staked amount for notification
    const formattedAmount = formatToken(parsedAmount, decimals);

    trackTx(hash, {
      title: "Stake $Rwaan",
      successMessage: "Flexible position created.",
      errorMessage: "Stake failed.",
      retry: handleStakeFlexible,
      action: "Staked",
      amount: `${formattedAmount} $Rwaan (Flexible)`,
    });
    // Trigger confetti celebration
    confetti({
      particleCount: isMobile ? 40 : 100,
      spread: isMobile ? 40 : 70,
      origin: { y: 0.6 },
      colors: ["#F3BA2F", "#ffffff"],
    });
    setAmount("");
  };

  const handleCopyReferral = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Referral link copied",
      description: "Share it to earn referral rewards.",
    });
  };

  if (!mounted) {
    return (
      <div className="glass glass-solid rounded-2xl p-6">
        <div className="h-6 w-40 rounded-md bg-white/10" />
        <div className="mt-3 h-4 w-64 rounded-md bg-white/10" />
        <div className="mt-6 h-10 w-full rounded-xl bg-white/10" />
        <div className="mt-4 h-12 w-full rounded-xl bg-white/10" />
      </div>
    );
  }

  return (
    <Card className="glass-solid">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Stake $Rwaan</CardTitle>
            <CardDescription>
              Choose flexible or locked staking, approve $Rwaan, and create a position.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHowToStake(true)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">How to Stake</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!address ? (
          <EmptyState
            title="Wallet required"
            description="Connect your wallet to start staking $Rwaan."
          />
        ) : (
          <>
            {/* Compute active status */}
            {(() => {
              const isFlexibleEnabled = lockOptions.options.some(
                (opt) => opt && opt.duration === 0n && opt.active
              );

              // Filter locked plans: Only show plans if they exist on-chain and are active
              const activeLockedPlans = STAKING_PLANS.filter((plan) => {
                const option = lockOptions.options.find(
                  (opt) => opt && opt.duration === BigInt(plan.durationSeconds)
                );
                return option && option.active;
              });

              return (
                <Tabs value={mode} onValueChange={(value) => setMode((value as "flexible" | "locked"))}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="locked">Locked</TabsTrigger>
                    {isFlexibleEnabled ? (
                      <TabsTrigger value="flexible">Flexible</TabsTrigger>
                    ) : (
                      <TabsTrigger value="flexible" disabled className="opacity-50 cursor-not-allowed">
                        Flexible (Disabled)
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="flexible">
                    {isFlexibleEnabled ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                        Withdraw anytime. No lockup, standard rewards.
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                        Flexible staking is currently disabled for new deposits. Existing positions remain active.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="locked">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeLockedPlans.length > 0 ? (
                        activeLockedPlans.map((plan) => (
                          (() => {
                            const option = lockOptions.options
                              .filter(
                                (item): item is NonNullable<typeof item> =>
                                  Boolean(item)
                              )
                              .find(
                                (item) =>
                                  item.duration === BigInt(plan.durationSeconds)
                              );
                            const multiplierBps = option?.multiplierBps ? BigInt(option.multiplierBps) : 10_000n;
                            const effectiveAprBps =
                              baseAprBps > 0n
                                ? (baseAprBps * multiplierBps) / 10_000n
                                : 0n;
                            return (
                              <motion.button
                                key={plan.id}
                                type="button"
                                whileHover={isMobile ? undefined : { y: -3 }}
                                whileTap={isMobile ? undefined : { scale: 0.98 }}
                                transition={isMobile ? undefined : { duration: 0.18 }}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={cn(
                                  "relative glass rounded-2xl border px-4 py-3 text-left transition-all duration-200 sm:px-5 sm:py-4",
                                  selectedPlanId === plan.id
                                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(250,204,21,0.3)] ring-2 ring-primary/30"
                                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                )}
                              >
                                {/* Selected Indicator */}
                                {selectedPlanId === plan.id && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-black"
                                  >
                                    ✓
                                  </motion.div>
                                )}

                                <div className={cn(
                                  "text-xs uppercase tracking-[0.3em]",
                                  selectedPlanId === plan.id ? "text-primary" : "text-muted-foreground"
                                )}>
                                  Plan
                                </div>
                                <div className={cn(
                                  "mt-2 text-base font-semibold sm:text-lg",
                                  selectedPlanId === plan.id ? "text-primary" : "text-foreground"
                                )}>
                                  {plan.label}
                                </div>
                                <div className={cn(
                                  "mt-1 text-sm",
                                  selectedPlanId === plan.id ? "text-primary/80" : "text-muted-foreground"
                                )}>
                                  {effectiveAprBps ? `${formatBps(effectiveAprBps)} APR` : "APR —"}
                                </div>
                              </motion.button>
                            );
                          })()
                        ))
                      ) : (
                        <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                          No active locked plans available at the moment.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              );
            })()}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Available balance</span>
              <span className="text-foreground">
                {balance.isLoading ? (
                  "Loading..."
                ) : balance.data !== undefined ? (
                  `${balanceFormatted} $Rwaan`
                ) : (
                  "0 $Rwaan"
                )}
              </span>
            </div>
            <Input
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
            />
            <div className="text-xs text-muted-foreground">
              {amountUsd !== null ? `≈ ${formatUsd(amountUsd)}` : "—"}
            </div>

            {mode === "locked" && !selectedOption ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
                Selected plan is not available on-chain yet. Choose another plan.
              </div>
            ) : null}

            {disabled && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                {!address ? (
                  "Wallet required to stake"
                ) : !parsedAmount || parsedAmount <= 0n ? (
                  "Enter amount to stake"
                ) : tokenAddress.isLoading ? (
                  "Loading token info..."
                ) : allowance.isLoading ? (
                  "Checking allowance..."
                ) : (
                  "Checking requirements..."
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* CRITICAL: Only show buttons if wallet is connected */}
              {!address ? (
                <div className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-100">
                  🔒 Wallet required to stake
                </div>
              ) : (
                <>
                  {needsApproval ? (
                    <Button
                      variant="secondary"
                      disabled={disabled || approve.isPending}
                      onClick={handleApprove}
                      className="relative w-full sm:w-auto"
                    >
                      {approve.isPending ? "Approving..." : "Approve"}
                    </Button>
                  ) : null}
                  {/* Capital Button with Halo */}
                  <div className="relative inline-flex">
                    {/* Diffused Halo (behind button) */}
                    {!isMobile && (
                      <div
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-radial from-[#FACC15]/30 via-[#FACC15]/10 to-transparent blur-2xl animate-halo-expand group-hover:animate-none"
                        style={{
                          transform: 'scale(1.8)',
                          filter: 'blur(40px)',
                        }}
                      />
                    )}

                    <Button
                      disabled={
                        disabled ||
                        needsApproval ||
                        (mode === "locked" && !selectedOption) ||
                        (mode === "locked" ? isStakeLockedPending : isStakeFlexiblePending)
                      }
                      onClick={mode === "locked" ? handleStakeLocked : handleStakeFlexible}
                      className="group relative w-full sm:w-auto animate-capital-breathe hover:animate-none active:scale-[0.97] active:transition-transform active:duration-100 disabled:animate-none disabled:opacity-50"
                    >
                      {mode === "locked"
                        ? isStakeLockedPending
                          ? "Staking..."
                          : "Stake locked"
                        : isStakeFlexiblePending
                          ? "Staking..."
                          : "Stake flexible"}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Referral link
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Share your link and earn referral rewards when friends stake.
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  value={shareUrl}
                  placeholder="Wallet required to generate your link"
                  readOnly
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyReferral}
                  disabled={!shareUrl}
                  className="w-full sm:w-auto"
                >
                  Copy link
                </Button>
              </div>
              {referrer ? (
                <div className="mt-2 text-xs text-emerald-200">
                  Referrer applied: {formatAddress(referrer)}
                </div>
              ) : null}
            </div>
          </>
        )}
      </CardContent>

      {/* How to Stake Guide Modal */}
      <HowToStakeGuide open={showHowToStake} onOpenChange={setShowHowToStake} />
    </Card>
  );
}
