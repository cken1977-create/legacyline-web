import Link from "next/link";
import type { Metadata } from "next";
import { BRAND, brandTitle } from "../../lib/brand";
import { Hallmark } from "../_components/assay";
import { TierGlyph } from "../_components/assay/icons";
import { IconArrowRight, IconCheck } from "../_components/assay/icons";
import Navbar from "../_components/Navbar";

export const metadata: Metadata = { title: brandTitle("Organization records") };

const AREAS = [
  ["Leadership & governance", "Who decides, how, and what happens if a leader leaves.", "var(--d-plum)"],
  ["Staff", "Headcount, turnover, training and conduct policies.", "var(--d-juniper)"],
  ["Policy & compliance", "What's written down, audits, and the record behind it.", "var(--d-adobe)"],
  ["Financial health", "Budget, funding mix, reserves and a plan to sustain the work.", "var(--d-ledger)"],
];

export default function OBRLanding() {
  return (
    <div className="ao-night min-h-screen pt-16">
      <Navbar />
      <section className="mx-auto max-w-[1120px] px-5 pb-16 pt-16 md:px-8 md:pt-24">
        <div className="flex items-center gap-2"><TierGlyph tier="organization" size={20} /><p className="ao-eyebrow" style={{ color: "var(--gold)" }}>Organization record · OBR</p></div>
        <h1 className="ao-serif mt-4 max-w-[760px]" style={{ fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.06, fontWeight: 600, letterSpacing: "-.02em" }}>Show funders your organization is ready — on a standard they can check.</h1>
        <p className="mt-5 max-w-[620px]" style={{ fontSize: 18, lineHeight: "28px", color: "var(--cream-dim)" }}>{BRAND.name} reads your governance, staff, policy and financial record against the {BRAND.standard} standard. A certified reviewer confirms it. The result carries a hallmark anyone can verify.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/obr/register" className="ao-btn ao-btn-gold" style={{ height: 50, padding: "0 24px", fontSize: 16 }}>Start your organization record <IconArrowRight size={16} /></Link>
          <Link href="/login/organization" className="ao-btn ao-btn-ghost-n" style={{ height: 50, padding: "0 24px", fontSize: 16 }}>Program sign-in</Link>
        </div>
        <p className="mt-4" style={{ fontSize: 14, color: "var(--cream-dim)" }}>About 25 minutes. It saves as you go, so you can come back.</p>
      </section>
      <section className="mx-auto max-w-[1120px] px-5 pb-20 md:px-8">
        <h2 className="ao-serif" style={{ fontSize: 28, fontWeight: 600 }}>What the record covers</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AREAS.map(([t, b, c]) => <div key={t} className="rounded-[12px] p-5" style={{ background: "var(--panel)", border: "1px solid #2A2E34", borderTop: `3px solid ${c}` }}><p style={{ fontWeight: 600, fontSize: 16 }}>{t}</p><p className="mt-1.5" style={{ fontSize: 14, lineHeight: "21px", color: "var(--cream-dim)" }}>{b}</p></div>)}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1120px] gap-10 px-5 pb-24 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="ao-serif" style={{ fontSize: 28, fontWeight: 600 }}>How it works</h2>
          <ol className="mt-6 flex flex-col gap-5">
            {[["Tell us about the organization", "Five short sections and the documents you already have."], ["A certified reviewer reads it", "Two different reviewers are needed before anything is certified."], ["Share a verifiable record", "Funders check the hallmark themselves. No PDFs to trust on faith."]].map(([t, b], i) => (
              <li key={t} className="flex gap-4"><span className="ao-mono grid h-8 w-8 flex-none place-items-center rounded-full" style={{ border: "1px solid #2A2E34", fontSize: 13 }}>{i + 1}</span><span><span style={{ fontWeight: 600 }}>{t}</span><br /><span style={{ fontSize: 14, color: "var(--cream-dim)" }}>{b}</span></span></li>
            ))}
          </ol>
        </div>
        <div className="ao-paper rounded-[14px] p-6" style={{ color: "var(--ink)" }}>
          <p className="ao-eyebrow">Sample organization record</p>
          <p className="ao-serif mt-2" style={{ fontSize: 22, fontWeight: 600 }}>Riverside Community Partners</p>
          <ul className="mt-4 flex flex-col gap-2" style={{ fontSize: 14 }}>
            {["Board meets quarterly, minutes on file", "Audit within 24 months", "Written succession plan"].map((x) => <li key={x} className="flex items-center gap-2"><span style={{ color: "var(--pine)" }}><IconCheck size={16} /></span>{x}</li>)}
          </ul>
          <div className="mt-4"><Hallmark runId="sample" outputHash="3b9e04d2" at="2026-10-02T16:00:00Z" /></div>
          <p className="ao-meta mt-3">Sample data.</p>
        </div>
      </section>
    </div>
  );
}
