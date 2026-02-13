"use client";

import { motion } from "framer-motion";
import { MessageCircle, Twitter, ArrowLeft, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { RWAN_STAKING_ADDRESS } from "@/lib/utils/constants";

import { cn } from "@/lib/utils/cn";

const footerFade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const linkHover = { y: -2 };

type FooterLinkProps = {
  href: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
};

function FooterLink({ href, label, external = false, onClick }: FooterLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
    >
      {label}
    </button>
  );
}

type SocialIconProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

function SocialIcon({ href, label, children }: SocialIconProps) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground",
        "transition-all duration-200 hover:border-primary/40 hover:text-primary hover:shadow-glow",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {children}
    </motion.a>
  );
}

export function Footer() {
  const [activeDoc, setActiveDoc] = useState<"terms" | "privacy" | "risk" | null>(
    null
  );
  const { toast } = useToast();
  const docContent = useMemo(() => {
    switch (activeDoc) {
      case "terms":
        return {
          title: "Terms of Service",
          body: [
            "These Terms govern your use of the Rwan Analytics interface and related services. By accessing the interface, you agree to these Terms.",
            "We do not custody user funds or private keys. You are solely responsible for wallet security and transaction approvals.",
            "All interactions occur on-chain. Smart contracts may contain bugs or vulnerabilities. You assume all risk of loss.",
            "APRs, rewards, and metrics are variable and may change. Past performance is not indicative of future results.",
            "You are responsible for complying with all applicable laws and regulations in your jurisdiction.",
            "We are not liable for losses, damages, or interruptions arising from use of the interface or smart contracts.",
            "We may modify the interface or these Terms at any time. Continued use constitutes acceptance.",
          ],
        };
      case "privacy":
        return {
          title: "Privacy Policy",
          body: [
            "We do not collect personally identifiable information by default.",
            "Wallet addresses and on-chain activity are public by nature. We may display or cache on-chain data to improve performance.",
            "We may store non-sensitive settings (for example, UI preferences) in your browser.",
            "Third-party infrastructure (RPC providers, analytics, email) may process network metadata.",
            "We take reasonable measures to protect data we store but cannot guarantee absolute security.",
          ],
        };
      case "risk":
        return {
          title: "Risk Disclosure",
          body: [
            "Digital assets are volatile and can result in partial or total loss.",
            "Smart contracts and third-party dependencies may fail or be exploited.",
            "APR and yields are dynamic and depend on TVL, program parameters, and funding.",
            "This interface does not provide financial, legal, or tax advice.",
          ],
        };
      default:
        return null;
    }
  }, [activeDoc]);

  return (
    <footer
      id="footer"
      className="mt-16 border-t border-white/10 bg-[#06080d]"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-5">
            <div className="text-lg font-semibold text-foreground">$Rwaan</div>
            <p className="text-sm text-muted-foreground">
              Stake. Earn. Grow.
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon
                href="https://x.com/RWAN_Official"
                label="$Rwaan on X"
              >
                <Twitter className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon
                href="https://t.me/RWAN_Chat"
                label="$Rwaan on Telegram"
              >
                <MessageCircle className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-start text-left">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Quick Links
            </div>
            <div className="flex flex-col gap-3">
              <FooterLink href="#stake-rwan" label="Stake Now" />
              <FooterLink href="#staking-plans" label="View Plans" />
              <FooterLink
                href="#"
                label="Smart Contract"
                onClick={() => {
                  navigator.clipboard.writeText(RWAN_STAKING_ADDRESS);
                  toast({
                    title: "Contract address copied",
                    description: RWAN_STAKING_ADDRESS,
                  });
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 items-start text-left">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Legal
            </div>
            <div className="flex flex-col gap-2">
              <FooterLink
                href="#"
                label="Terms of Service"
                onClick={() => setActiveDoc("terms")}
              />
              <FooterLink
                href="#"
                label="Privacy Policy"
                onClick={() => setActiveDoc("privacy")}
              />
              <FooterLink
                href="#"
                label="Risk Disclosure"
                onClick={() => setActiveDoc("risk")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              $Rwaan is a decentralized protocol. Use at your own risk.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-muted-foreground">
          <span>© 2026 $Rwaan Protocol. All rights reserved.</span>
          <span className="rounded-full border border-primary/30 bg-white/5 px-4 py-2 text-[11px] text-primary shadow-glow">
            Built on BNB Chain
          </span>
        </div>
      </div>

      {docContent ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="glass glass-solid w-full max-w-2xl rounded-2xl border border-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => {
                  setActiveDoc(null);
                  document.getElementById("footer")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to footer
              </button>
              <div className="text-sm font-semibold text-foreground">
                {docContent.title}
              </div>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setActiveDoc(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {docContent.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
