"use client";

import { Github, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Tentang Aplikasi</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Aplikasi prakiraan cuaca Indonesia dengan data resmi dari Badan
                Meteorologi, Klimatologi, dan Geofisika (BMKG).
              </p>
              <p>
                Menyediakan informasi cuaca terkini untuk seluruh wilayah
                Indonesia dengan antarmuka yang responsif dan mudah digunakan.
              </p>
            </div>
          </div>

          {/* Data Source */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Sumber Data</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <span>API BMKG (api.bmkg.go.id)</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Data cuaca diperbarui setiap 5 menit dari server BMKG. Informasi
                yang disajikan adalah prakiraan resmi dari Badan Meteorologi,
                Klimatologi, dan Geofisika.
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Tautan</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 justify-start text-sm text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href="https://bmkg.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Website Resmi BMKG
                </a>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 justify-start text-sm text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-3 w-3" />
                  Source Code
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-6" />

        {/* Copyright */}
        <div className="flex flex-col gap-2 text-xs text-muted-foreground text-center sm:text-center sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span>© {currentYear} Prakiraan Cuaca Indonesia.</span>
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <span className="font-medium text-foreground">Ferdy Indra</span>
              <span>&</span>
              <span className="font-medium text-foreground">Dimas Angkasa</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span>Tidak untuk keperluan komersial</span>
            <span className="hidden sm:inline">•</span>
            <span>Data dari BMKG</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> Aplikasi ini menggunakan data dari API
            publik BMKG. Selalu rujuk ke website resmi BMKG untuk informasi
            cuaca yang lebih akurat dan terkini, terutama untuk peringatan cuaca
            ekstrem atau kondisi darurat.
          </div>
        </div>
      </div>
    </footer>
  );
}
