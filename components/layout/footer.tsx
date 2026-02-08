"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Github, MessageCircle, Twitter } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const footerFade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const linkHover = { y: -2 };

type FooterLinkProps = {
  label: string;
};

function FooterLink({ label }: FooterLinkProps) {
  return (
    <motion.button
      type="button"
      whileHover={linkHover}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="text-left text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
    </motion.button>
  );
}

type SocialIconProps = {
  href?: string;
  label: string;
  children: React.ReactNode;
  active?: boolean;
};

function SocialIcon({ href, label, children, active = false }: SocialIconProps) {
  const baseClassName = cn(
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground",
    "transition-all duration-200 hover:border-primary/40 hover:text-primary hover:shadow-glow",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  );

  if (!active || !href) {
    return (
      <motion.button
        type="button"
        aria-label={label}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={baseClassName}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.2 }}
      className={baseClassName}
    >
      {children}
    </motion.a>
  );
}

export function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={footerFade}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 border-t border-white/5 bg-[#0b0f17]/60"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <div className="text-lg font-semibold text-foreground">$Rwaan</div>
            <p className="text-sm text-muted-foreground">
              Stake. Predict. Earn.
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon
                href="https://x.com/RWAN_Official"
                label="$Rwaan on X"
                active
              >
                <Twitter className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon
                href="https://t.me/RWAN_Chat"
                label="$Rwaan on Telegram"
                active
              >
                <MessageCircle className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon label="$Rwaan on GitHub">
                <Github className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon label="$Rwaan Docs">
                <BookOpen className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Product
            </div>
            <div className="flex flex-col gap-3">
              <FooterLink label="Stake" />
              <FooterLink label="Dashboard" />
              <FooterLink label="Rewards" />
              <FooterLink label="Analytics" />
              <FooterLink label="Roadmap" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Resources
            </div>
            <div className="flex flex-col gap-3">
              <FooterLink label="Documentation" />
              <FooterLink label="Smart Contract" />
              <FooterLink label="Audit" />
              <FooterLink label="FAQ" />
              <FooterLink label="Support" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Legal
            </div>
            <div className="flex flex-col gap-3">
              <FooterLink label="Terms of Service" />
              <FooterLink label="Privacy Policy" />
              <FooterLink label="Risk Disclosure" />
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
    </motion.footer>
  );
}
