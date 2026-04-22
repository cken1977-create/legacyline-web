"use client";

import Link from "next/link";

function getDashboardHref() {
  if (typeof document === "undefined") return "/dashboard";
  const match = document.cookie.match(/(?:^|;\s*)ll_user=([^;]+)/);
  const pid = match?.[1];
  return pid ? `/dashboard/individual/${pid}` : "/dashboard";
}

export default function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboardHref = getDashboardHref();

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur">
            <span className="text-lg font-semibold tracking-tight">L</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">
              Legacyline
            </div>
            <div className="text-xs text-white/60">
              Individual Readiness Engine
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/intake"
            className="rounded-xl px-3 py-2 text-white/80 hover:bg-white/5 hover:text-white"
          >
            Intake
          </Link>
          <Link
            href="/verify"
            className="rounded-xl px-3 py-2 text-white/80 hover:bg-white/5 hover:text-white"
          >
            Verify
          </Link>
          <Link
            href={dashboardHref}
            className="rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15 ring-1 ring-white/10"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mt-8">{children}</main>

      <footer className="mt-14 border-t border-white/10 pt-6 text-xs text-white/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Legacyline</span>
          <span className="text-white/40">
            Powered by BRSA doctrine • Deterministic • Auditable • Consent-based
          </span>
        </div>
      </footer>
    </div>
  );
}
