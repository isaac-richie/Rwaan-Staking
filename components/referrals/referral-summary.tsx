"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useNotifications } from "@/components/notifications/notifications-provider";
import { RWAN_DECIMALS } from "@/lib/utils/constants";
import { formatToken } from "@/lib/utils/format";

export function ReferralSummary() {
  const { notifications } = useNotifications();

  const { total, count } = useMemo(() => {
    const referralNotifs = notifications.filter(
      (item) => item.kind === "referral"
    );
    const totalAmount = referralNotifs.reduce((sum, item) => {
      if (!item.amount) return sum;
      try {
        return sum + BigInt(item.amount);
      } catch {
        return sum;
      }
    }, 0n);
    return { total: totalAmount, count: referralNotifs.length };
  }, [notifications]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass glass-solid interactive-card rounded-2xl p-5"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Referral rewards
      </div>
      <div className="mt-3 text-2xl font-semibold">
        {formatToken(total, RWAN_DECIMALS)} $Rwaan
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {count === 0
          ? "No referral bonuses yet."
          : `${count} bonus${count === 1 ? "" : "es"} received`}
      </div>
    </motion.div>
  );
}
