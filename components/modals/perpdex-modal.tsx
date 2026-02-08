"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils/cn";

type PerpdexModalProps = {
  open: boolean;
  onClose: () => void;
};

const steps = ["join", "email", "confirm"] as const;
type StepId = (typeof steps)[number];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function PerpdexModal({ open, onClose }: PerpdexModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = steps[stepIndex] as StepId;
  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setEmail("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const goNext = () => {
    setDirection(1);
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleSubmit = async () => {
    if (!address || !isValidEmail) return;
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, email }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Submission failed.");
      }

      toast({
        title: "Waitlist confirmed",
        description: "Check your inbox for the confirmation email.",
      });
      goNext();
    } catch (error) {
      toast({
        title: "Submission failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="perpdex-title"
        >
          <motion.div
            className="glass relative w-full max-w-xl overflow-hidden rounded-3xl p-8"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Perpdex waitlist
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {step === "join" ? (
                  <StepJoin onNext={goNext} />
                ) : null}
                {step === "email" ? (
                  <StepEmail
                    email={email}
                    onChange={setEmail}
                    onSubmit={handleSubmit}
                    isValid={isValidEmail}
                    isSubmitting={isSubmitting}
                    wallet={address}
                  />
                ) : null}
                {step === "confirm" ? (
                  <StepConfirm email={email} onDone={closeModal} />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StepJoin({ onNext }: { onNext: () => void }) {
  return (
    <>
      <div>
        <h3 id="perpdex-title" className="text-2xl font-semibold">
          Join the Perpdex waitlist
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get early access to $Rwaan’s Perpdex experience with curated rewards and
          priority access.
        </p>
      </div>
      <Button onClick={onNext}>Next</Button>
    </>
  );
}

function StepEmail({
  email,
  onChange,
  onSubmit,
  isValid,
  isSubmitting,
  wallet,
}: {
  email: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isValid: boolean;
  isSubmitting: boolean;
  wallet?: `0x${string}`;
}) {
  return (
    <>
      <div>
        <h3 className="text-2xl font-semibold">Add your email</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We’ll notify you as soon as Perpdex opens. No spam, just launch
          updates.
        </p>
      </div>
      <div className="space-y-3">
        <Input
          type="email"
          value={email}
          onChange={(event) => onChange(event.target.value)}
          placeholder="you@domain.com"
          className={cn(
            "focus-visible:ring-2 focus-visible:ring-primary/60",
            isValid ? "border-primary/40" : "border-white/10"
          )}
        />
        <div className="text-xs text-muted-foreground">
          Wallet: {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Wallet required"}
        </div>
        <div className="text-xs text-muted-foreground">
          We only use this to send Perpdex access updates.
        </div>
      </div>
      <Button disabled={!isValid || !wallet || isSubmitting} onClick={onSubmit}>
        {isSubmitting ? "Submitting..." : "Next"}
      </Button>
    </>
  );
}

function StepConfirm({ email, onDone }: { email: string; onDone: () => void }) {
  return (
    <>
      <div className="flex items-start gap-4">
        <SuccessIcon />
        <div>
          <h3 className="text-2xl font-semibold">You’re on the list</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Confirmation sent to <span className="text-foreground">{email}</span>
          </p>
        </div>
      </div>
      <Button onClick={onDone}>Done</Button>
    </>
  );
}

function SuccessIcon() {
  return (
    <motion.div
      className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <path d="M20 6 9 17l-5-5" />
      </motion.svg>
    </motion.div>
  );
}
