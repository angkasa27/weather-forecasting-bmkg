"use client";

import { useEffect, useState } from "react";

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPrompt: any;
}

export function usePWA(): PWAState & {
  install: () => Promise<void>;
  showInstallBanner: boolean;
} {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    installPrompt: null,
  });

  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPWAState((prev) => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
      }));

      // Show install banner after 3 seconds if not installed
      if (!isInstalled) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setPWAState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
      setShowInstallBanner(false);
    };

    // Listen for online/offline
    const handleOnline = () => {
      setPWAState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPWAState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial state
    setPWAState((prev) => ({
      ...prev,
      isInstalled,
      isOnline: navigator.onLine,
    }));

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const install = async (): Promise<void> => {
    if (!pwaState.installPrompt) {
      throw new Error("Install prompt not available");
    }

    const result = await pwaState.installPrompt.prompt();
    console.log("Install prompt result:", result);

    if (result.outcome === "accepted") {
      setPWAState((prev) => ({
        ...prev,
        installPrompt: null,
        isInstallable: false,
      }));
      setShowInstallBanner(false);
    }
  };

  return {
    ...pwaState,
    install,
    showInstallBanner,
  };
}
