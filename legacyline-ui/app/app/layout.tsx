import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Legacyline — Your Readiness Journey",
  description: "Track your readiness score, complete your profile, and earn your BRSA certification.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Legacyline",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1C30",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-touch-fullscreen" content="yes" />
      {children}
    </>
  );
}
