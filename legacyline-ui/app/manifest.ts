import type { MetadataRoute } from "next";
import { BRAND } from "../lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: `${BRAND.tagline} — ${BRAND.endorsement}`,
    start_url: "/app",
    display: "standalone",
    background_color: "#F7F3EA",
    theme_color: "#F7F3EA",
    icons: [
      { src: "/logo-shield.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-shield.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
