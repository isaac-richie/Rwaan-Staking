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
        <div className="flex max-w-xl flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#F3BA2F] shadow-[0_0_8px_rgba(243,186,47,0.8)]"></span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#F3BA2F]/90">
              Rwaan Staking Protocol
            </span>
          </div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
              }}
              className="block text-white"
            >
              Stake $Rwaan.
            </motion.span>
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
              }}
              className="text-gold-gradient block"
            >
              Earn premium yield.
            </motion.span>
          </motion.h1>

          <AnimatePresence initial={false}>
            {showDetails ? (
              <motion.p
                initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isMobile ? undefined : { opacity: 0, y: -8 }}
                transition={isMobile ? { duration: 0 } : { duration: 0.2 }}
                className="text-sm leading-relaxed text-muted-foreground md:text-base"
              >
                Stake with confidence. Track every position, claim rewards
                precisely, and unlock at your own pace, built for long-term
                alignment on Binance Smart Chain.
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Button asChild className="col-span-2 w-full shadow-[0_0_20px_rgba(243,186,47,0.2)] sm:w-auto mobile-tap press-effect font-semibold text-base py-6">
              <a href="#stake-rwan">Stake Now</a>
            </Button>

            <div className="col-span-2 w-full sm:w-auto">
              {mounted ? (
                <WalletButton />
              ) : (
                <div className="h-12 w-full rounded-full border border-white/10 bg-white/5" />
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(RWAN_TOKEN_ADDRESS);
                toast({
                  title: "Address copied",
                  description: "Contract address copied to clipboard",
                });
              }}
              className="w-full sm:w-auto text-xs h-10 border-white/5 bg-white/5 hover:bg-white/10"
            >
              Copy Address
            </Button>

            <Button asChild variant="secondary" className="w-full sm:w-auto text-xs h-10 border-white/5 bg-white/5 hover:bg-white/10">
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
