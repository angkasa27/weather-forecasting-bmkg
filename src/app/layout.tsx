import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Prakiraan Cuaca Indonesia | Data BMKG Terkini",
  description:
    "Pantau kondisi cuaca terkini dan prakiraan cuaca akurat untuk seluruh wilayah Indonesia. Data resmi dari Badan Meteorologi, Klimatologi, dan Geofisika (BMKG).",
  keywords: [
    "cuaca",
    "prakiraan cuaca",
    "BMKG",
    "Indonesia",
    "suhu",
    "hujan",
    "angin",
    "kelembapan",
  ],
  authors: [{ name: "Ferdy Indra & Dimas Angkasa" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cuaca BMKG",
  },
  openGraph: {
    title: "Prakiraan Cuaca Indonesia | Data BMKG Terkini",
    description:
      "Pantau kondisi cuaca terkini dan prakiraan cuaca akurat untuk seluruh wilayah Indonesia",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Cuaca BMKG",
    "application-name": "Cuaca BMKG",
    "msapplication-TileColor": "#2563eb",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
