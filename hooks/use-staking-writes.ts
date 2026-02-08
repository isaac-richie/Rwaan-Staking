import { useContractWrite } from "wagmi";
import { zeroAddress } from "viem";

import { RWAN_STAKING_ABI } from "@/lib/contracts/rwanStakingAbi";
import { RWAN_STAKING_ADDRESS } from "@/lib/utils/constants";

export function useStakeFlexible() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "stake",
  });

  const stakeFlexible = async (amount: bigint, referrer?: `0x${string}`) => {
    const referral = referrer ?? zeroAddress;
    // V3: lockId 0 = flexible/no lock
    const result = await writeAsync?.({ args: [amount, 0n, referral] });
    return result?.hash;
  };

  return { stakeFlexible, isPending: isLoading };
}

export function useStakeLocked() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "stake",
  });

  const stakeLocked = async (
    amount: bigint,
    lockId: bigint,
    referrer?: `0x${string}`
  ) => {
    const referral = referrer ?? zeroAddress;
    const result = await writeAsync?.({ args: [amount, lockId, referral] });
    return result?.hash;
  };

  return { stakeLocked, isPending: isLoading };
}

export function useClaimPosition() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "claim",
  });

  const claim = async (positionId: bigint) => {
    
    const result = await writeAsync?.({ args: [positionId] });
    return result?.hash;
  };

  return { claim, isPending: isLoading };
}

export function useWithdrawPosition() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "withdraw",
  });

  const withdraw = async (positionId: bigint) => {
    
    const result = await writeAsync?.({ args: [positionId] });
    return result?.hash;
  };

  return { withdraw, isPending: isLoading };
}

export function useAddLockOption() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "addLockOption",
  });

  const addLockOption = async (
    duration: number | bigint,
    multiplierBps: number | bigint,
    enabled: boolean
  ) => {
    const result = await writeAsync?.({
      args: [
        BigInt(duration),
        Number(multiplierBps),
        enabled
      ],
    });
    return result?.hash;
  };

  return { addLockOption, isPending: isLoading };
}

export function useSetLockOption() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "setLockOption",
  });

  const setLockOption = async (
    lockId: number | bigint,
    multiplierBps: number | bigint,
    enabled: boolean
  ) => {
    const result = await writeAsync?.({
      args: [
        BigInt(lockId),
        Number(multiplierBps),
        enabled
      ],
    });
    return result?.hash;
  };

  return { setLockOption, isPending: isLoading };
}

export function useFundRewards() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "fundRewards",
  });

  const fundRewards = async (amount: bigint) => {
    
    const result = await writeAsync?.({ args: [amount] });
    return result?.hash;
  };

  return { fundRewards, isPending: isLoading };
}

export function useFundReferralRewards() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "fundReferralRewards",
  });

  const fundReferralRewards = async (amount: bigint) => {
    
    const result = await writeAsync?.({ args: [amount] });
    return result?.hash;
  };

  return { fundReferralRewards, isPending: isLoading };
}

export function useRecoverERC20() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "recoverERC20",
  });

  const recoverERC20 = async (
    token: `0x${string}`,
    amount: bigint
  ) => {
    const result = await writeAsync?.({
      args: [token, amount],
    });
    return result?.hash;
  };

  return { recoverERC20, isPending: isLoading };
}

export function useTransferOwnership() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "transferOwnership",
  });

  const transferOwnership = async (newOwner: `0x${string}`) => {
    
    const result = await writeAsync?.({
      args: [newOwner],
    });
    return result?.hash;
  };

  return { transferOwnership, isPending: isLoading };
}

// Pause/Unpause
export function usePause() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "pause",
  });

  const pause = async () => {
    
    const result = await writeAsync?.();
    return result?.hash;
  };

  return { pause, isPending: isLoading };
}

export function useUnpause() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "unpause",
  });

  const unpause = async () => {
    
    const result = await writeAsync?.();
    return result?.hash;
  };

  return { unpause, isPending: isLoading };
}

// Staking Settings
export function useSetMinStakeAmount() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "setMinStakeAmount",
  });

  const setMinStakeAmount = async (amount: bigint) => {
    
    const result = await writeAsync?.({ args: [amount] });
    return result?.hash;
  };

  return { setMinStakeAmount, isPending: isLoading };
}

export function useSetMaxPositionsPerUser() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "setMaxPositionsPerUser",
  });

  const setMaxPositionsPerUser = async (maxPositions: bigint) => {
    
    const result = await writeAsync?.({ args: [maxPositions] });
    return result?.hash;
  };

  return { setMaxPositionsPerUser, isPending: isLoading };
}

// Referral Settings
export function useSetReferralBps() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "setReferralBps",
  });

  const setReferralBps = async (bps: bigint) => {
    
    const result = await writeAsync?.({ args: [bps] });
    return result?.hash;
  };

  return { setReferralBps, isPending: isLoading };
}

export function useSetMinReferrerStake() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "setMinReferrerStake",
  });

  const setMinReferrerStake = async (amount: bigint) => {
    
    const result = await writeAsync?.({ args: [amount] });
    return result?.hash;
  };

  return { setMinReferrerStake, isPending: isLoading };
}

export function usePauseReferrals() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "pauseReferrals",
  });

  const pauseReferrals = async () => {
    
    const result = await writeAsync?.();
    return result?.hash;
  };

  return { pauseReferrals, isPending: isLoading };
}

export function useUnpauseReferrals() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "unpauseReferrals",
  });

  const unpauseReferrals = async () => {
    
    const result = await writeAsync?.();
    return result?.hash;
  };

  return { unpauseReferrals, isPending: isLoading };
}

export function useEmergencyRecoverRewards() {
  const { writeAsync, isLoading } = useContractWrite({
    address: RWAN_STAKING_ADDRESS,
    abi: RWAN_STAKING_ABI,
    functionName: "emergencyRecoverRewards",
  });

  const emergencyRecoverRewards = async (to: `0x${string}`) => {
    const result = await writeAsync?.({ args: [to] });
    return result?.hash;
  };

  return { emergencyRecoverRewards, isPending: isLoading };
}
