import { useContractRead, useContractReads, useContractWrite } from "wagmi";

import { erc20Abi } from "@/lib/contracts/erc20Abi";
import { RWAN_STAKING_ADDRESS } from "@/lib/utils/constants";

export function useTokenMetadata(tokenAddress?: `0x${string}`) {
  const results = useContractReads({
    contracts: tokenAddress
      ? ([
          { address: tokenAddress, abi: erc20Abi, functionName: "name" },
          { address: tokenAddress, abi: erc20Abi, functionName: "symbol" },
          { address: tokenAddress, abi: erc20Abi, functionName: "decimals" },
        ] as const)
      : undefined,
    watch: false,
  });

  return {
    name: results.data?.[0]?.result as string | undefined,
    symbol: results.data?.[1]?.result as string | undefined,
    decimals: results.data?.[2]?.result as number | undefined,
    isLoading: results.isLoading,
  };
}

export function useTokenBalance(
  tokenAddress?: `0x${string}`,
  account?: `0x${string}`
) {
  const hasParams = Boolean(tokenAddress && account);
  return useContractRead({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: hasParams ? [account!] : undefined,
    enabled: hasParams,
    watch: true,
    cacheTime: 5_000,
  });
}

export function useTokenAllowance(
  tokenAddress?: `0x${string}`,
  owner?: `0x${string}`
) {
  const hasParams = Boolean(tokenAddress && owner);
  return useContractRead({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: hasParams ? [owner!, RWAN_STAKING_ADDRESS] : undefined,
    enabled: hasParams,
    watch: true,
    cacheTime: 5_000,
  });
}

export function useApproveToken(tokenAddress?: `0x${string}`) {
  const { writeAsync, isLoading } = useContractWrite({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve",
  });

  const approve = async (amount: bigint) => {
    if (!tokenAddress) throw new Error("Token address not available.");
    const result = await writeAsync?.({
      args: [RWAN_STAKING_ADDRESS, amount],
    });
    return result?.hash;
  };

  return { approve, isPending: isLoading };
}
