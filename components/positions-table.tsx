import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCountdown } from "@/hooks/use-countdown";
import { usePositionsWithRewards } from "@/hooks/use-positions";
import { useTransactionToasts } from "@/hooks/use-transaction-toasts";
import { useAprTiers, useCurrentAprBps, useLockOptions, useTotalStaked } from "@/hooks/use-staking-reads";
import { useClaimPosition, useWithdrawPosition } from "@/hooks/use-staking-writes";
import { useWithdrawEarly, useEarlyWithdrawalPenalty } from "@/hooks/use-early-withdrawal";
import { useMounted } from "@/hooks/use-mounted";
import { RWAN_DECIMALS, STAKING_PLANS } from "@/lib/utils/constants";
import { formatBps, formatDateFromSeconds, formatToken, formatUsd } from "@/lib/utils/format";
import { AprTier, aprForTVL } from "@/lib/utils/staking";
import { EarlyWithdrawModal } from "@/components/modals/early-withdraw-modal";
import { useCryptoPrices } from "@/components/crypto/use-crypto-prices";

export function PositionsTable({ decimals = RWAN_DECIMALS }: { decimals?: number }) {
  const mounted = useMounted();
  const { address } = useAccount();
  const { positions, isLoading } = usePositionsWithRewards();
  const { claim, isPending: isClaimPending } = useClaimPosition();
  const { withdraw, isPending: isWithdrawPending } = useWithdrawPosition();
  const { writeAsync: withdrawEarly, isLoading: isWithdrawEarlyPending } = useWithdrawEarly();
  const { trackTx } = useTransactionToasts();
  const lockOptions = useLockOptions();
  const totalStaked = useTotalStaked();
  const aprTiers = useAprTiers();
  const currentApr = useCurrentAprBps();
  const { prices } = useCryptoPrices();
  const rwanPriceUsd = prices.find((item) => item.symbol === "$Rwaan")?.priceUsd ?? 0;
  
  // Track which specific position is being claimed/withdrawn
  const [pendingClaimId, setPendingClaimId] = useState<bigint | null>(null);
  const [pendingWithdrawId, setPendingWithdrawId] = useState<bigint | null>(null);
  const [earlyWithdrawModalOpen, setEarlyWithdrawModalOpen] = useState(false);
  const [selectedPositionForEarlyWithdraw, setSelectedPositionForEarlyWithdraw] = useState<bigint | null>(null);

  // Calculate values (must be before any conditional returns)
  const totalPending = useMemo(
    () => positions.reduce((sum, position) => sum + position.pendingRewards, 0n),
    [positions]
  );

  const baseAprBps = useMemo(() => {
    if (currentApr.data !== undefined) return BigInt(currentApr.data);
    if (!totalStaked.data) return 0n;
    const tiers = aprTiers.tiers.filter(Boolean) as AprTier[];
    if (tiers.length === 0) return 0n;
    return aprForTVL(totalStaked.data, tiers);
  }, [currentApr.data, totalStaked.data, aprTiers.tiers]);

  const lockOptionsMap = useMemo(() => {
    const options = lockOptions.options.filter(
      (option): option is NonNullable<typeof option> => Boolean(option)
    );
    return new Map(options.map((option) => [option.id, option]));
  }, [lockOptions.options]);

  const handleClaim = async (positionId: bigint) => {
    // CRITICAL: Prevent claim if wallet disconnected
    if (!address) {
      console.error("[PositionsTable] Cannot claim without connected wallet");
      return;
    }
    
    setPendingClaimId(positionId);
    const hash = await claim(positionId);
    if (!hash) {
      setPendingClaimId(null);
      return;
    }
    
    // Find position to get reward amount
    const position = positions.find(p => p.id === positionId);
    const rewardAmount = position ? formatToken(position.pendingRewards, decimals) : "0";
    
    trackTx(hash, {
      title: "Claim rewards",
      successMessage: "Rewards claimed.",
      errorMessage: "Claim failed.",
      retry: () => handleClaim(positionId),
      action: "Claimed",
      amount: `${rewardAmount} $Rwaan`,
    });
    // Clear pending state after transaction is submitted
    setPendingClaimId(null);
  };

  const handleWithdraw = async (positionId: bigint) => {
    // CRITICAL: Prevent withdraw if wallet disconnected
    if (!address) {
      console.error("[PositionsTable] Cannot withdraw without connected wallet");
      return;
    }
    
    setPendingWithdrawId(positionId);
    const hash = await withdraw(positionId);
    if (!hash) {
      setPendingWithdrawId(null);
      return;
    }
    
    // Find position to get staked amount
    const position = positions.find(p => p.id === positionId);
    const stakedAmount = position ? formatToken(position.amount, decimals) : "0";
    
    trackTx(hash, {
      title: "Withdraw position",
      successMessage: "Position withdrawn.",
      errorMessage: "Withdraw failed.",
      retry: () => handleWithdraw(positionId),
      action: "Withdrew",
      amount: `${stakedAmount} $Rwaan`,
    });
    // Clear pending state after transaction is submitted
    setPendingWithdrawId(null);
  };

  const handleRequestEarlyWithdraw = (positionId: bigint) => {
    setSelectedPositionForEarlyWithdraw(positionId);
    setEarlyWithdrawModalOpen(true);
  };

  const handleConfirmEarlyWithdraw = async () => {
    if (!selectedPositionForEarlyWithdraw || !address) return;
    
    setEarlyWithdrawModalOpen(false);
    setPendingWithdrawId(selectedPositionForEarlyWithdraw);
    
    try {
      const result = await withdrawEarly?.({ args: [selectedPositionForEarlyWithdraw] });
      const hash = result?.hash;
      
      if (!hash) {
        setPendingWithdrawId(null);
        setSelectedPositionForEarlyWithdraw(null);
        return;
      }
      
      const position = positions.find(p => p.id === selectedPositionForEarlyWithdraw);
      const stakedAmount = position ? formatToken(position.amount, decimals) : "0";
      
      trackTx(hash, {
        title: "Early withdrawal",
        successMessage: "Position withdrawn (35% penalty applied).",
        errorMessage: "Early withdrawal failed.",
        retry: handleConfirmEarlyWithdraw,
        action: "Withdrew Early",
        amount: `${stakedAmount} $Rwaan`,
      });
    } catch (error) {
      console.error("Early withdrawal error:", error);
    } finally {
      setPendingWithdrawId(null);
      setSelectedPositionForEarlyWithdraw(null);
    }
  };

  // Show skeleton during SSR
  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // If wallet disconnected, show empty state
  if (!address) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
        <EmptyState
          title="Connect wallet"
          description="Connect your wallet to view your staking positions."
        />
      </div>
    );
  }

  // If no positions, show empty state
  if (!isLoading && positions.length === 0) {
    return (
      <EmptyState
        title="No positions yet"
        description="Stake $Rwaan to open your first position. Each stake creates its own reward stream."
      />
    );
  }

  return (
    <div className="glass glass-solid interactive-card rounded-2xl p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">Your positions</div>
          <div className="text-xs text-muted-foreground">
            Total accrued interest: {formatToken(totalPending, decimals)} $Rwaan
          </div>
        </div>
        <Badge variant="accent">{positions.length} positions</Badge>
      </div>
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>APR</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Unlock Date</TableHead>
            <TableHead>Accrued Interest</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : positions.map((position) => (
                <PositionRow
                  key={position.id.toString()}
                  position={position}
                  decimals={decimals}
                  onClaim={handleClaim}
                  onWithdraw={handleWithdraw}
                  onEarlyWithdraw={handleRequestEarlyWithdraw}
                  isClaimPending={pendingClaimId === position.id}
                  isWithdrawPending={pendingWithdrawId === position.id}
                  baseAprBps={baseAprBps}
                  lockOption={lockOptionsMap.get(position.lockId)}
                  walletConnected={Boolean(address)}
                  priceUsd={rwanPriceUsd}
                />
              ))}
        </TableBody>
      </Table>
      
      {/* Early Withdrawal Modal */}
      <EarlyWithdrawModal
        open={earlyWithdrawModalOpen}
        penaltyAmount={
          selectedPositionForEarlyWithdraw
            ? formatToken(
                (positions.find(p => p.id === selectedPositionForEarlyWithdraw)?.amount ?? 0n) * 35n / 100n,
                decimals
              )
            : "0"
        }
        onConfirm={handleConfirmEarlyWithdraw}
        onClose={() => {
          setEarlyWithdrawModalOpen(false);
          setSelectedPositionForEarlyWithdraw(null);
        }}
      />
    </div>
  );
}

function PositionRow({
  position,
  decimals,
  onClaim,
  onWithdraw,
  onEarlyWithdraw,
  isClaimPending,
  isWithdrawPending,
  baseAprBps,
  lockOption,
  walletConnected,
  priceUsd,
}: {
  position: {
    id: bigint;
    amount: bigint;
    weightedAmount: bigint;
    startTime: bigint;
    unlockTime: bigint;
    lockId: bigint;
    pendingRewards: bigint;
  };
  decimals: number;
  onClaim: (positionId: bigint) => void;
  onWithdraw: (positionId: bigint) => void;
  onEarlyWithdraw: (positionId: bigint) => void;
  isClaimPending: boolean;
  isWithdrawPending: boolean;
  baseAprBps: bigint;
  lockOption?: { id: bigint; duration: bigint; multiplierBps: bigint; active: boolean };
  walletConnected: boolean;
  priceUsd: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const unlockAt = position.unlockTime > 0n ? Number(position.unlockTime) : null;
  const { remaining, isUnlocked } = useCountdown(unlockAt);
  const plan = lockOption
    ? STAKING_PLANS.find(
        (item) => BigInt(item.durationSeconds) === lockOption.duration
      )
    : undefined;

  const multiplierBps =
    position.amount > 0n
      ? (position.weightedAmount * 10_000n) / position.amount
      : 10_000n;
  const effectiveAprBps =
    baseAprBps > 0n ? (baseAprBps * multiplierBps) / 10_000n : 0n;
  const isClaimable = position.pendingRewards > 0n;
  const isFlexible = position.unlockTime === 0n;

  return (
    <>
      <TableRow className="border-b border-white/5 animate-fade-in">
        <TableCell>
          <div className="flex flex-col">
            <span>{formatToken(position.amount, decimals)} $Rwaan</span>
            <span className="text-xs text-muted-foreground">
              {priceUsd > 0
                ? `≈ ${formatUsd(
                    Number(formatUnits(position.amount, decimals)) * priceUsd
                  )}`
                : "—"}
            </span>
          </div>
        </TableCell>
        <TableCell>{plan?.label ?? (isFlexible ? "Flexible" : "Custom")}</TableCell>
        <TableCell>{effectiveAprBps ? formatBps(effectiveAprBps) : "—"}</TableCell>
        <TableCell>{formatDateFromSeconds(Number(position.startTime))}</TableCell>
        <TableCell>
          {unlockAt ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">
                    {formatDateFromSeconds(unlockAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {isUnlocked
                    ? "Position unlocked."
                    : `${Math.floor(remaining / 86400)}d ${Math.floor(
                        (remaining % 86400) / 3600
                      )}h remaining`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            "Flexible"
          )}
        </TableCell>
        <TableCell>
          {`${formatToken(position.pendingRewards, decimals)} $Rwaan`}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-wrap justify-end gap-2">
            {/* CRITICAL: Only show buttons if wallet connected */}
            {!walletConnected ? (
              <div className="text-xs text-muted-foreground italic">
                Connect wallet
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!isClaimable || isClaimPending}
                  onClick={() => onClaim(position.id)}
                >
                  {isClaimPending ? "Claiming..." : "Claim"}
                </Button>
                {/* Normal Withdraw Button - Only enabled if unlocked or flexible */}
                {(isFlexible || isUnlocked) ? (
                  <Button
                    size="sm"
                    disabled={isWithdrawPending}
                    onClick={() => onWithdraw(position.id)}
                  >
                    {isWithdrawPending ? "Withdrawing..." : "Withdraw"}
                  </Button>
                ) : (
                  /* Early Withdraw Button - For locked positions before unlock */
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                    disabled={isWithdrawPending}
                    onClick={() => onEarlyWithdraw(position.id)}
                  >
                    {isWithdrawPending ? "Withdrawing..." : "Withdraw Early (35% penalty)"}
                  </Button>
                )}
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} className="pb-5 pt-1">
          <PositionTimeline
            startTime={position.startTime}
            unlockTime={position.unlockTime}
          />
        </TableCell>
      </TableRow>
    </>
  );
}

function PositionTimeline({
  startTime,
  unlockTime,
}: {
  startTime: bigint;
  unlockTime: bigint;
}) {
  const start = Number(startTime);
  const unlock = unlockTime > 0n ? Number(unlockTime) : null;
  const now = Math.floor(Date.now() / 1000);
  const accrualStart = start;

  if (!unlock) {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded-full bg-emerald-400/80 px-2 py-0.5 text-[10px] font-semibold text-black">
          Flexible
        </span>
        <span>Rewards accrue immediately.</span>
      </div>
    );
  }

  const total = Math.max(unlock - start, 1);
  const progress = Math.min(Math.max((now - start) / total, 0), 1);
  const progressPct = `${Math.round(progress * 100)}%`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Start {formatDateFromSeconds(start)}</span>
        <span>Unlock {formatDateFromSeconds(unlock)}</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
          style={{ width: progressPct }}
        />
        <span className="absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
        <span className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Claimable anytime.</span>
        <span>{Math.round(progress * 100)}% elapsed</span>
      </div>
    </div>
  );
}
