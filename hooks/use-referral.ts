"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isAddress, zeroAddress } from "viem";

const REFERRAL_STORAGE_KEY = "rwan:referrer";

export function useReferral(address?: `0x${string}`) {
  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<`0x${string}` | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (stored && isAddress(stored)) {
      setReferrer(stored as `0x${string}`);
    }
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const ref = searchParams.get("ref");
    if (!ref || !isAddress(ref) || ref === zeroAddress) return;
    if (address && ref.toLowerCase() === address.toLowerCase()) return;
    if (referrer) return;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
    }
    setReferrer(ref as `0x${string}`);
  }, [searchParams, address, referrer]);

  useEffect(() => {
    if (!address || !referrer) return;
    if (address.toLowerCase() !== referrer.toLowerCase()) return;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
    }
    setReferrer(null);
  }, [address, referrer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!address) {
      setShareUrl("");
      return;
    }
    const base = `${window.location.origin}${window.location.pathname}`;
    setShareUrl(`${base}?ref=${address}`);
  }, [address]);

  return { referrer, shareUrl };
}
