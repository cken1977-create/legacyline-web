import type { Metadata, Viewport } from "next";
import { brandTitle } from "../../../lib/brand";

export const metadata: Metadata = {
  title: brandTitle("Our organization record"),
  description: "Your organization's readiness record (OBR), checked against the BRSA standard.",
};

export const viewport: Viewport = { themeColor: "#F7F3EA", width: "device-width", initialScale: 1 };

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
