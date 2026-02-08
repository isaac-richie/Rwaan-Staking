/**
 * Strict disconnect enforcer
 * Ensures complete wallet disconnection and state cleanup
 */

"use client";

import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";

export function useStrictDisconnect() {
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  useEffect(() => {
    // CRITICAL: If Privy says not authenticated but wagmi says connected, force disconnect
    if (!authenticated && isConnected && address) {
      console.log("[StrictDisconnect] Privy logged out but wagmi still connected - forcing disconnect");
      
      // Disconnect wagmi
      disconnect();
      
      // Clear all queries
      queryClient.clear();
      queryClient.invalidateQueries();
    }
  }, [authenticated, isConnected, address, disconnect, queryClient]);
}
