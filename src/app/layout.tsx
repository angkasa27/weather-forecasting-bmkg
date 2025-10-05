import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Prakiraan Cuaca Indonesia | Data BMKG Terkini",
  description: "Pantau kondisi cuaca terkini dan prakiraan cuaca akurat untuk seluruh wilayah Indonesia. Data resmi dari Badan Meteorologi, Klimatologi, dan Geofisika (BMKG).",
  keywords: ["cuaca", "prakiraan cuaca", "BMKG", "Indonesia", "suhu", "hujan", "angin", "kelembapan"],
  authors: [{ name: "STMKG Weather App" }],
  openGraph: {
    title: "Prakiraan Cuaca Indonesia | Data BMKG Terkini",
    description: "Pantau kondisi cuaca terkini dan prakiraan cuaca akurat untuk seluruh wilayah Indonesia",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
