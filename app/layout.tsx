import "./globals.css";

import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { ToastRoot } from "@/components/toast-root";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/footer";
import { CinematicBackground } from "@/components/backgrounds/cinematic-background";
import { NetworkGuard } from "@/components/network-guard";
import { WalletStateManager } from "@/components/wallet-state-manager";
import { ScrollStabilityManager } from "@/components/scroll-stability-manager";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "$Rwaan Staking",
  description: "Stake $Rwaan on BNB Smart Chain with flexible and locked options.",
  icons: {
    icon: "/favicon.svg",
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
        className={`${inter.variable} ${sora.variable} font-sans bg-background text-foreground`}
      >
        <Providers>
          <ToastRoot>
            <WalletStateManager />
            <ScrollStabilityManager />
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
