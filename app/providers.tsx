"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { configureChains } from "wagmi";
import { bsc } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const alchemyRpc = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const { publicClient, webSocketPublicClient, chains } = configureChains(
  [bsc],
  [
    // Priority 1: Alchemy (if configured)
    jsonRpcProvider({
      rpc: () => ({
        http: alchemyRpc || "https://bsc-dataseed.binance.org",
      }),
    }),
    // Priority 2: Binance official RPC (fallback)
    jsonRpcProvider({
      rpc: () => ({
        http: "https://bsc-dataseed1.defibit.io",
      }),
    }),
    // Priority 3: Public node (fallback)
    jsonRpcProvider({
      rpc: () => ({
        http: "https://bsc.publicnode.com",
      }),
    }),
  ]
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  );
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const hasValidPrivyAppId =
    Boolean(privyAppId) && privyAppId !== "your_privy_app_id";
  const safePrivyAppId = privyAppId ?? "";

  return (
    <QueryClientProvider client={queryClient}>
        {hasValidPrivyAppId ? (
        <PrivyProvider
            appId={safePrivyAppId}
          config={{
            loginMethods: ["wallet"],
            appearance: {
              theme: "dark",
              accentColor: "#FACC15",
              logo: undefined,
            },
            // CRITICAL: Disable auto-connect/auto-login
            // Users must explicitly click "Connect wallet"
            embeddedWallets: {
              createOnLogin: "off",
            },
            // Do NOT auto-connect previously connected wallets
            walletConnectCloudProjectId: undefined,
            // Default to BSC chain
            defaultChain: bsc,
            // Supported chains (only BSC)
            supportedChains: [bsc],
          }}
        >
          <PrivyWagmiConnector
            wagmiChainsConfig={{ chains, publicClient, webSocketPublicClient }}
          >
            {children}
          </PrivyWagmiConnector>
        </PrivyProvider>
      ) : (
        <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
          Set `NEXT_PUBLIC_PRIVY_APP_ID` in your `.env` to enable wallet
          connections, then restart `npm run dev`.
        </div>
      )}
    </QueryClientProvider>
  );
}
