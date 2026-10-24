"use client";
// Our Record — the organization's own OBR record (org lens of My Record).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "../../../lib/brand";
import { core, signOut } from "../../../lib/core";
import { fmtMT } from "../../../lib/frari";
import { BandChip, Hallmark, Mark, Wordmark } from "../../_components/assay";
import { IconArrowRight, IconCheck, IconLogout, TierGlyph } from "../../_components/assay/icons";

export type OBRProfile = {
  org_name: string; org_slug: string; registered: boolean;
  obr_subject: { id: string; name: string; status: string; city: string; state: string; legal_structure: string; founded_date: string; created_at: string } | null;
  intake_status: string; intake_submitted_at: string | null; eval_status: string; last_assessed: string | null;
};
const STEPS = [["registered", "Registered"], ["data_collecting", "Gathering evidence"], ["under_review", "Under review"], ["evaluated", "Reviewed"], ["certified", "Certified"]] as const;
const AREAS = [["Leadership & governance", "var(--d-plum)"], ["Staff", "var(--d-juniper)"], ["Policy & compliance", "var(--d-adobe)"], ["Financial health", "var(--d-ledger)"]] as const;

export default function OurRecord({ demo }: { demo?: OBRProfile }) {
  const router = useRouter();
  const [p, setP] = useState<OBRProfile | null>(demo ?? null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (demo) return;
    const slug = localStorage.getItem("org_slug");
    if (!slug) { router.replace("/login/organization"); return; }
    core<OBRProfile>(`/orgs/${slug}/obr-profile`).then(setP).catch((e) => { if (e?.status === 401) { signOut("org"); router.replace("/login/organization"); } else setErr("Your record didn't load. Try again in a moment."); });
  }, [demo, router]);

  const s = p?.obr_subject;
  const at = Math.max(0, STEPS.findIndex(([k]) => k === (s?.status ?? "registered")));
  const submitted = !!p?.intake_submitted_at;

  return (
    <div className="ao-paper min-h-screen">
      <header className="flex h-14 items-center justify-between px-4 md:px-8" style={{ background: "var(--card)", borderBottom: "1px solid var(--linen)" }}>
        <div className="flex items-center gap-3"><Wordmark /><span className="ao-meta hidden sm:inline">Our record</span></div>
        <div className="flex items-center gap-1"><Link href="/dashboard" className="ao-btn ao-btn-quiet ao-btn-sm">Program Desk</Link><button aria-label="Sign out" className="ao-btn ao-btn-quiet ao-btn-sm" onClick={() => { if (!demo) signOut("org").then(() => router.push("/login/organization")); }}><IconLogout size={16} /><span className="hidden sm:inline">Sign out</span></button></div>
      </header>
      <main className="mx-auto max-w-[960px] px-4 pb-20 pt-8 md:px-8">
        <div className="flex items-center gap-2"><TierGlyph tier="organization" size={18} /><p className="ao-eyebrow">Organization record · OBR</p></div>
        <h1 className="ao-h1 mt-1" style={{ fontSize: 32 }}>{s?.name ?? p?.org_name ?? "Loading…"}</h1>
        {s && <p className="ao-meta mt-1">{[s.city && `${s.city}, ${s.state}`, s.founded_date && `Founded ${s.founded_date}`, `Opened ${fmtMT(s.created_at)}`].filter(Boolean).join(" · ")}</p>}
        {err && <p role="alert" className="mt-4 rounded-[8px] px-4 py-3" style={{ background: "var(--amber-tint)" }}>{err}</p>}

        {p && !p.registered && (
          <section className="ao-card mt-8 flex flex-col gap-5 p-6 md:flex-row md:items-center">
            <Mark size={56} progress={0} />
            <div className="flex-1"><p className="ao-h2">Start your organization record</p><p className="ao-body-2 mt-1">Five short sections and the documents you already have. It saves as you go.</p></div>
            <Link href="/obr/register" className="ao-btn ao-btn-primary">Start <IconArrowRight size={16} /></Link>
          </section>
        )}

        {p?.registered && <>
          <section className="ao-card mt-8 p-6" aria-label="Standing">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="ao-eyebrow">Record standing</p><p className="ao-serif mt-1" style={{ fontSize: 26, fontWeight: 600 }}>{s?.status === "certified" ? "Certified" : "Not yet assessed"}</p>
                <p className="ao-body-2 mt-1">{s?.status === "certified" ? "Your record was certified by two independent reviewers." : submitted ? "A certified reviewer will run the organization ruleset on your record." : "Send your record for review to get a standing."}</p></div>
              <BandChip score={null} certified={s?.status === "certified"} />
            </div>
            <div className="mt-3"><Hallmark state="none" /></div>
          </section>

          <section aria-labelledby="journey" className="mt-8">
            <h2 id="journey" className="ao-h2">Where it is</h2>
            <ol className="ao-card mt-3 grid grid-cols-1 gap-0 p-2 sm:grid-cols-5">
              {STEPS.map(([k, l], i) => (
                <li key={k} className="flex items-center gap-2.5 p-3" aria-current={i === at ? "step" : undefined}>
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-full" style={{ background: i < at ? "var(--pine)" : i === at ? "var(--ink)" : "var(--card)", border: i > at ? "1px solid var(--rule)" : "none", color: "var(--paper)" }}>{i < at ? <IconCheck size={14} /> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: i === at ? "var(--paper)" : "transparent" }} />}</span>
                  <span style={{ fontSize: 14, fontWeight: i === at ? 600 : 400, color: i <= at ? "var(--ink)" : "var(--ink-3)" }}>{l}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="areas" className="mt-8">
            <div className="flex items-baseline justify-between"><h2 id="areas" className="ao-h2">What the record covers</h2><Link className="ao-link" style={{ fontSize: 14 }} href="/obr/register">Update answers</Link></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {AREAS.map(([t, c]) => (
                <div key={t} className="ao-card flex items-center gap-3 p-4" style={{ borderLeft: `3px solid ${c}` }}>
                  <span className="flex-1" style={{ fontWeight: 500 }}>{t}</span>
                  <span className="ao-meta">{submitted ? "On file" : "Not sent yet"}</span>
                </div>
              ))}
            </div>
            <p className="ao-meta mt-3">{submitted ? `Sent ${fmtMT(p.intake_submitted_at!)}.` : "Nothing has been sent for review yet."} Scores appear only after a reviewer runs the {BRAND.standard} organization ruleset.</p>
          </section>
        </>}
      </main>
    </div>
  );
}
