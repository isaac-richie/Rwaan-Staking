/**
 * Auto-switch to BSC chain when wallet connects
 * Privy-aware chain switching hook
 */

"use client";

import { useEffect } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { bsc } from "wagmi/chains";

export function useAutoSwitchToBsc() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    // Only attempt switch if wallet is connected
    const walletConnected = isConnected && !!address;
    
    if (!walletConnected) return;
    if (!chain) return;
    if (!switchNetwork) return;

    // If not on BSC, auto-switch
    if (chain.id !== bsc.id) {
      console.log("[AutoSwitch] Switching to BSC chain from", chain.name);
      
      try {
        switchNetwork(bsc.id);
      } catch (error) {
        console.error("[AutoSwitch] Failed to switch to BSC:", error);
      }
    }
  }, [address, isConnected, chain, switchNetwork]);
}
