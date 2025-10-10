"use client";

import { useState } from "react";
import { Menu, X, RefreshCw, Cloud, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRegionHierarchy } from "@/hooks/use-regions-data";
import { getRegionDescription } from "@/lib/regions";

interface HeaderProps {
  selectedLocationCode?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function Header({
  selectedLocationCode,
  onRefresh,
  onExport,
  isLoading = false,
  className,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: regionHierarchy } = useRegionHierarchy();

  const locationName =
    selectedLocationCode && regionHierarchy
      ? getRegionDescription(regionHierarchy, selectedLocationCode)
      : "Pilih Lokasi";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground leading-tight">
                  MeteoID
                </h1>
                <p className="text-xs text-muted-foreground leading-tight">
                  Prakiraan Cuaca
                </p>
              </div>
            </div>
          </div>

          {/* Location Badge - Mobile */}
          <div className="flex-1 px-4 sm:hidden">
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="max-w-full">
                <MapPin className="mr-1 h-3 w-3 shrink-0" />
                <span className="truncate text-xs">
                  {locationName.split(",")[0]}
                </span>
              </Badge>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Location Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium max-w-64 truncate">
                {locationName}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-9 px-3"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isLoading && "animate-spin")}
                  />
                  <span className="ml-2 hidden lg:inline">Perbarui</span>
                </Button>
              )}

              {onExport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  className="h-9 px-3"
                >
                  <Download className="h-4 w-4" />
                  <span className="ml-2 hidden lg:inline">Ekspor</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-background">
            <div className="px-4 py-3 space-y-3">
              {/* Current Location */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Lokasi Saat Ini
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{locationName}</span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex gap-2 pt-2">
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onRefresh();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <RefreshCw
                      className={cn(
                        "mr-2 h-4 w-4",
                        isLoading && "animate-spin"
                      )}
                    />
                    Perbarui Data
                  </Button>
                )}

                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onExport();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Ekspor CSV
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
