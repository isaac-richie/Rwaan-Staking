"use client";

import { useEffect } from "react";
import { useAppKitState } from "@reown/appkit/react";

/**
 * Stabilizes layout and animations when AppKit modal opens.
 * Prevents flicker caused by scrollbar changes and heavy animations.
 */
export function AppKitModalGuard() {
  const { open } = useAppKitState();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (open) {
      root.classList.add("appkit-open");
    } else {
      root.classList.remove("appkit-open");
    }
  }, [open]);

  return null;
}
