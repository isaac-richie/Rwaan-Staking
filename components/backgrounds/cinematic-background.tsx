"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils/cn";
import { useIsMobile } from "@/hooks/use-is-mobile";

export function CinematicBackground({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const container = containerRef.current;
    if (!container) return;
    let rafId: number | null = null;
    let latestX = 0;
    let latestY = 0;

    const handleMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      latestX = (x / rect.width - 0.5) * 80;
      latestY = (y / rect.height - 0.5) * 80;

      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        container.style.setProperty("--parallax-x", `${latestX}px`);
        container.style.setProperty("--parallax-y", `${latestY}px`);
        rafId = null;
      });
    };

    const handleLeave = () => {
      container.style.setProperty("--parallax-x", "0px");
      container.style.setProperty("--parallax-y", "0px");
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerleave", handleLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  return (
    <div
      aria-hidden="true"
      ref={containerRef}
      className={cn(
        "cinematic-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06080d]",
        className
      )}
    >
      {/* Deep Navy → Near-Black → Faint Indigo Base Gradient */}
      <div className="bg-layer-base absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#03060f] to-[#0a0b18]" />
      
      {/* BNB Liquid Atmosphere - Large Volumetric Bubbles */}
      {!isMobile ? (
        <div className="bg-layer-bubbles absolute inset-0 opacity-90">
        {/* Bubble 1: Large Gold - Bottom Left */}
        <div className="absolute -left-[15%] bottom-[-20%] h-[700px] w-[700px] rounded-full bg-gradient-to-br from-[#F3BA2F]/12 via-[#FFC947]/10 to-transparent blur-[80px] animate-liquid-drift-1" />
        
        {/* Bubble 2: Amber - Top Right */}
        <div className="absolute -right-[10%] top-[-15%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#FFA500]/10 via-[#F3BA2F]/8 to-transparent blur-[70px] animate-liquid-drift-2" />
        
        {/* Bubble 3: Gold with Violet Edge - Center Left */}
        <div className="absolute left-[5%] top-[35%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#F3BA2F]/9 via-[#FFC947]/7 to-[#9333ea]/5 blur-[65px] animate-liquid-drift-3" />
        
        {/* Bubble 4: Soft Violet - Bottom Right */}
        <div className="absolute right-[8%] bottom-[10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-[#a855f7]/8 via-[#F3BA2F]/6 to-transparent blur-[75px] animate-liquid-drift-4" />
        
        {/* Bubble 5: Deep Gold - Center Top */}
        <div className="absolute left-[40%] top-[5%] h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#F3BA2F]/11 via-[#FFA500]/8 to-transparent blur-[60px] animate-liquid-drift-5" />
      </div>
      ) : null}
      
      {/* Vibrant Animated Aura - Navy, Violet, Gold */}
      {!isMobile ? (
        <div className="bg-layer-aura absolute inset-0 opacity-60 animate-aura-breathe">
        <div className="absolute -left-[20%] top-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#1e3a8a]/30 via-[#7c3aed]/20 to-transparent blur-[180px]" />
        <div className="absolute right-[-15%] top-[15%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-[#7c3aed]/25 via-[#F3BA2F]/20 to-transparent blur-[160px]" />
        <div className="absolute left-[25%] bottom-[-20%] h-[650px] w-[650px] rounded-full bg-gradient-to-br from-[#F3BA2F]/22 via-[#1e3a8a]/15 to-transparent blur-[200px]" />
      </div>
      ) : null}
      
      {/* BNB Gold Orbs - Existing depth */}
      {!isMobile ? (
        <div className="bg-layer-orbs absolute inset-0 opacity-70">
        <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-[#F3BA2F]/20 blur-[140px] animate-orb-float-slower" />
        <div className="absolute right-[-12%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#F3BA2F]/25 blur-[120px] animate-orb-float-slow" />
        <div className="absolute left-[30%] bottom-[-15%] h-[480px] w-[480px] rounded-full bg-[#F3BA2F]/18 blur-[160px] animate-orb-drift" />
      </div>
      ) : null}
      
      {/* Enhanced Light Diffusion Particles */}
      {!isMobile ? (
        <div className="bg-layer-particles absolute inset-0 hidden sm:block">
        {/* Gold particles */}
        <div className="absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-[#F3BA2F]/25 blur-[6px] animate-particle-float" />
        <div className="absolute right-[28%] top-[70%] h-1.5 w-1.5 rounded-full bg-[#F3BA2F]/20 blur-[6px] animate-particle-drift" />
        <div className="absolute right-[8%] top-[55%] h-1.5 w-1.5 rounded-full bg-[#F3BA2F]/20 blur-[6px] animate-particle-float" />
        
        {/* Violet particles */}
        <div className="absolute left-[35%] top-[25%] h-1.5 w-1.5 rounded-full bg-[#a78bfa]/18 blur-[6px] animate-particle-drift" />
        <div className="absolute right-[15%] bottom-[40%] h-2 w-2 rounded-full bg-[#a78bfa]/15 blur-[6px] animate-particle-float" />
        
        {/* White/Emerald particles */}
        <div className="absolute left-[24%] top-[65%] h-1.5 w-1.5 rounded-full bg-white/20 blur-[6px] animate-particle-float" />
        <div className="absolute right-[18%] top-[30%] h-2 w-2 rounded-full bg-white/16 blur-[6px] animate-particle-drift" />
        <div className="absolute left-[48%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#34d399]/18 blur-[6px] animate-particle-float" />
        <div className="absolute left-[65%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-[#34d399]/15 blur-[6px] animate-particle-drift" />
      </div>
      ) : null}
      
      {/* Ambient White Light */}
      {!isMobile ? (
        <div className="bg-layer-ambient absolute inset-0">
        <div className="absolute right-[10%] top-[10%] h-[260px] w-[260px] rounded-full bg-white/10 blur-[120px] animate-orb-float-slower" />
        <div className="absolute left-[8%] bottom-[8%] h-[220px] w-[220px] rounded-full bg-white/8 blur-[110px] animate-orb-float-slow" />
      </div>
      ) : null}
      
      {/* Gradient Pan Layer */}
      {!isMobile ? (
        <div className="bg-layer-gradient-pan absolute inset-0 animate-gradient-pan bg-[radial-gradient(circle_at_50%_50%,rgba(243,186,47,0.08),transparent_60%),linear-gradient(120deg,rgba(167,139,250,0.04),transparent_40%)] bg-[length:160%_160%] opacity-70" />
      ) : null}
      
      {/* Gradient Shift Layer */}
      {!isMobile ? (
        <div className="bg-layer-gradient-shift absolute inset-0 animate-gradient-shift bg-[radial-gradient(circle_at_15%_15%,rgba(243,186,47,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.08),transparent_35%)] opacity-80" />
      ) : null}

      {/* Liquid Mesh Overlay */}
      {!isMobile ? (
        <div className="bg-layer-mesh absolute inset-[-10%] animate-liquid-mesh bg-[conic-gradient(from_120deg,rgba(243,186,47,0.18),rgba(15,23,42,0.05),rgba(124,58,237,0.12),rgba(15,23,42,0.05),rgba(52,211,153,0.1),rgba(15,23,42,0.05),rgba(243,186,47,0.16))] mix-blend-screen blur-[60px] opacity-50" />
      ) : null}

      {/* Slow Bubble Drift */}
      {!isMobile ? (
        <div className="bg-layer-bubble-interactive absolute inset-0">
        <div className="bubble bubble-depth-1 left-[12%] top-[12%] h-[220px] w-[220px]">
          <div className="bubble-core animate-bubble-float-1 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(243,186,47,0.2),transparent_70%)]" />
        </div>
        <div className="bubble bubble-depth-2 right-[8%] top-[40%] h-[260px] w-[260px]">
          <div className="bubble-core animate-bubble-float-2 bg-[radial-gradient(circle_at_35%_35%,rgba(243,186,47,0.22),rgba(124,58,237,0.16),transparent_72%)]" />
        </div>
        <div className="bubble bubble-depth-3 left-[35%] bottom-[10%] h-[300px] w-[300px]">
          <div className="bubble-core animate-bubble-float-3 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.18),rgba(52,211,153,0.18),transparent_75%)]" />
        </div>
        <div className="bubble bubble-depth-2 left-[60%] top-[18%] h-[140px] w-[140px] opacity-80">
          <div className="bubble-core animate-bubble-float-2 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.22),rgba(243,186,47,0.16),transparent_72%)]" />
        </div>
        <div className="bubble bubble-depth-1 right-[22%] bottom-[18%] h-[160px] w-[160px] opacity-75">
          <div className="bubble-core animate-bubble-float-1 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.2),rgba(124,58,237,0.16),transparent_72%)]" />
        </div>
      </div>
      ) : null}
    </div>
  );
}
