import "./globals.css";


import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { ToastRoot } from "@/components/toast-root";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/footer";
import { CinematicBackground } from "@/components/backgrounds/cinematic-background";
import { NetworkGuard } from "@/components/network-guard";
import { WalletStateManager } from "@/components/wallet-state-manager";
import { ScrollPerformanceOptimizer } from "@/components/scroll-performance";
import { AppKitModalGuard } from "@/components/appkit-modal-guard";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "$Rwaan Staking",
  description: "Stake $Rwaan on BNB Smart Chain with flexible and locked options.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${syne.variable} font-sans bg-background text-foreground`}
      >
        <Providers>
          <ToastRoot>
            <WalletStateManager />
            <ScrollPerformanceOptimizer />
            <AppKitModalGuard />
            <CinematicBackground />
            <NetworkGuard />
            <div className="min-h-screen">
              <SiteHeader />
              <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-8 sm:gap-12 sm:pb-24 sm:pt-10 md:px-8">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </ToastRoot>
        </Providers>
      </body>
    </html>
  );
}
