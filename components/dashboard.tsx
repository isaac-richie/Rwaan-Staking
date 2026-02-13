"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

import { Hero } from "@/components/hero";
import { AdminPanel } from "@/components/admin/AdminPanel";

import { PositionsTable } from "@/components/positions-table";
import { ReferralSummary } from "@/components/referrals/referral-summary";
import { Section } from "@/components/section";
import { AprTierMeter } from "@/components/staking/apr-tier-meter";
import { PlanCards } from "@/components/staking/plan-cards";
import { RewardPreview } from "@/components/staking/reward-preview";
import { RewardRunway } from "@/components/staking/reward-runway";
import { StakingActionsPanel } from "@/components/staking/staking-actions-panel";
import { StatsRow } from "@/components/stats-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";

export function Dashboard() {

  const mounted = useMounted();
  const { address } = useAccount();
  const plansRef = useRef<HTMLDivElement | null>(null);
  const hasGuided = useRef(false);
  const forceAdminPreview = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === "true";

  useEffect(() => {
    if (address && plansRef.current && !hasGuided.current) {
      plansRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      hasGuided.current = true;
    }
  }, [address]);

  return (
    <div className="flex flex-col gap-12">
      <Hero />
      <Section
        id="staking-plans"
        title="Staking plans"
        description="Compare fixed-term plans with clear APR and withdrawal rules."
      >
        <div id="plans" ref={plansRef} className="scroll-mt-28">
          <PlanCards />
        </div>
      </Section>
      <Section
        title="Reward preview"
        description="Estimate rewards before you stake."
      >
        <RewardPreview />
      </Section>
      <Section
        title="Live metrics"
        description="Track the live APR tier, runway, and referral bonuses."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <AprTierMeter />
          <RewardRunway />
          <ReferralSummary />
        </div>
      </Section>
      <Section
        title="Open a position"
        description="Select a plan, approve $Rwaan, and stake with confidence."
      >
        <div id="stake-rwan" className="scroll-mt-28">
          <StakingActionsPanel />
        </div>
      </Section>
      <Section
        title="Your dashboard"
        description="Track positions, rewards, and unlocks."
      >
        {!mounted ? (
          <>
            {/* SSR skeleton to prevent hydration mismatch */}
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="glass glass-solid rounded-2xl p-5 h-24" />
              <Skeleton className="glass glass-solid rounded-2xl p-5 h-24" />
              <Skeleton className="glass glass-solid rounded-2xl p-5 h-24" />
            </div>
            <Skeleton className="glass glass-solid rounded-2xl p-6 h-48" />
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-12 w-32" />
            </div>
          </>
        ) : (
          <>
            {/* CRITICAL: Only show stats when wallet connected */}
            {address && <StatsRow showData={Boolean(address)} />}
            {address ? (
              <PositionsTable />
            ) : (
              <div className="glass glass-solid rounded-2xl p-6 text-sm text-muted-foreground">
                Wallet required to view your dashboard.
              </div>
            )}
          </>
        )}
      </Section>
      {/* Admin Panel - only shows if user is owner */}
      {mounted && <AdminPanel forceShow={forceAdminPreview} />}

    </div>
  );
}
