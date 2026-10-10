"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BRAND } from "../../lib/brand";
import { bandFor } from "../../lib/bands";
import { STAFF_EMAIL_KEY, STAFF_TOKEN_KEY } from "../../lib/api";
import { CoreError, core, hasStaffSession, signOut as endSession } from "../../lib/core";
import { DOMAIN_LABEL, RULE_LABEL, RULES, type Run, compositeOf, fmtMT, shortHash } from "../../lib/frari";
import { deriveSlots, type SlotState } from "../../lib/record";
import { BandChip, DemoBanner, Hallmark, type HallmarkState, StatusWord, Wordmark } from "../_components/assay";
import { IconArrowRight, IconBook, IconCheck, IconChevron, IconClock, IconFlag, IconLock, IconLogout, IconQueue, IconRefresh, IconSearch, TierGlyph } from "../_components/assay/icons";

const API = (process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app").replace(/\/+$/, ""); // staff login only (P1 BFF replaces)

export type Case = { id: string; registry_id: string; first_name: string; last_name: string; status: string; created_at: string; program?: string };
type Detail = { run: Run | null; timeline: { from_status?: string; to_status: string; created_at: string; actor?: string }[]; intake: Record<string, any> | null };
export type RoomDemo = { cases: Case[]; details: Record<string, Detail>; reviewer: string; initialCase?: string; evals?: Record<string, EvalRec> };

const LANES = [
  { key: "waiting", label: "Waiting on you", match: ["under_review"] },
  { key: "gathering", label: "Gathering evidence", match: ["data_collecting", "registered"] },
  { key: "secondkey", label: "Second key · reviewed, awaiting certification", match: ["evaluated"] },
  { key: "certified", label: "Certified", match: ["certified"] },
];
const STATE_LABEL: Record<string, string> = { registered: "Started", data_collecting: "Gathering", under_review: "In review", evaluated: "Reviewed", certified: "Certified", revoked: "Revoked" };
const STATE_CHIP: Record<string, string> = { under_review: "chip-engine", data_collecting: "chip-neutral", registered: "chip-neutral", evaluated: "chip-proficient", certified: "chip-certified" };

async function get(path: string) {
  try { return await core(path); } catch (e) { if (e instanceof CoreError && e.status === 401) throw new Error("401"); return null; }
}
function daysSince(iso: string) { return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)); }
function ago(iso?: string) {
  if (!iso) return "";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 48) return `${h} h ago`; return `${Math.round(h / 24)} d ago`;
}

export default function ReadingRoom({ demo }: { demo?: RoomDemo }) {
  const [email, setEmail] = useState<string | null>(demo ? demo.reviewer : null);
  const [checked, setChecked] = useState(!!demo);
  const [cases, setCases] = useState<Case[]>(demo?.cases ?? []);
  const [loading, setLoading] = useState(!demo);
  const [caseId, setCaseId] = useState<string | null>(demo?.initialCase ?? null);
  const [q, setQ] = useState("");

  // URL is the source of truth for the open case (?case=ID) so links and Back work.
  useEffect(() => {
    const read = () => setCaseId(new URLSearchParams(window.location.search).get("case") ?? (demo?.initialCase && !window.location.search.includes("queue") ? demo.initialCase : null));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [demo]);
  const open = (id: string | null) => {
    const u = new URL(window.location.href);
    if (id) { u.searchParams.set("case", id); u.searchParams.delete("queue"); } else { u.searchParams.delete("case"); if (demo) u.searchParams.set("queue", "1"); }
    window.history.pushState({}, "", u); setCaseId(id); window.scrollTo({ top: 0 });
  };

  const signOut = useCallback(() => {
    if (demo) return;
    endSession("staff");
    setEmail(null); setCases([]);
  }, [demo]);

  useEffect(() => {
    if (demo) return;
    if (!hasStaffSession()) { setChecked(true); setLoading(false); return; }
    get("/auth/staff/me").then((me) => setEmail(me?.email ?? null)).catch(() => signOut()).finally(() => setChecked(true));
  }, [demo, signOut]);

  useEffect(() => {
    if (demo || !email) return;
    setLoading(true);
    get("/participants").then((ps) => setCases(Array.isArray(ps) ? ps : [])).catch((e) => { if (String(e.message) === "401") signOut(); }).finally(() => setLoading(false));
  }, [demo, email, signOut]);

  if (!checked) return <div className="ao-paper" aria-busy="true" />;
  if (!email) return <StaffGate onIn={setEmail} />;

  const sel = cases.find((c) => c.id === caseId) ?? null;
  const name = email.split("@")[0].split(/[._-]/)[0];
  const first = name ? name[0].toUpperCase() + name.slice(1) : "";

  return (
    <div className="ao-paper">
      {demo && <DemoBanner>Fictional cases for design review. Actions don't touch real records.</DemoBanner>}
      <div className="flex min-h-screen">
        {/* Left nav 220 */}
        <nav aria-label="Reading Room" className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col justify-between px-4 py-5 lg:flex" style={{ background: "var(--vellum)", borderRight: "1px solid var(--linen)" }}>
          <div>
            <div className="px-2"><Wordmark /></div>
            <p className="ao-eyebrow mt-6 px-2">Review</p>
            <ul className="mt-2 flex flex-col gap-0.5">
              <NavItem icon={<IconQueue size={18} />} label="Reading Room" active onClick={() => open(null)} />
              <NavItem icon={<IconBook size={18} />} label="Academy" href="https://brsa-evaluators.vercel.app" />
              <NavItem icon={<IconArrowRight size={18} />} label="Classic console" href="/evaluator" />
            </ul>
          </div>
          <div className="px-2">
            <p className="ao-meta truncate" title={email}>{email}</p>
            <button className="ao-btn ao-btn-quiet ao-btn-sm mt-1 -ml-2.5" onClick={signOut}><IconLogout size={16} /> Sign out</button>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <header className="flex h-14 items-center justify-between px-4 lg:hidden" style={{ borderBottom: "1px solid var(--linen)", background: "var(--card)" }}>
            <Wordmark /><span className="ao-meta">Reading Room</span>
          </header>
          {!sel ? (
            <Queue cases={cases} loading={loading} first={first} q={q} setQ={setQ} onOpen={open} />
          ) : (
            <CaseView key={sel.id} c={sel} demo={demo} reviewer={email} onBack={() => open(null)} onChanged={(id, st) => setCases((cs) => cs.map((x) => x.id === id ? { ...x, status: st } : x))} />
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, href, onClick }: { icon: React.ReactNode; label: string; active?: boolean; href?: string; onClick?: () => void }) {
  const cls = "flex h-10 w-full items-center gap-2.5 rounded-[6px] px-2.5 text-[15px] font-medium";
  const style = { color: active ? "var(--ink)" : "var(--ink-2)", background: active ? "var(--card)" : "transparent", boxShadow: active ? "inset 2px 0 0 var(--action), var(--lift)" : "none" } as React.CSSProperties;
  return <li>{href ? <a className={cls} style={style} href={href}>{icon}{label}</a> : <button className={cls} style={{ ...style, border: 0, cursor: "pointer" }} onClick={onClick} aria-current={active ? "page" : undefined}>{icon}{label}</button>}</li>;
}

function Queue({ cases, loading, first, q, setQ, onOpen }: { cases: Case[]; loading: boolean; first: string; q: string; setQ: (s: string) => void; onOpen: (id: string) => void }) {
  const hour = Number(new Date().toLocaleString("en-US", { timeZone: "America/Denver", hour: "numeric", hour12: false }));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const f = q.trim().toLowerCase();
  const list = cases.filter((c) => !f || `${c.first_name} ${c.last_name} ${c.registry_id}`.toLowerCase().includes(f));
  const waiting = cases.filter((c) => c.status === "under_review").length;
  return (
    <main className="mx-auto max-w-[1080px] px-4 py-8 md:px-10 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ao-eyebrow">Reading Room</p>
          <h1 className="ao-h1 mt-1" style={{ fontSize: 30, lineHeight: "36px" }}>{greet}{first ? `, ${first}` : ""}.</h1>
          <p className="ao-body-2 mt-1" style={{ fontSize: 16 }}>{waiting} {waiting === 1 ? "case is" : "cases are"} waiting on you.</p>
        </div>
        <label className="relative w-full sm:w-[300px]">
          <span className="sr-only">Search by name or Registry ID</span>
          <span className="absolute left-3 top-3.5" style={{ color: "var(--ink-3)" }}><IconSearch size={18} /></span>
          <input className="ao-input" style={{ paddingLeft: 38, height: 44 }} placeholder="Name or Registry ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      {loading ? <div className="mt-8 flex flex-col gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="ao-skel" style={{ height: 52 }} />)}</div> : (
        <div className="mt-8 flex flex-col gap-8">
          {LANES.map((lane) => {
            const rows = list.filter((c) => lane.match.includes(c.status)).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
            if (!rows.length && lane.key !== "waiting") return null;
            return (
              <section key={lane.key} aria-labelledby={`lane-${lane.key}`}>
                <div className="mb-2 flex items-baseline gap-2 px-1"><h2 id={`lane-${lane.key}`} className="ao-eyebrow" style={{ color: "var(--ink-2)" }}>{lane.label}</h2><span className="ao-mono ao-meta">{rows.length}</span></div>
                <div className="ao-card overflow-hidden">
                  {rows.length === 0 && <p className="ao-body-2 px-5 py-4">Nothing waiting. New cases land here when a record is handed to review.</p>}
                  {rows.map((c, i) => {
                    const d = daysSince(c.created_at);
                    const sla = lane.key === "waiting" ? (d >= 5 ? "var(--brick)" : d >= 3 ? "var(--amber)" : null) : null;
                    return (
                      <button key={c.id} onClick={() => onOpen(c.id)} className="ao-row grid w-full grid-cols-[20px_1fr_auto] items-center gap-x-4 px-4 text-left md:grid-cols-[20px_minmax(0,1.6fr)_130px_minmax(0,1fr)_92px_20px]" style={{ minHeight: 56, borderTop: i ? "1px solid var(--linen)" : 0, background: "transparent", cursor: "pointer" }}>
                        <TierGlyph tier="individual" />
                        <span className="min-w-0 py-2"><span className="block truncate" style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{c.first_name} {c.last_name}</span><span className="ao-mono block truncate" style={{ fontSize: 12, color: "var(--ink-3)" }}>{c.registry_id || c.id}</span></span>
                        <span className="hidden md:block"><span className={`ao-chip ${STATE_CHIP[c.status] ?? "chip-neutral"}`}>{STATE_CHIP[c.status] === "chip-engine" && <span className="ao-chip-dot" />}{STATE_LABEL[c.status] ?? c.status}</span></span>
                        <span className="ao-body-2 hidden truncate md:block">{c.program ?? "—"}</span>
                        <span className="ao-mono flex items-center justify-end gap-2" style={{ fontSize: 13, color: "var(--ink-2)" }}>
                          {sla && <span className="ao-chip-dot" style={{ background: sla }} aria-label={d >= 5 ? "Over SLA" : "Near SLA"} />}{d}d
                        </span>
                        <span className="hidden md:block" style={{ color: "var(--ink-3)" }}><IconChevron size={18} /></span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

type EvalRec = { status?: string; evaluator_email?: string; recommended_next?: string; approved_by?: string; narrative_notes?: string } | null;

function CaseView({ c, demo, reviewer, onBack, onChanged }: { c: Case; demo?: RoomDemo; reviewer: string; onBack: () => void; onChanged: (id: string, status: string) => void }) {
  const [d, setD] = useState<Detail | null>(demo?.details[c.id] ?? null);
  const [ev, setEv] = useState<EvalRec>(demo?.evals?.[c.id] ?? null);
  const [status, setStatus] = useState(c.status);
  const [tab, setTab] = useState<"receipts" | "timeline" | "interview" | "consent" | "notes">("receipts");
  const [hall, setHall] = useState<HallmarkState>("current");
  const [running, setRunning] = useState(false);
  const [attest, setAttest] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [verified, setVerified] = useState<Set<string>>(new Set(demo ? ["gov_id", "selfie"] : []));
  const [sheet, setSheet] = useState<null | "return" | "evaluate" | "recommend" | "approve" | "decline">(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (demo) { setD(demo.details[c.id] ?? { run: null, timeline: [], intake: null }); return; }
    (async () => {
      const [h, t, i, e] = await Promise.all([get(`/frari/history/individual/${c.id}`).catch(() => null), get(`/participants/${c.id}/state-history`).catch(() => null), get(`/intake/by-participant/${c.id}`).catch(() => null), get(`/participants/${c.id}/evaluation`).catch(() => null)]);
      const runs: Run[] = Array.isArray(h?.runs) ? h.runs : Array.isArray(h) ? h : [];
      setD({ run: runs[0] ?? null, timeline: Array.isArray(t?.history) ? t.history : [], intake: i });
      setEv(e?.evaluation ?? (e?.status ? e : null));
    })();
  }, [c.id, demo]);

  const slots = useMemo(() => deriveSlots(d?.intake ?? null, d?.run ?? null), [d]);
  const score = compositeOf(d?.run ?? null);
  const evidenceAt = d?.intake?.submitted_at ? new Date(d.intake.submitted_at).getTime() : 0;
  const runFresh = !!d?.run && new Date(d.run.computed_at).getTime() >= evidenceAt;
  const verifiedCount = slots.filter((s) => verified.has(s.key) && s.status !== "missing").length;
  const inReview = status === "under_review";
  const secondKeyLane = status === "evaluated" && ev?.status === "submitted";
  const isFirstKey = !!ev?.evaluator_email && ev.evaluator_email.toLowerCase() === reviewer.toLowerCase();
  const canDecide = inReview && runFresh && attest && verifiedCount >= 2 && !busy;
  const why = !inReview ? "" : !d?.run ? "Run the engine first." : !runFresh ? "Evidence changed since the last run. Re-run the engine." : verifiedCount < 2 ? `Verify at least 2 pieces of evidence (${verifiedCount}/2).` : !attest ? "Tick the attestation to continue." : "";

  async function runEngine() {
    setRunning(true); setHall("running"); setMsg(null);
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 1600));
        setD((x) => x && x.run ? { ...x, run: { ...x.run, computed_at: new Date().toISOString() } } : x);
      } else {
        const res = await core<any>(`/frari/assess/individual/${c.id}`, { method: "POST" });
        const prev = new Set((d?.run?.dimension_scores ?? []).flatMap((x) => x.rules_passed ?? []));
        const now = (res.dimension_scores ?? []).flatMap((x: any) => x.rules_passed ?? []);
        setFresh(new Set(now.filter((x: string) => !prev.has(x))));
        setD((x) => ({ ...(x ?? { timeline: [], intake: null }), run: { id: res.id, ruleset_version: res.ruleset_version, input_event_hash: res.input_event_hash, output_hash: res.output_hash, dimension_scores: res.dimension_scores, computed_at: res.computed_at, triggered_by: res.triggered_by } }));
      }
      setMsg({ tone: "ok", text: "Engine run complete. Receipts updated." });
    } catch { setMsg({ tone: "warn", text: "The engine didn't answer. Nothing changed; try again." }); }
    finally { setRunning(false); setHall("current"); }
  }

  async function verify() {
    if (!d?.run) return;
    setHall("running");
    try {
      if (demo) { await new Promise((r) => setTimeout(r, 1200)); setHall("verified"); }
      else { const j = await get(`/frari/assess/${d.run.id}/verify`); setHall(j?.determinism_check ? "verified" : "stale"); }
    } catch { setHall("current"); }
    setTimeout(() => setHall("current"), 4000);
  }

  async function viewDoc(kind: string) {
    if (demo) { setMsg({ tone: "ok", text: "Sample: documents open in a 10-minute private link." }); return; }
    try { const j = await core<{ url: string }>(`/participants/${c.id}/documents/${kind}/link`); window.open(j.url, "_blank", "noopener,noreferrer"); }
    catch { setMsg({ tone: "warn", text: "Couldn't open that document. It may not be on file yet." }); }
  }

  async function decide(kind: "return" | "evaluate" | "recommend" | "approve" | "decline", findings: string) {
    setBusy(true); setMsg(null);
    const done = (st: string, text: string) => { setStatus(st); onChanged(c.id, st); setSheet(null); setMsg({ tone: "ok", text }); };
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 700));
        if (kind === "return") done("data_collecting", "Returned to the person with your findings.");
        else if (kind === "approve") done("certified", "Certified. The seal is issued.");
        else if (kind === "decline") { setEv((e) => ({ ...(e ?? {}), status: "rejected" })); setSheet(null); setMsg({ tone: "ok", text: "Certification declined. The first reviewer has your reason." }); }
        else { setEv({ status: "submitted", evaluator_email: reviewer, recommended_next: kind === "recommend" ? "certification" : "evaluated" }); done("evaluated", kind === "recommend" ? "Marked evaluated. Waiting for a second reviewer to certify." : "Marked evaluated."); }
        return;
      }
      if (kind === "return") {
        await core(`/participants/${c.id}/state`, { method: "POST", body: JSON.stringify({ to: "data_collecting", reason: `Returned with findings: ${findings}` }) });
        done("data_collecting", "Returned to the person with your findings.");
      } else if (kind === "approve" || kind === "decline") {
        await core(`/participants/${c.id}/evaluation/approve`, { method: "POST", body: JSON.stringify({ approved: kind === "approve", reason: findings }) });
        if (kind === "approve") done("certified", "Certified. The seal is issued.");
        else { setEv((e) => ({ ...(e ?? {}), status: "rejected" })); setSheet(null); setMsg({ tone: "ok", text: "Certification declined." }); }
      } else {
        const run = d!.run!;
        await core(`/participants/${c.id}/evaluation`, { method: "POST", body: JSON.stringify({
          submit: true,
          domain_scores: run.dimension_scores.map((x) => ({ domain: x.domain, score: x.score, notes: `FRARI ${run.ruleset_version} run ${shortHash(run.output_hash)}` })),
          doc_checklist: slots.filter((s) => verified.has(s.key) && s.status !== "missing").map((s) => ({ document: s.key, item: s.label, verified: true, checked: true, notes: "Verified in Reading Room" })),
          narrative_notes: findings,
          recommended_next: kind === "recommend" ? "certification" : "evaluated",
          attestation: `I reviewed the evidence above and attest under the ${BRAND.standard} standard. Run ${run.output_hash}.`,
        }) });
        await core(`/participants/${c.id}/state`, { method: "POST", body: JSON.stringify({ to: "evaluated", reason: kind === "recommend" ? "Evaluated; certification recommended" : "Evaluated" }) });
        setEv({ status: "submitted", evaluator_email: reviewer, recommended_next: kind === "recommend" ? "certification" : "evaluated" });
        done("evaluated", kind === "recommend" ? "Marked evaluated. Waiting for a second reviewer to certify." : "Marked evaluated.");
      }
    } catch (e) {
      const m = e instanceof CoreError ? e.message : "Something went wrong.";
      setMsg({ tone: "warn", text: m });
    } finally { setBusy(false); }
  }

  const waiting = daysSince(c.created_at);
  const onFile = slots.filter((s) => s.status !== "missing").length;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 pb-4 pt-5 md:px-8" style={{ borderBottom: "1px solid var(--linen)", background: "var(--card)" }}>
        <button onClick={onBack} className="ao-btn ao-btn-quiet ao-btn-sm -ml-2.5" style={{ color: "var(--ink-2)" }}><span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><IconChevron size={16} /></span> Queue</button>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <TierGlyph tier="individual" size={20} />
          <h1 className="ao-h1" style={{ fontSize: 26 }}>{c.first_name} {c.last_name}</h1>
          <span className="ao-mono" style={{ fontSize: 13, color: "var(--ink-2)" }}>{c.registry_id}</span>
          <span className={`ao-chip ${STATE_CHIP[status] ?? "chip-neutral"}`}>{STATE_CHIP[status] === "chip-engine" && <span className="ao-chip-dot" />}{STATE_LABEL[status] ?? status}</span>
          {secondKeyLane && <span className="ao-chip chip-amber"><span className="ao-chip-dot" />Second key</span>}
        </div>
        <div className="ao-meta mt-2 flex flex-wrap gap-x-5 gap-y-1" style={{ color: "var(--ink-2)" }}>
          <span>{c.program ?? "Program not set"}</span><span className="inline-flex items-center gap-1"><IconClock size={14} />Waiting {waiting}d</span><span>Opened {fmtMT(c.created_at)}</span><span>{onFile}/{slots.length} on file · {verifiedCount} verified by you</span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <aside aria-labelledby="rail" className="order-2 lg:order-1" style={{ borderRight: "1px solid var(--linen)", background: "var(--paper)" }}>
          <div className="flex items-baseline justify-between px-5 pb-2 pt-5"><h2 id="rail" className="ao-h2" style={{ fontSize: 16 }}>Evidence</h2><span className="ao-mono ao-meta">{verifiedCount} ✓ · {onFile}/{slots.length}</span></div>
          <ul>{slots.map((s) => <RailRow key={s.key} s={s} isVerified={verified.has(s.key)} canAct={inReview} onView={s.kind === "Document" ? () => viewDoc(s.key) : undefined} onToggle={() => setVerified((v) => { const n = new Set(v); n.has(s.key) ? n.delete(s.key) : n.add(s.key); return n; })} />)}</ul>
          <p className="ao-meta flex gap-2 px-5 py-4"><IconLock size={14} />Documents open in a private link that expires in 10 minutes.</p>
        </aside>

        <main className="order-1 min-w-0 lg:order-2">
          <div className="px-4 pt-5 md:px-8">
            <section className={`ao-card p-5 ${hall === "running" ? "ao-pulse" : ""}`} aria-label="Standing">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="ao-eyebrow">Record standing</p>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-3"><span className="ao-serif" style={{ fontSize: 26, fontWeight: 600 }}>{score === null ? "Not yet assessed" : status === "certified" ? "Certified" : bandFor(score).label}</span>{score !== null && <span className="ao-mono" style={{ fontSize: 28, fontWeight: 500 }}>{score}<span style={{ fontSize: 15, color: "var(--ink-3)" }}> / 100</span></span>}</p>
                </div>
                <BandChip score={score} certified={status === "certified"} />
              </div>
              <div className="mt-2">{d?.run ? <Hallmark runId={d.run.id} outputHash={d.run.output_hash} at={d.run.computed_at} state={!runFresh && hall === "current" ? "stale" : hall} onVerify={verify} /> : <Hallmark state="none" />}</div>
            </section>
            {msg && <div role="status" className="ao-fade mt-4 rounded-[8px] px-4 py-3" style={{ background: msg.tone === "ok" ? "var(--pine-tint)" : "var(--amber-tint)", color: "var(--ink)", fontSize: 14 }}>{msg.text}</div>}

            <div role="tablist" aria-label="Record" className="mt-5 flex gap-6 overflow-x-auto" style={{ borderBottom: "1px solid var(--linen)" }}>
              {(["receipts", "timeline", "interview", "consent", "notes"] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} aria-current={tab === t ? "page" : undefined} className="ao-toptab" style={{ height: 44, fontSize: 14 }} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
              ))}
            </div>
          </div>
          <div className="px-4 pb-8 pt-4 md:px-8 md:pb-40">
            {tab === "receipts" && <Receipts run={d?.run ?? null} fresh={fresh} loading={!d} />}
            {tab === "timeline" && <Timeline items={d?.timeline ?? []} run={d?.run ?? null} />}
            {tab === "notes" && ev?.narrative_notes && <div className="ao-card p-5"><p className="ao-eyebrow">Findings on file</p><p className="ao-body-2 mt-2" style={{ whiteSpace: "pre-wrap" }}>{ev.narrative_notes}</p><p className="ao-meta mt-2">{ev.evaluator_email}</p></div>}
            {(tab === "interview" || tab === "consent" || (tab === "notes" && !ev?.narrative_notes)) && (
              <div className="ao-card p-6"><p className="ao-h2" style={{ fontSize: 16 }}>{tab === "notes" ? "No findings yet" : `${tab[0].toUpperCase() + tab.slice(1)} lives in the classic console for now`}</p><p className="ao-body-2 mt-1">{tab === "notes" ? "Findings you write when you decide are kept here." : "It moves into the Reading Room in the next build."}</p>{tab !== "notes" && <a className="ao-btn ao-btn-secondary ao-btn-sm mt-4" href="/evaluator">Open classic console <IconArrowRight size={16} /></a>}</div>
            )}
          </div>
        </main>

        <aside aria-labelledby="checks" className="order-3 hidden xl:block" style={{ borderLeft: "1px solid var(--linen)", background: "var(--paper)" }}>
          <div className="px-5 pt-5"><h2 id="checks" className="ao-h2" style={{ fontSize: 16 }}>Before you decide</h2><p className="ao-meta mt-0.5">Rules-based checks · not evidence</p></div>
          <ul className="mt-3 flex flex-col gap-3 px-5 pb-6">
            {!runFresh && d?.run && <li className="ao-card p-3.5" style={{ borderLeft: "3px solid var(--amber)" }}><p style={{ fontSize: 14, fontWeight: 600 }}>Evidence changed since the last run</p><p className="ao-meta mt-0.5" style={{ color: "var(--ink-2)" }}>Re-run the engine before deciding.</p></li>}
            {slots.filter((s) => s.status === "missing").map((s) => (
              <li key={s.key} className="ao-card p-3.5" style={{ borderLeft: "3px solid var(--amber)" }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{s.label} is missing</p>
                <p className="ao-meta mt-0.5" style={{ color: "var(--ink-2)" }}>Holds back {s.points} pts · <span className="ao-mono">{s.rules[0]}</span></p>
              </li>
            ))}
            <li className="ao-card p-3.5" style={{ borderLeft: "3px solid var(--engine)" }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--engine)" }}>Proposed · Steward</p>
              <p className="ao-body-2 mt-1">The assistant's pre-read brief arrives in Phase 5. It will propose, never score.</p>
            </li>
          </ul>
        </aside>
      </div>

      {/* Decision Bar */}
      <div className="z-20 md:sticky md:bottom-0" style={{ background: "var(--card)", borderTop: "1px solid var(--linen)", boxShadow: "0 -6px 18px rgb(21 32 43 / .06)" }}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 md:px-8" style={{ minHeight: 64 }}>
          <div className="ao-mono flex min-w-0 items-center gap-2" style={{ fontSize: 12, color: "var(--ink-2)" }} aria-live="polite">
            {running ? <span style={{ color: "var(--engine)" }}>Running FRARI v1…</span> : d?.run ? (runFresh ? <>Last run {shortHash(d.run.output_hash)} · {ago(d.run.computed_at)} · evidence unchanged ✓</> : <span style={{ color: "var(--amber)" }}>Evidence changed since run {shortHash(d.run.output_hash)}</span>) : <span style={{ color: "var(--amber)" }}>No run yet</span>}
          </div>
          <button className="ao-btn ao-btn-secondary ao-btn-sm" onClick={runEngine} disabled={running || status === "certified"}><IconRefresh size={16} /> {d?.run ? "Re-run engine" : "Run engine"}</button>
          {inReview && (
            <label className="flex flex-1 cursor-pointer items-center gap-2.5" style={{ fontSize: 14, color: "var(--ink-2)", minWidth: 240 }}>
              <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--action)" }} />
              I reviewed the evidence and attest under the {BRAND.standard} standard
            </label>
          )}
          {!inReview && <span className="flex-1" />}
          <div className="flex flex-wrap items-center gap-2">
            {inReview && <>
              <button className="ao-btn ao-btn-secondary ao-btn-sm" disabled={busy} onClick={() => setSheet("return")}>Return with findings</button>
              <button className="ao-btn ao-btn-primary ao-btn-sm" disabled={!canDecide} onClick={() => setSheet("evaluate")}>Mark evaluated</button>
              <button className="ao-btn ao-btn-seal-outline ao-btn-sm" disabled={!canDecide || (score ?? 0) < 80} title={(score ?? 0) < 80 ? "Certification needs the Ready band (80+)" : undefined} onClick={() => setSheet("recommend")}>Recommend certification →</button>
            </>}
            {secondKeyLane && (isFirstKey
              ? <span className="ao-meta" style={{ color: "var(--ink-2)" }}>You submitted this review. A second reviewer must certify.</span>
              : <>
                <button className="ao-btn ao-btn-secondary ao-btn-sm" disabled={busy} onClick={() => setSheet("decline")}>Decline</button>
                <button className="ao-btn ao-btn-sm" style={{ background: "var(--seal)", color: "var(--ink)", border: "1px solid var(--seal)" }} disabled={busy || !runFresh} onClick={() => setSheet("approve")}>Approve certification</button>
              </>)}
          </div>
        </div>
        {inReview && why && <p className="ao-meta px-4 pb-2 md:px-8" style={{ marginTop: -4 }}>{why}</p>}
      </div>

      {sheet && <DecisionSheet kind={sheet} busy={busy} name={`${c.first_name} ${c.last_name}`} onCancel={() => setSheet(null)} onConfirm={(f) => decide(sheet, f)} />}
    </div>
  );
}

function DecisionSheet({ kind, busy, name, onCancel, onConfirm }: { kind: "return" | "evaluate" | "recommend" | "approve" | "decline"; busy: boolean; name: string; onCancel: () => void; onConfirm: (findings: string) => void }) {
  const [t, setT] = useState("");
  const meta = {
    return: { title: `Return ${name}'s record`, body: "Tell them, in plain words, what to add or fix. They'll see this.", min: 20, cta: "Return with findings", cls: "ao-btn-primary" },
    evaluate: { title: "Mark evaluated", body: "Summarize what you verified and anything a second reviewer should know.", min: 50, cta: "Mark evaluated", cls: "ao-btn-primary" },
    recommend: { title: "Recommend certification", body: "Summarize what you verified. A different reviewer must approve before the seal is issued.", min: 50, cta: "Recommend certification", cls: "ao-btn-primary" },
    approve: { title: "Approve certification", body: "You're the second key. The engine run is reproduced and the first reviewer's findings are on file.", min: 0, cta: "Approve and issue seal", cls: "" },
    decline: { title: "Decline certification", body: "Give the first reviewer a reason.", min: 20, cta: "Decline", cls: "ao-btn-primary" },
  }[kind];
  const ok = t.trim().length >= meta.min && !busy;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="sheet-title" className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: "rgb(21 32 43 / .32)" }} onKeyDown={(e) => e.key === "Escape" && onCancel()}>
      <div className="ao-card ao-reveal w-full max-w-[560px] p-6" style={{ boxShadow: "var(--sheet-shadow)", borderRadius: 14 }}>
        <h2 id="sheet-title" className="ao-h1" style={{ fontSize: 22 }}>{meta.title}</h2>
        <p className="ao-body-2 mt-1">{meta.body}</p>
        {meta.min > 0 && <>
          <label className="ao-label mt-4" htmlFor="findings">Findings</label>
          <textarea id="findings" autoFocus className="ao-input" style={{ height: 140, padding: 12, lineHeight: "22px" }} value={t} onChange={(e) => setT(e.target.value)} />
          <p className="ao-meta mt-1">{t.trim().length < meta.min ? `At least ${meta.min} characters (${t.trim().length})` : "Ready"}</p>
        </>}
        <div className="mt-5 flex justify-end gap-2">
          <button className="ao-btn ao-btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={`ao-btn ${meta.cls}`} style={kind === "approve" ? { background: "var(--seal)", color: "var(--ink)", border: "1px solid var(--seal)" } : undefined} disabled={!ok} onClick={() => onConfirm(t.trim())}>{busy ? "Saving…" : meta.cta}</button>
        </div>
      </div>
    </div>
  );
}

function RailRow({ s, isVerified, canAct, onView, onToggle }: { s: SlotState; isVerified: boolean; canAct: boolean; onView?: () => void; onToggle: () => void }) {
  const ident: Record<string, string> = { identity: "var(--d-slateblue)", housing: "var(--d-adobe)", work: "var(--d-juniper)", income: "var(--d-ledger)", consent: "var(--d-plum)" };
  const on = s.status !== "missing";
  return (
    <li className="ao-row px-5 py-3" style={{ borderTop: "1px solid var(--linen)" }}>
      <div className="flex items-center gap-3">
        <span aria-hidden style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: ident[s.area] }} />
        <span className="min-w-0 flex-1"><span className="block truncate" style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span><span className="ao-meta">{s.kind}</span></span>
        <StatusWord status={on ? (isVerified ? "verified" : "submitted") : "missing"} />
      </div>
      {on && (onView || canAct) && (
        <div className="mt-2 flex gap-1.5 pl-[15px]">
          {onView && <button className="ao-btn ao-btn-secondary ao-btn-sm" style={{ minHeight: 32, height: 32 }} onClick={onView}>View</button>}
          {canAct && <button className="ao-btn ao-btn-sm" aria-pressed={isVerified} style={{ minHeight: 32, height: 32, background: isVerified ? "var(--pine-tint)" : "var(--card)", color: "var(--ink)", border: `1px solid ${isVerified ? "var(--pine)" : "var(--rule)"}` }} onClick={onToggle}>{isVerified ? "✓ Verified" : "Verify ✓"}</button>}
        </div>
      )}
    </li>
  );
}

function Receipts({ run, fresh, loading }: { run: Run | null; fresh: Set<string>; loading: boolean }) {
  if (loading) return <div className="ao-skel" style={{ height: 240 }} />;
  if (!run) return <div className="ao-card p-6"><p className="ao-h2" style={{ fontSize: 16 }}>No engine run yet</p><p className="ao-body-2 mt-1">Run the engine to see which rules this record passes, with points and a hash anyone can reproduce.</p></div>;
  return (
    <div className="ao-card ao-reveal overflow-hidden">
      <table className="w-full text-left" style={{ fontSize: 14 }}>
        <caption className="sr-only">Rules checked in this run</caption>
        <thead><tr className="ao-meta" style={{ background: "var(--paper)" }}><th className="px-5 py-2.5 font-medium">Rule</th><th className="py-2.5 font-medium">Result</th><th className="px-5 py-2.5 text-right font-medium">Points</th></tr></thead>
        {run.dimension_scores.map((dm) => {
          const rows = [...(dm.rules_passed ?? []).map((r) => ({ r, ok: true })), ...(dm.rules_failed ?? []).map((r) => ({ r, ok: false }))];
          return (
            <tbody key={dm.domain}>
              <tr style={{ borderTop: "1px solid var(--linen)", background: "var(--paper)" }}>
                <th colSpan={3} className="px-5 py-2 text-left"><span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{DOMAIN_LABEL[dm.domain] ?? dm.domain}</span> <span className="ao-mono ao-meta">· {dm.score}/{dm.max_score}</span></th>
              </tr>
              {rows.map(({ r, ok }) => (
                <tr key={dm.domain + r} className={fresh.has(r) ? "ao-highlight" : ""} style={{ borderTop: "1px solid var(--linen)" }}>
                  <td className="px-5 py-2.5"><div style={{ fontWeight: 500 }}>{RULE_LABEL[r] ?? r}</div><div className="ao-mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{r}</div></td>
                  <td className="py-2.5" style={{ color: ok ? "var(--pine)" : "var(--ink-3)", fontWeight: 500, whiteSpace: "nowrap" }}>{ok ? <span className="inline-flex items-center gap-1"><IconCheck size={15} />Passed</span> : "— Missing"}</td>
                  <td className="ao-mono px-5 py-2.5 text-right" style={{ color: ok ? "var(--ink)" : "var(--ink-3)" }}>{ok ? "+" : ""}{RULES[r]?.domains[dm.domain] ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
      <div className="ao-mono flex flex-wrap gap-x-4 gap-y-1 px-5 py-3" style={{ fontSize: 12, color: "var(--ink-2)", background: "var(--vellum)", borderLeft: "2px solid var(--seal)" }}>
        <span>{run.ruleset_version}</span><span>input {shortHash(run.input_event_hash)}</span><span>output {shortHash(run.output_hash)}</span><span>{fmtMT(run.computed_at, true)}</span>
      </div>
    </div>
  );
}

function Timeline({ items, run }: { items: Detail["timeline"]; run: Run | null }) {
  const ev = [...items.map((t) => ({ at: t.created_at, text: `${STATE_LABEL[t.from_status ?? ""] ?? t.from_status ?? "—"} → ${STATE_LABEL[t.to_status] ?? t.to_status}`, who: t.actor ?? "" })), ...(run ? [{ at: run.computed_at, text: `Engine run ${shortHash(run.output_hash)}`, who: run.triggered_by }] : [])].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  if (!ev.length) return <div className="ao-card p-6 ao-body-2">No history yet.</div>;
  return (
    <ol className="ao-card overflow-hidden">
      {ev.map((e, i) => (
        <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3" style={{ borderTop: i ? "1px solid var(--linen)" : 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{e.text}</span>
          <span className="ao-meta">{e.who ? `${e.who} · ` : ""}{fmtMT(e.at, true)}</span>
        </li>
      ))}
    </ol>
  );
}

function StaffGate({ onIn }: { onIn: (e: string) => void }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await fetch(`${API}/auth/staff/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password: pw }) });
      if (!r.ok) { setErr("That email and password don't match a staff account."); return; }
      const d = await r.json();
      const em = d.staff?.email ?? email.trim().toLowerCase();
      localStorage.setItem(STAFF_TOKEN_KEY, d.token); localStorage.setItem(STAFF_EMAIL_KEY, em); setPw(""); onIn(em);
    } catch { setErr("We couldn't reach the server. Try again."); } finally { setBusy(false); }
  }
  return (
    <div className="ao-paper flex min-h-screen flex-col items-center justify-center px-5">
      <div className="mb-8"><Wordmark size="lg" /></div>
      <form onSubmit={submit} className="ao-card w-full max-w-[400px] p-7" style={{ boxShadow: "var(--sheet-shadow)" }}>
        <p className="ao-eyebrow">Reading Room</p>
        <h1 className="ao-h1 mt-1">Reviewer sign-in</h1>
        <p className="ao-body-2 mt-1">Staff access only.</p>
        <label className="ao-label mt-6" htmlFor="se">Email</label>
        <input id="se" className="ao-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="ao-label mt-4" htmlFor="sp">Password</label>
        <input id="sp" className="ao-input" type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
        {err && <p role="alert" className="mt-4 rounded-[8px] px-3 py-2.5" style={{ background: "var(--brick-tint)", color: "var(--ink)", fontSize: 14 }}><span aria-hidden style={{ color: "var(--brick)" }}>✕ </span>{err}</p>}
        <button className="ao-btn ao-btn-primary mt-6 w-full" disabled={busy || !email || !pw}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <Link href="/app/login" className="ao-link mt-6" style={{ fontSize: 14 }}>Looking for your own record?</Link>
    </div>
  );
}
