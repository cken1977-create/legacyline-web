"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEMO_ROLES } from "../../../lib/demo-mode";

/** Shown on every screen in demo mode: sample-data banner plus the "View as" switch. */
export default function DemoChrome() {
  const path = usePathname() || "/";
  const active = DEMO_ROLES.find((r) => path === r.href || path.startsWith(r.href + "/"))?.key;
  return (
    <div role="region" aria-label="Demo controls" className="ao-noprint" style={{ position: "sticky", top: 0, zIndex: 60, background: "#1A3A5C", color: "#F4EFE6", borderBottom: "2px solid #C8A84B", fontFamily: "var(--font-plex-sans), system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px" }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
          <strong style={{ fontWeight: 600, color: "#C8A84B" }}>Sample data, all fictional.</strong>{" "}
          <span>Every person, organization and number here is made up. Nothing you enter is saved.</span>
        </p>
        <nav aria-label="View as" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <Link href="/demo" style={{ fontSize: 13, color: "#F4EFE6", textDecoration: "underline", marginRight: 4 }}>View as:</Link>
          {DEMO_ROLES.map((r) => (
            <Link key={r.key} href={r.href} aria-current={active === r.key ? "page" : undefined}
              style={{ fontSize: 13, lineHeight: "18px", padding: "4px 10px", borderRadius: 999, border: "1px solid #C8A84B", textDecoration: "none",
                background: active === r.key ? "#C8A84B" : "transparent", color: active === r.key ? "#1A3A5C" : "#F4EFE6", fontWeight: active === r.key ? 600 : 400 }}>
              {r.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
