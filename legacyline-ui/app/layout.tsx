import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legacyline — Behavioral Readiness Engine",
  description:
    "Legacyline is the individual readiness engine implementing the Behavioral Readiness Standard (BRSA). Evidence-based, deterministic, and auditable.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
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
