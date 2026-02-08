"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils/cn";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { NotificationsSync } from "@/components/notifications/notifications-sync";

const WalletButton = dynamic(
  () => import("@/components/wallet-button").then((mod) => mod.WalletButton),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-28 rounded-full border border-white/10 bg-white/5" />
    ),
  }
);

const CryptoTicker = dynamic(
  () =>
    import("@/components/crypto/crypto-ticker").then(
      (mod) => mod.CryptoTicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="border-b border-white/5 bg-white/5">
        <div className="mx-auto h-10 w-full max-w-6xl px-4 md:px-8" />
      </div>
    ),
  }
);

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      <div className="relative z-50 border-b border-white/10 bg-[#06080d]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 p-1">
              <Image
                src="/logo.avif"
                alt="RWAN logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-sm font-semibold")}>
                Rwan Analytics
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                BNB Smart Chain
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationsBell />
            <WalletButton />
          </div>
        </div>
      </div>
      <CryptoTicker compact className="relative z-10" />
      <NotificationsSync />
    </header>
  );
}
