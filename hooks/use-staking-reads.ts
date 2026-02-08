import { useMemo } from "react";
import { useAccount, useContractRead, useContractReads } from "wagmi";

import { RWAN_STAKING_ABI, RWAN_STAKING_ADDRESS } from "@/lib/contracts/rwanStakingAbi";
import { MAX_LOCK_OPTIONS } from "@/lib/utils/constants";
import type { LockOption } from "@/types/staking";
import type { AprTier } from "@/lib/utils/staking";

export function useTotalStaked() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "totalStaked",
    watch: true,
  });
}

export function useStakingToken() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "stakingToken",
    watch: false,
  });
}

export function useOwner() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "owner",
    watch: false,
  });
}

export function useUserPositionIds() {
  const { address } = useAccount();
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "userPositions",
    args: address ? [address] : undefined,
    enabled: Boolean(address),
    watch: true,
  });
}

export function useLockOptions() {
  const count = useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "lockOptionsLength",
    watch: false,
  });

  const size = Math.min(Number(count.data ?? 0), MAX_LOCK_OPTIONS);

  const optionsResult = useContractReads({
    contracts: Array.from({ length: size }).map((_, index) => ({
      address: RWAN_STAKING_ADDRESS,
      abi: RWAN_STAKING_ABI,
      functionName: "lockOptions",
      args: [BigInt(index)],
    })),
    watch: false,
  });

  const options = useMemo(() => {
    return (
      optionsResult.data
        ?.map((item, index) => {
          const result = item.result as
            | {
                duration: bigint;
                multiplierBps: bigint;
                active: boolean;
              }
            | {
                duration: bigint;
                multiplierBps: bigint;
                enabled: boolean;
              }
            | readonly [bigint, bigint, boolean]
            | undefined;
          if (!result) return null;
          const duration =
            "duration" in result ? result.duration : result[0];
          const multiplierBps =
            "multiplierBps" in result ? result.multiplierBps : result[1];
          const active =
            "active" in result
              ? result.active
              : "enabled" in result
                ? result.enabled
                : result[2];
          return {
            id: BigInt(index),
            duration,
            multiplierBps,
            active,
          } satisfies LockOption;
        })
        .filter(Boolean) ?? []
    );
  }, [optionsResult.data]);

  return {
    count,
    options,
    isLoading: count.isLoading || optionsResult.isLoading,
    error: count.error ?? optionsResult.error,
  };
}

export function useAprTiers() {
  const count = useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "aprTiersLength",
    watch: false,
    cacheTime: 10_000,
  });

  const size = Math.min(Number(count.data ?? 0), 25);

  const tiersResult = useContractReads({
    contracts: Array.from({ length: size }).map((_, index) => ({
      address: RWAN_STAKING_ADDRESS,
      abi: RWAN_STAKING_ABI,
      functionName: "aprTiers",
      args: [BigInt(index)],
    })),
    watch: false,
    cacheTime: 10_000,
  });

  const tiers = useMemo(() => {
    return (
      tiersResult.data
        ?.map((item) => {
          const result = item.result as
            | {
                minTVL: bigint;
                aprBps: bigint;
              }
            | readonly [bigint, bigint]
            | undefined;
          if (!result) return null;
          const minTVL = "minTVL" in result ? result.minTVL : result[0];
          const aprBps = "aprBps" in result ? result.aprBps : result[1];
          return { minTVL, aprBps } satisfies AprTier;
        })
        .filter(Boolean) ?? []
    );
  }, [tiersResult.data]);

  return {
    count,
    tiers,
    isLoading: count.isLoading || tiersResult.isLoading,
    error: count.error ?? tiersResult.error,
  };
}

export function useCurrentAprBps() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "currentAprBps",
    watch: true,
  });
}

export function useTotalWeightedStaked() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "totalWeightedStaked",
    watch: true,
  });
}

export function useRewardReserve() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "rewardReserve",
    watch: true,
    cacheTime: 5_000,
    staleTime: 5_000,
  });
}

// Contract State
export function usePaused() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "paused",
    watch: true,
  });
}

export function useMinStakeAmount() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "minStakeAmount",
  });
}

export function useMaxPositionsPerUser() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "maxPositionsPerUser",
  });
}

export function useReferralBps() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "referralBps",
  });
}

export function useMinReferrerStake() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "minReferrerStake",
  });
}

export function useReferralsPaused() {
  return useContractRead({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "referralsPaused",
  });
}
