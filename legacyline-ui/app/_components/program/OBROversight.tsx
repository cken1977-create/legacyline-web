"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "../../../lib/api";

export type OversightEntry = { id?: string; at: string; who: string; action: string; reason: string };

const ACTIONS = [
  { key: "flag", label: "Flag", help: "Mark something to look at. Status doesn't change." },
  { key: "pause", label: "Pause", help: "Stop the rating from being issued until resumed." },
  { key: "send_back", label: "Send back", help: "Return to the evaluator to fix or add evidence." },
  { key: "resume", label: "Resume", help: "Lift a pause." },
  { key: "note", label: "Note", help: "Add a note to the log." },
] as const;
const LABEL: Record<string, string> = { flag: "Flagged", pause: "Paused", send_back: "Sent back", resume: "Resumed", note: "Note" };
const MIN_REASON = 10;

const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Denver", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) + " MT";

/**
 * Human oversight of an organization rating: flag, pause, send back, resume or note,
 * each with a required written reason that goes into a permanent log.
 * There is deliberately no way to enter or change a score here.
 * In the demo (`demo` set), actions are added to the on-screen log only. Nothing is saved.
 */
export default function OBROversight({ obrSubjectId, demo, dark }: { obrSubjectId: string; demo?: OversightEntry[]; dark?: boolean }) {
  const [log, setLog] = useState<OversightEntry[]>(demo ?? []);
  const [action, setAction] = useState<string>("flag");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const ink = dark ? "#F4F6F9" : "var(--ink)";
  const dim = dark ? "#AEB9C5" : "var(--ink-3)";
  const line = dark ? "rgba(255,255,255,0.1)" : "var(--linen)";
  const field = dark ? { background: "#0B1C30", color: "#F4F6F9", border: "1px solid rgba(255,255,255,0.15)" } : { background: "var(--card)", color: "var(--ink)", border: "1px solid var(--linen)" };

  useEffect(() => {
    if (demo) return;
    fetch(`/api/core/obr/subjects/${obrSubjectId}/oversight`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j?.log) setLog(j.log.map((e: { id: string; actor: string; action: string; reason: string; created_at: string }) => ({ id: e.id, at: fmt(e.created_at), who: e.actor, action: LABEL[e.action] ?? e.action, reason: e.reason }))); })
      .catch(() => {});
  }, [obrSubjectId, demo]);

  async function submit() {
    const why = reason.trim();
    if (why.length < MIN_REASON) { setMsg({ ok: false, text: `Write a reason of at least ${MIN_REASON} characters. Every oversight action is logged with its reason.` }); return; }
    setBusy(true); setMsg(null);
    try {
      if (demo) {
        setLog((l) => [...l, { at: fmt(new Date().toISOString()), who: "You (demo overseer)", action: LABEL[action], reason: why }]);
        setMsg({ ok: true, text: "Added to the log on this screen. Demo: nothing is saved." });
      } else {
        const res = await fetch(`/api/core/obr/subjects/${obrSubjectId}/oversight`, { method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ action, reason: why }) });
        const j = await res.json().catch(() => null);
        if (!res.ok) throw new Error(j?.message ?? j?.error ?? "Couldn't log the action");
        setLog((l) => [{ id: j?.id, at: fmt(j?.created_at ?? new Date().toISOString()), who: "You", action: LABEL[action], reason: why }, ...l]);
        setMsg({ ok: true, text: "Logged." });
      }
      setReason("");
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Couldn't log the action" });
    } finally { setBusy(false); }
  }

  return (
    <section aria-labelledby="oversight-h" style={{ color: ink }}>
      <h3 id="oversight-h" style={{ fontSize: 16, fontWeight: 700 }}>Oversight</h3>
      <p style={{ fontSize: 13, color: dim, marginTop: 4 }}>You can flag, pause or send back with a written reason. Every action is logged permanently. You can&apos;t enter or change a score: scores are computed by the rules from verified evidence.</p>
      <div role="radiogroup" aria-label="Oversight action" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {ACTIONS.map((a) => (
          <button key={a.key} type="button" role="radio" aria-checked={action === a.key} title={a.help} onClick={() => setAction(a.key)}
            style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 40,
              border: `1px solid ${action === a.key ? (dark ? "#C8A84B" : "var(--ink)") : line}`,
              background: action === a.key ? (dark ? "rgba(200,168,75,0.15)" : "var(--vellum)") : "transparent", color: ink }}>
            {a.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: dim, marginTop: 6 }}>{ACTIONS.find((a) => a.key === action)?.help}</p>
      <label htmlFor="oversight-reason" style={{ display: "block", fontSize: 13, fontWeight: 600, marginTop: 10 }}>Reason (required)</label>
      <textarea id="oversight-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: Audit letter covers FY2024. Confirm no newer audit exists."
        style={{ ...field, width: "100%", borderRadius: 8, padding: 10, fontSize: 14, marginTop: 4, fontFamily: "inherit" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={submit} disabled={busy}
          style={{ padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", minHeight: 40, background: dark ? "#C8A84B" : "var(--ink)", color: dark ? "#0B1C30" : "var(--paper, #fff)" }}>
          {busy ? "Logging…" : `Log: ${ACTIONS.find((a) => a.key === action)?.label}`}
        </button>
        <span style={{ fontSize: 12, color: dim }}>{reason.trim().length}/{MIN_REASON}+ characters</span>
        {msg && <span role="status" style={{ fontSize: 13, color: msg.ok ? (dark ? "#34D399" : "var(--pine)") : (dark ? "#F87171" : "#9b2c1f") }}>{msg.text}</span>}
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, marginTop: 16 }}>Oversight log (permanent; entries can&apos;t be edited or deleted)</p>
      {log.length === 0 ? <p style={{ fontSize: 13, color: dim, marginTop: 4 }}>No oversight actions yet.</p> : (
        <ol style={{ listStyle: "none", padding: 0, marginTop: 6, fontSize: 14 }}>
          {log.map((e, i) => (
            <li key={e.id ?? `${e.at}-${i}`} style={{ borderBottom: `1px solid ${line}`, padding: "8px 0", display: "grid", gridTemplateColumns: "minmax(150px,190px) 110px 1fr", gap: 10 }} className="oversight-row">
              <span style={{ fontSize: 12, color: dim, fontFamily: "var(--font-mono, monospace)" }}>{e.at}</span>
              <span style={{ fontWeight: 600 }}>{e.action}</span>
              <span>{e.reason} <span style={{ fontSize: 12, color: dim }}>· {e.who}</span></span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
