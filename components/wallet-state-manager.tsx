"use client";

/**
 * Global wallet state manager
 * Automatically clears all cached data on wallet disconnect
 * Automatically switches to BSC chain on wallet connect
 * Enforces strict disconnect synchronization
 * Must be mounted at app root level
 */

import { useWalletStateGuard } from "@/hooks/use-wallet-guard";
import { useAutoSwitchToBsc } from "@/hooks/use-auto-switch-bsc";
import { useStrictDisconnect } from "@/hooks/use-strict-disconnect";

export function WalletStateManager() {
  // This hook runs the cleanup logic on disconnect
  useWalletStateGuard();
  
  // This hook auto-switches to BSC on connect
  useAutoSwitchToBsc();
  
  // This hook enforces strict disconnect (Privy + wagmi sync)
  useStrictDisconnect();
  
  // This component doesn't render anything
  return null;
}
