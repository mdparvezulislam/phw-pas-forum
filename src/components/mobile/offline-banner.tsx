"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { haptics } from "./haptics-vibrator";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOffline(false);
      haptics.notification();
    };

    const handleOffline = () => {
      setIsOffline(true);
      haptics.error();
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // PWA Install Event Handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    haptics.tap();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-popover px-4 pointer-events-none flex flex-col gap-2">
      {/* Offline Alert */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-danger backdrop-blur-md shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <WifiOff className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium leading-tight">
                You are currently offline
                <p className="text-xs text-danger/80 mt-0.5">
                  Showing cached contents. Reconnecting...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border bg-card/95 p-3.5 text-card-foreground backdrop-blur-md shadow-2xl"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-premium/10 text-premium">
                <Download className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium leading-none">
                Add BHW PAS to Home Screen
                <p className="text-xs text-muted-foreground mt-1">
                  Install our app for quick native access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-premium hover:bg-premium/90 text-white"
                onClick={handleInstallClick}
              >
                Install
              </Button>
              <button
                type="button"
                onClick={() => setShowInstallPrompt(false)}
                className="rounded-md p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Dismiss prompt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
