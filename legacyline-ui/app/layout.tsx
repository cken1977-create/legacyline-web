import "./globals.css";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { BRAND } from "../lib/brand";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", weight: ["400", "600", "700"], style: ["normal", "italic"], display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex-sans", weight: ["400", "500", "600"], display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} — ${BRAND.tagline}`, template: `%s · ${BRAND.name}` },
  description: `${BRAND.name} keeps one honest readiness record per person, checked against the ${BRAND.standard} standard by a deterministic engine anyone can re-run.`,
  applicationName: BRAND.name,
};

// Zoom is never locked (WCAG 1.4.4).
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[#0d1f3c] text-white antialiased">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#C8A84B]/10 blur-3xl" />
          <div className="absolute -bottom-44 right-[-120px] h-[520px] w-[520px] rounded-full bg-[#C8A84B]/5 blur-3xl" />
          <div className="absolute left-[-140px] top-1/3 h-[420px] w-[420px] rounded-full bg-[#0d1f3c]/40 blur-3xl" />
        </div>
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
