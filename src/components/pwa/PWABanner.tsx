"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePWA } from "@/hooks/use-pwa";

interface PWAInstallBannerProps {
  className?: string;
}

export function PWAInstallBanner({ className }: PWAInstallBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, install, showInstallBanner } = usePWA();

  if (!isInstallable || !showInstallBanner || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await install();
    } catch (error) {
      console.error("Failed to install PWA:", error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  return (
    <Card
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 border-primary/20 bg-primary/5 backdrop-blur-sm",
        "sm:left-auto sm:right-4 sm:w-96",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">
              Install Aplikasi Cuaca
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Install aplikasi ini ke perangkat Anda untuk akses cepat dan
              pengalaman yang lebih baik
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={handleInstall} className="text-xs h-8">
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-xs h-8"
              >
                Nanti Saja
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function PWAOfflineBanner() {
  const { isOnline } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-center py-2 px-4 text-sm">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Anda sedang offline. Menampilkan data tersimpan terakhir.</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0 hover:bg-orange-600 text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
