"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { usePositionsWithRewards } from "@/hooks/use-positions";
import { useMounted } from "@/hooks/use-mounted";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { RWAN_DECIMALS, RWAN_TOKEN_ADDRESS } from "@/lib/utils/constants";
import { formatToken, formatUsd } from "@/lib/utils/format";
import dynamic from "next/dynamic";
import { useRwanMarket } from "@/components/crypto/use-rwan-market";

const WalletButton = dynamic(
  () => import("@/components/wallet-button").then((mod) => mod.WalletButton),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-28 rounded-full border border-white/10 bg-white/5" />
    ),
  }
);

export function Hero() {
  const { address } = useAccount();
  const { positions } = usePositionsWithRewards();
  const { fdv, isLoading: isFdvLoading } = useRwanMarket();
  const { toast } = useToast();
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const totalRewards = positions.reduce(
    (sum, position) => sum + position.pendingRewards,
    0n
  );

  return (
    <motion.section
      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={isMobile ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-solid mobile-hero-glow relative overflow-hidden rounded-2xl p-6 sm:rounded-[28px] sm:p-8 md:p-14"
    >
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[32px] bg-[#F3BA2F]/25 blur-[140px] animate-hero-glow" />
      <div className="absolute inset-0 bg-radial-glow opacity-80" />
      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-xl flex-col gap-4">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            $Rwaan Staking Protocol
          </div>
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
            Stake $Rwaan. Earn yield. Stay liquid.
          </h1>
          <AnimatePresence initial={false}>
            {showDetails ? (
              <motion.p
                initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isMobile ? undefined : { opacity: 0, y: -8 }}
                transition={isMobile ? { duration: 0 } : { duration: 0.2 }}
                className="text-sm text-muted-foreground md:text-base"
              >
                Stake with confidence. Track every position, claim rewards
                precisely, and unlock at your own pace, built for long-term
                alignment on Binance Smart Chain.
              </motion.p>
            ) : null}
          </AnimatePresence>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Button asChild className="w-full sm:w-auto">
              <a href="#stake-rwan">Stake $Rwaan</a>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDetails((prev) => !prev)}
              className="w-full sm:w-auto"
            >
              {showDetails ? "Hide details" : "How it works"}
            </Button>
            <div className="w-full sm:w-auto">
              {mounted ? (
                <WalletButton />
              ) : (
                <div className="h-10 w-28 rounded-full border border-white/10 bg-white/5" />
              )}
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(RWAN_TOKEN_ADDRESS);
                toast({
                  title: "Contract address copied",
                  description: RWAN_TOKEN_ADDRESS,
                });
              }}
              className="w-full sm:w-auto"
            >
              Contract address
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a
                href={`https://pancakeswap.finance/swap?outputCurrency=${RWAN_TOKEN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                Buy $Rwaan
              </a>
            </Button>
          </div>
        </div>
        <div className="w-full grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm sm:p-6 md:min-w-[260px] md:w-auto">
          <div>
            <div className="text-xs text-muted-foreground">
              Total $Rwaan value
            </div>
            <div className="text-2xl font-semibold min-h-[28px]">
              {isFdvLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                fdv !== null ? formatUsd(fdv, 0) : "—"
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Rewards available</div>
            <div className="text-lg font-semibold min-h-[22px]">
              {!mounted ? (
                <Skeleton className="h-5 w-28" />
              ) : address ? (
                positions.length === 0 ? (
                  "—"
                ) : (
                  `${formatToken(totalRewards, RWAN_DECIMALS)} $Rwaan`
                )
              ) : (
                "Wallet required"
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {address
              ? "Live preview. Personalized to your wallet."
              : "Connect to view rewards."}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
