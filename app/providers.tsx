"use client";



// import {
//   RainbowKitProvider,
//   getDefaultConfig,
//   darkTheme,
// } from "@rainbow-me/rainbowkit";
// import {
//   bitgetWallet,
//   coinbaseWallet,
//   metaMaskWallet,
//   rabbyWallet,
//   rainbowWallet,
//   safeWallet,
//   tokenPocketWallet,
//   trustWallet,
// } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider, fallback, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();
const appName = "Rwaan Staking";

// All RPC calls go through our server-side proxy (/api/rpc).
// This avoids CORS errors and keeps Alchemy keys out of the browser.
const rpcUrls = [
  "/api/rpc",
];

// Bitget wallet adapter references `BitVisionWeb` directly in some environments.
// Define it to avoid ReferenceError when the extension is not present.
if (typeof globalThis !== "undefined" && !("BitVisionWeb" in globalThis)) {
  (globalThis as typeof globalThis & { BitVisionWeb?: unknown }).BitVisionWeb = undefined;
}

// const wallets = [
//   {
//     groupName: "Wallets",
//     wallets: [
//       metaMaskWallet,
//       trustWallet,
//       bitgetWallet,
//       rabbyWallet,
//       tokenPocketWallet,
//       coinbaseWallet,
//       rainbowWallet,
//       safeWallet,
//     ],
//   },
// ];

// Create wagmi config using RainbowKit's getDefaultConfig
// const wagmiConfig = getDefaultConfig({
//   appName,
//   projectId: walletConnectProjectId || "00000000000000000000000000000000", // Fallback dummy ID
//   chains: [bsc],
//   transports: {
//     [bsc.id]: fallback(
//       [
//         alchemyRpc,
//         alchemyRpc2,
//         defaultRpc,
//         "https://bsc.publicnode.com",
//       ]
//         .filter(Boolean)
//         .map((url) => http(url as string))
//     ),
//   },
//   wallets,
//   ssr: false, // Disable SSR for Next.js
// });

// 1. Get projectId
const projectId = walletConnectProjectId || "00000000000000000000000000000000";

// 2. Create WagmiAdapter
const wagmiAdapter = new WagmiAdapter({
  networks: [bsc],
  projectId,
  transports: {
    [bsc.id]: fallback(
      rpcUrls.map((url) =>
        http(url, {
          retryCount: 1,
          retryDelay: 1_000,
          timeout: 15_000,
        })
      )
    ),
  },
  ssr: true, // AppKit typically handles SSR better with this flag
});

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [bsc],
  projectId,
  metadata: {
    name: appName,
    description: "Stake $Rwaan on BNB Smart Chain",
    url: "https://rwaan.io", // Update if needed
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
  enableEIP6963: true,
  allWallets: 'HIDE',
  featuredWalletIds: [

    // Rabby
    "ac7dc85f6c2637f63d324460058e52e2a868f77363404c004dc90259b6574c8c",
    // MetaMask
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
    // Bitget
    "38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662",
    // Trust Wallet
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    // TokenPocket
    "20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66",
    // Safe
    "225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f",
  ],
  includeWalletIds: [

    // Rabby
    "ac7dc85f6c2637f63d324460058e52e2a868f77363404c004dc90259b6574c8c",
    // MetaMask
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
    // Bitget
    "38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662",
    // Trust Wallet
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    // TokenPocket
    "20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66",
    // Safe
    "225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f",
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FACC15',
    '--w3m-border-radius-master': '1px'
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchIntervalInBackground: false,
            retry: (failureCount, error) => {
              const message =
                error instanceof Error ? error.message : String(error);
              // Never retry rate-limits — back off instead
              if (
                message.includes("429") ||
                message.toLowerCase().includes("too many requests")
              ) {
                return false;
              }
              // Never retry bad requests — the payload is wrong, retrying won't help
              if (
                message.includes("400") ||
                message.toLowerCase().includes("bad request")
              ) {
                return false;
              }
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1_000 * 2 ** attemptIndex, 10_000),
          },
        },
      })
  );

  const hasWalletConnectProjectId = Boolean(walletConnectProjectId);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        {/* <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#FACC15",
            accentColorForeground: "#0b0f1a",
            overlayBlur: "small",
          })}
          modalSize="wide"
        > */}
        {!hasWalletConnectProjectId ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
            Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in your `.env` to
            enable wallet connections, then restart `npm run dev`.
          </div>
        ) : null}
        {children}
        {/* </RainbowKitProvider> */}
      </WagmiProvider>
    </QueryClientProvider>
  );
}
