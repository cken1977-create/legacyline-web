"use client";
// Public verify — honest standing from the latest FRARI run. "Not yet assessed" is neutral; no red.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BANDS } from "../../lib/bands";
import { BRAND } from "../../lib/brand";
import { core } from "../../lib/core";
import { fmtMT } from "../../lib/frari";
import { Wordmark } from "../_components/assay";
import { IconSearch, IconShield } from "../_components/assay/icons";

export type Result = { registry_id: string; readiness_state: string; status: string; last_updated_at: string; assessed?: boolean; standing?: string; score?: number; ruleset_version?: string; output_hash_short?: string; as_of?: string };
const LABEL: Record<string, string> = { not_assessed: "Not yet assessed", certified: "Certified", pre_readiness: "Pre-readiness", ...Object.fromEntries(BANDS.map((b) => [b.key, b.label])) };
const STATE: Record<string, string> = { registered: "Registered", data_collecting: "Gathering evidence", under_review: "Under review", evaluated: "Reviewed", certified: "Certified", revoked: "Revoked" };

export default function Verify({ demo }: { demo?: Record<string, Result> }) {
  const [rid, setRid] = useState("");
  const [r, setR] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function look(id = rid) {
    const v = id.trim().toUpperCase();
    if (!v) return;
    setBusy(true); setErr(""); setR(null);
    try {
      if (demo) { await new Promise((ok) => setTimeout(ok, 400)); const hit = demo[v]; if (!hit) throw Object.assign(new Error("not found"), { status: /^BRSA-\d{2}-[0-9A-F]{8}$/.test(v) ? 404 : 400 }); setR(hit); }
      else setR(await core<Result>(`/registry/v1/lookup?rid=${encodeURIComponent(v)}`));
    }
    catch (e: any) { setErr(e?.status === 404 ? "No record has that Registry ID. Check it and try again." : e?.status === 400 ? "That doesn't look like a Registry ID. It looks like BRSA-26-7F3A9C1E." : "The registry didn't answer. Try again in a moment."); }
    finally { setBusy(false); }
  }
  // A shared ?rid= link looks the record up. In the demo it only fills the box,
  // so a viewer sees the ID entered and taps Verify themselves.
  useEffect(() => { const q = new URLSearchParams(window.location.search).get("rid"); if (q) { setRid(q); if (!demo) look(q); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const verifyBtn = useRef<HTMLButtonElement>(null);
  // Demo: tapping a sample ID types it into the box (visibly), then points at Verify. It never submits by itself.
  function typeSample(id: string) {
    setR(null); setErr(""); setRid("");
    id.split("").forEach((_, i) => setTimeout(() => { setRid(id.slice(0, i + 1)); if (i === id.length - 1) verifyBtn.current?.focus(); }, 35 * (i + 1)));
  }

  const standing = r ? (r.standing ?? (r.readiness_state === "RED" ? "not_assessed" : undefined)) : undefined;
  const label = standing ? LABEL[standing] ?? standing : r ? (r.readiness_state === "GREEN" ? "Ready" : "Developing") : "";
  const certified = standing === "certified";

  return (
    <div className="ao-paper min-h-screen">
      <header className="flex h-14 items-center justify-between px-4 md:px-8" style={{ borderBottom: "1px solid var(--linen)" }}>
        <Link href="/" aria-label={`${BRAND.name} home`}><Wordmark /></Link>
        <Link href="/app/login" className="ao-btn ao-btn-quiet ao-btn-sm">Sign in</Link>
      </header>
      <main className="mx-auto max-w-[640px] px-4 pb-24 pt-12 md:px-8">
        <p className="ao-eyebrow">Verify a record</p>
        <h1 className="ao-h1 mt-1" style={{ fontSize: 34, lineHeight: "40px" }}>Check a {BRAND.name} standing yourself</h1>
        <p className="ao-body-2 mt-2" style={{ fontSize: 16 }}>Enter the Registry ID someone shared with you. You'll see their standing and when it was checked — never their documents.</p>
        <form className="mt-7 flex gap-2" onSubmit={(e) => { e.preventDefault(); look(); }}>
          <label htmlFor="rid" className="sr-only">Registry ID</label>
          <input id="rid" className="ao-input ao-mono flex-1" style={{ height: 50, fontSize: 16 }} placeholder="BRSA-26-XXXXXXXX" autoCapitalize="characters" spellCheck={false} value={rid} onChange={(e) => setRid(e.target.value)} />
          <button ref={verifyBtn} className="ao-btn ao-btn-primary" style={{ height: 50 }} disabled={busy || !rid.trim()}><IconSearch size={16} /> {busy ? "Checking…" : "Verify"}</button>
        </form>
        {demo && <p className="ao-meta mt-3">Tap a sample ID to enter it, then tap Verify. Sample IDs: {Object.keys(demo).map((k, i) => <span key={k}>{i ? " · " : ""}<button type="button" className="ao-link ao-mono" onClick={() => typeSample(k)}>{k}</button></span>)}</p>}
        {err && <p role="alert" className="mt-4 rounded-[8px] px-4 py-3" style={{ background: "var(--amber-tint)", fontSize: 14 }}>{err}</p>}
        {r && (
          <section className="ao-card ao-reveal mt-8 overflow-hidden" aria-live="polite" style={{ boxShadow: "var(--sheet-shadow)" }}>
            <div className="p-6" style={{ borderTop: `4px solid ${certified ? "var(--seal)" : standing === "not_assessed" ? "var(--rule)" : "var(--ink)"}` }}>
              <p className="ao-eyebrow">Record standing</p>
              <p className="ao-serif mt-1" style={{ fontSize: 32, fontWeight: 600 }}>{label}{typeof r.score === "number" && !certified && <span className="ao-mono" style={{ fontSize: 24, fontWeight: 500 }}> · {r.score}<span style={{ fontSize: 14, color: "var(--ink-3)" }}> / 100</span></span>}</p>
              <p className="ao-body-2 mt-2">{standing === "not_assessed" ? "This record hasn't been checked against the standard yet. That says nothing about the person." : certified ? "Two independent reviewers confirmed this record." : `A documentation check against the ${BRAND.standard} standard.`}</p>
            </div>
            <dl className="verify-dl grid grid-cols-1 sm:grid-cols-2" style={{ borderTop: "1px solid var(--linen)" }}>
              {([["Registry ID", <span key="rid" style={{ whiteSpace: "nowrap" }}>{r.registry_id}</span>, true],
                ["Stage", STATE[r.status] ?? r.status, false],
                ["Checked", r.as_of ? fmtMT(r.as_of, true) : "—", false],
                ["Hallmark", r.output_hash_short ? <><span style={{ whiteSpace: "nowrap" }}>run {r.output_hash_short} ·</span>{" "}<span style={{ whiteSpace: "nowrap" }}>{r.ruleset_version}</span></> : "—", true]] as [string, React.ReactNode, boolean][]).map(([k, v, mono]) => (
                <div key={k} className="px-6 py-4"><dt className="ao-meta">{k}</dt><dd className={mono ? "ao-mono" : ""} style={{ fontSize: 14, fontWeight: 500, marginTop: 2, overflowWrap: "break-word" }}>{v}</dd></div>
              ))}
            </dl>
          </section>
        )}
        <p className="ao-meta mt-8 flex items-center gap-1.5"><IconShield size={14} />Lookups show standing only. No names, documents or contact details.</p>
      </main>
    </div>
  );
}
