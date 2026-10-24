import type { Metadata, Viewport } from "next";
import { BRAND } from "../../lib/brand";

export const metadata: Metadata = {
  title: "My Record",
  description: `Your ${BRAND.name} record: what's on file, what's next, and a standing anyone can verify.`,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: BRAND.shortName },
  formatDetection: { telephone: false },
};

// Phase 0 (F-V3): pinch-zoom restored — no maximumScale / userScalable lock.
export const viewport: Viewport = { themeColor: "#F7F3EA", width: "device-width", initialScale: 1 };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
