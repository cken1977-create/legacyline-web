"use client";
// Packet (Phase 0 form): a print-first standing report the person owns.
// Shareable expiring packet links need the packets API (not built yet); this is the
// "download my record" half, and it carries a public verify link.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { bandFor } from "../../../lib/bands";
import { BRAND } from "../../../lib/brand";
import { core, currentParticipantId, hasIndividualSession } from "../../../lib/core";
import { DOMAIN_LABEL, RULE_LABEL, RULESET_LABEL, Run, compositeOf, fmtMT, rulePoints, ruleSets, shortHash } from "../../../lib/frari";
import { deriveSlots } from "../../../lib/record";
import { Wordmark } from "../../_components/assay";
import type { RecordData } from "../MyRecord";

export default function Report({ demo }: { demo?: RecordData }) {
  const router = useRouter();
  const [d, setD] = useState<RecordData | null>(demo ?? null);
  useEffect(() => {
    if (demo) return;
    const pid = currentParticipantId();
    if (!hasIndividualSession() || !pid) { router.replace("/app/login"); return; }
    const g = (p: string) => core<any>(p).catch(() => null);
    Promise.all([g(`/participants/${pid}/vault`), g(`/auth/individual/me`), g(`/intake/by-participant/${pid}`), g(`/frari/history/individual/${pid}`)]).then(([v, me, i, h]) => {
      const runs: Run[] = Array.isArray(h?.runs) ? h.runs : Array.isArray(h) ? h : [];
      setD({ participantId: pid, firstName: v?.first_name ?? "", lastName: v?.last_name ?? "", email: me?.email ?? "", registryId: me?.registry_id ?? "", status: v?.current_status ?? "registered", intake: i, run: runs[0] ?? null });
    });
  }, [demo, router]);

  const score = compositeOf(d?.run ?? null);
  const slots = useMemo(() => deriveSlots(d?.intake ?? null, d?.run ?? null), [d]);
  const { passed, failed } = ruleSets(d?.run ?? null);
  const prepared = new Date();
  const valid = new Date(prepared.getTime() + 90 * 864e5);
  const verifyUrl = d?.registryId ? `${typeof window !== "undefined" ? window.location.origin : "https://legacylinehq.com"}/verify?rid=${d.registryId}` : "";
  const certified = d?.status === "certified";

  if (!d) return <div className="ao-paper grid min-h-screen place-items-center"><p className="ao-meta">Preparing your report…</p></div>;
  return (
    <div className="ao-paper min-h-screen print:bg-white">
      <div className="mx-auto flex max-w-[820px] items-center justify-between px-5 py-4 print:hidden">
        <Link href={demo ? "/app/demo" : "/app"} className="ao-btn ao-btn-quiet ao-btn-sm">Back to My Record</Link>
        <button className="ao-btn ao-btn-primary ao-btn-sm" onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      <article className="ao-card mx-auto mb-16 max-w-[820px] p-8 md:p-12 print:m-0 print:max-w-none print:border-0 print:p-0 print:shadow-none" style={{ boxShadow: "var(--sheet-shadow)" }}>
        <header className="flex flex-wrap items-start justify-between gap-4 pb-6" style={{ borderBottom: "1px solid var(--linen)" }}>
          <div>
            <Wordmark />
            <p className="ao-eyebrow mt-6">Readiness record · standing report</p>
            <h1 className="ao-serif mt-1" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.1 }}>{d.firstName} {d.lastName}</h1>
            <p className="ao-mono mt-1" style={{ fontSize: 14, color: "var(--ink-2)" }}>◯ {d.registryId || "RID pending"}</p>
          </div>
          <div className="text-right ao-meta" style={{ lineHeight: "20px" }}>Prepared {fmtMT(prepared.toISOString())}<br />Valid until {fmtMT(valid.toISOString())}</div>
        </header>

        <section className="grid gap-6 py-7 sm:grid-cols-[1fr_auto]" style={{ borderBottom: "1px solid var(--linen)" }}>
          <div>
            <p className="ao-eyebrow">Record standing</p>
            <p className="ao-serif mt-1" style={{ fontSize: 30, fontWeight: 600 }}>{certified ? "Certified" : score === null ? "Not yet assessed" : bandFor(score).label}{score !== null && <span className="ao-mono" style={{ fontSize: 24, fontWeight: 500 }}> · {score}<span style={{ fontSize: 14, color: "var(--ink-3)" }}> / 100</span></span>}</p>
            <p className="ao-body-2 mt-2 max-w-[520px]">A documentation check against the {BRAND.standard} standard ({RULESET_LABEL}). It measures how complete and consistent the record is — not a judgment of the person.</p>
          </div>
          {d.run && <div className="ao-mono self-end rounded-[8px] px-3 py-2" style={{ fontSize: 12, border: "1px solid var(--rule)", lineHeight: "18px" }}>Hallmark<br />run {shortHash(d.run.output_hash)} · {fmtMT(d.run.computed_at)}<br />{d.run.ruleset_version}</div>}
        </section>

        {d.run && (
          <section className="py-7" style={{ borderBottom: "1px solid var(--linen)" }}>
            <h2 className="ao-h2">Areas</h2>
            <table className="mt-3 w-full" style={{ fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>{d.run.dimension_scores.map((x) => (
                <tr key={x.domain} style={{ borderTop: "1px solid var(--linen)" }}><td className="py-2.5">{DOMAIN_LABEL[x.domain] ?? x.domain}</td><td className="ao-mono py-2.5 text-right">{x.score} / {x.max_score}</td></tr>
              ))}</tbody>
            </table>
          </section>
        )}

        <section className="grid gap-8 py-7 sm:grid-cols-2" style={{ borderBottom: "1px solid var(--linen)" }}>
          <div>
            <h2 className="ao-h2">Receipts · passed</h2>
            <ul className="mt-3 flex flex-col gap-1.5" style={{ fontSize: 14 }}>{[...passed].map((r) => <li key={r} className="flex justify-between gap-3"><span>✓ {RULE_LABEL[r] ?? r}</span><span className="ao-mono ao-meta">+{rulePoints(r).total}</span></li>)}{!passed.size && <li className="ao-meta">No run yet.</li>}</ul>
          </div>
          <div>
            <h2 className="ao-h2">Still open</h2>
            <ul className="mt-3 flex flex-col gap-1.5" style={{ fontSize: 14 }}>{[...failed].filter((r) => !passed.has(r)).map((r) => <li key={r} className="flex justify-between gap-3"><span style={{ color: "var(--ink-2)" }}>○ {RULE_LABEL[r] ?? r}</span><span className="ao-mono ao-meta">{rulePoints(r).total}</span></li>)}</ul>
          </div>
        </section>

        <section className="py-7" style={{ borderBottom: "1px solid var(--linen)" }}>
          <h2 className="ao-h2">Evidence on file</h2>
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2" style={{ fontSize: 14 }}>{slots.map((s) => <li key={s.key} className="flex justify-between gap-3"><span>{s.label}</span><span className="ao-meta">{s.status === "missing" ? "Missing" : "On file"}</span></li>)}</ul>
        </section>

        <footer className="pt-7">
          <p style={{ fontSize: 14 }}><span style={{ fontWeight: 600 }}>Verify this record:</span> <span className="ao-mono" style={{ wordBreak: "break-all" }}>{verifyUrl || "—"}</span></p>
          <p className="ao-meta mt-2">Anyone can re-run the check from the hallmark. Shared by {d.firstName} {d.lastName}. Contains no documents.</p>
        </footer>
      </article>
    </div>
  );
}
