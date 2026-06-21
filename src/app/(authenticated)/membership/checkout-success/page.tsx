"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { completeCheckoutAction } from "@/modules/premium/actions/premium";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");
  const planId = searchParams.get("plan_id");
  const cycle = searchParams.get("cycle") as "MONTHLY" | "YEARLY" | "LIFETIME";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !planId || !cycle) {
      setStatus("error");
      setErrorMessage("Missing payment checkout details.");
      return;
    }

    let isMounted = true;

    async function activate() {
      const res = await completeCheckoutAction(sessionId!, planId!, cycle!);
      if (!isMounted) return;

      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(res.error || "Failed to activate subscription.");
      }
    }

    activate();

    return () => {
      isMounted = false;
    };
  }, [sessionId, planId, cycle]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 text-center">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-8 md:p-12 max-w-md w-full shadow-2xl">
        {/* Glowing background highlights */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-indigo-600/10 blur-[40px]" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-violet-600/10 blur-[40px]" />

        {status === "loading" && (
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
            <h2 className="text-xl font-bold text-white">
              Activating Premium Status...
            </h2>
            <p className="text-sm text-zinc-400">
              Please wait while we process your membership activation and assign
              permissions.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shadow-md">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Activation Failed</h2>
            <p className="text-sm text-zinc-400">
              {errorMessage ||
                "We encountered an issue finalizing your payment."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link href="/membership" passHref className="w-full sm:w-auto">
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
                  Try Again
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md"
            >
              <CheckCircle2 className="h-6.5 w-6.5" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                Welcome VIP!
              </h2>
              <p className="text-sm text-zinc-400">
                Your premium membership has been successfully activated. All
                premium sections, downloads, and limits are unlocked.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link
                href="/membership/dashboard"
                passHref
                className="w-full sm:w-auto"
              >
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-md shadow-indigo-500/10">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/" passHref className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="w-full border border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                >
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
