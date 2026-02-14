"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";

import { useReferralEarnings } from "@/hooks/use-staking-reads";
import { RWAN_DECIMALS } from "@/lib/utils/constants";
import { formatToken } from "@/lib/utils/format";

export function ReferralSummary() {
  const { address } = useAccount();
  const { data: earnings } = useReferralEarnings(address);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass glass-solid interactive-card rounded-2xl p-5"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Total Referral Earnings
      </div>
      <div className="mt-3 text-2xl font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
        {formatToken(earnings ?? 0n, RWAN_DECIMALS)} $Rwaan
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Reward sent instantly to wallet
      </div>
    </motion.div>
  );
}
