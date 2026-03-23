import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Legacyline OBR — Organizational Readiness",
  description: "Track your organization's behavioral readiness standing under BRSA Domain III.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Legacyline OBR",
  },
};

export const viewport: Viewport = {
  themeColor: "#080C14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function OBROrgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
