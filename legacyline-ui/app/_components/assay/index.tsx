"use client";
import { useState } from "react";
import { BRAND } from "../../../lib/brand";
import { bandFor } from "../../../lib/bands";
import { RULESET_LABEL, fmtMT, shortHash } from "../../../lib/frari";
import { IconCheck, IconCopy, IconRefresh } from "./icons";

/** Kamili mark: a ring that is almost closed — it closes as the record completes. */
export function Mark({ size = 28, progress = 0.86, tone = "ink" }: { size?: number; progress?: number; tone?: "ink" | "cream" }) {
  const r = 10.5, c = 2 * Math.PI * r;
  const color = tone === "ink" ? "var(--ink)" : "var(--cream)";
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
      <circle cx="14" cy="14" r={r} fill="none" stroke={tone === "ink" ? "var(--linen)" : "rgb(244 239 230 / .22)"} strokeWidth="2.5" />
      <circle cx="14" cy="14" r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${c * progress} ${c}`} transform="rotate(-90 14 14)" />
      <circle cx="14" cy="14" r="3" fill="var(--seal)" />
    </svg>
  );
}

export function Wordmark({ tone = "ink", size = "md" }: { tone?: "ink" | "cream"; size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label={BRAND.name}>
      <Mark tone={tone} size={size === "lg" ? 32 : 26} />
      <span className="ao-serif" style={{ fontSize: size === "lg" ? 26 : 21, fontWeight: 600, letterSpacing: "-0.01em", color: tone === "ink" ? "var(--ink)" : "var(--cream)" }}>{BRAND.name}</span>
    </span>
  );
}

export function BandChip({ score, certified }: { score: number | null; certified?: boolean }) {
  if (certified) return <span className="ao-chip chip-certified">Certified</span>;
  const b = bandFor(score);
  return (
    <span className={`ao-chip chip-${b.key}`}>
      {b.key !== "none" && b.key !== "pre" && b.key !== "ready" && <span className="ao-chip-dot" />}
      {b.label}
    </span>
  );
}

export type HallmarkState = "current" | "running" | "verified" | "stale" | "none";

export function Hallmark({ runId, outputHash, at, state = "current", onVerify, compact }: { runId?: string; outputHash?: string; at?: string; state?: HallmarkState; onVerify?: () => void; compact?: boolean }) {
  if (state === "none") return <span className="ao-hallmark is-none ao-mono">Not yet assessed</span>;
  return (
    <span className={`ao-hallmark ao-mono`} aria-label={`${RULESET_LABEL}, run ${runId ?? ""}, output hash ${outputHash ?? ""}, ${fmtMT(at)}`}>
      <span>{compact ? "FRARI v1" : RULESET_LABEL}</span>
      <span className="sep" aria-hidden>·</span>
      <span title={outputHash}>run {shortHash(outputHash)}</span>
      {!compact && <><span className="sep" aria-hidden>·</span><span>{fmtMT(at)}</span></>}
      {state === "running" && <span style={{ color: "var(--engine)" }}>Running…</span>}
      {state === "verified" && <span style={{ color: "var(--pine)", display: "inline-flex", alignItems: "center", gap: 3 }}><IconCheck size={14} />Reproduced</span>}
      {state === "stale" && <span style={{ color: "var(--amber)", display: "inline-flex", alignItems: "center", gap: 5 }}><span className="ao-chip-dot" style={{ background: "var(--amber)" }} />Evidence changed since this run</span>}
      {state === "current" && onVerify && (
        <button type="button" className="ao-verify" onClick={onVerify}>Verify <IconRefresh size={13} /></button>
      )}
    </span>
  );
}

export function CopyMono({ value, label }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="ao-mono" style={{ fontSize: 13, color: "var(--ink-2)" }} aria-label={label ? `${label} ${value}` : value}>{value}</span>
      <button type="button" className="ao-btn-quiet" style={{ height: 28, minHeight: 28, padding: "0 6px", borderRadius: 6, background: "none", border: 0, color: done ? "var(--pine)" : "var(--ink-3)", cursor: "pointer" }} aria-label={`Copy ${label ?? "value"}`}
        onClick={() => { navigator.clipboard?.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1600); }).catch(() => {}); }}>
        {done ? <IconCheck size={15} /> : <IconCopy size={15} />}
      </button>
    </span>
  );
}

export function Completeness({ filled, total, size = 132 }: { filled: number; total: number; size?: number }) {
  const pct = total ? Math.round((filled / total) * 100) : 0;
  const r = size / 2 - 9, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`Record ${pct}% complete, ${filled} of ${total} on file`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--vellum)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .8s cubic-bezier(.2,.7,.2,1)" }} />
        {pct === 100 && <circle cx={size / 2} cy={size / 2} r={6} fill="var(--seal)" />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="ao-mono" style={{ fontSize: 28, lineHeight: "32px", fontWeight: 500, color: "var(--ink)" }}>{pct}<span style={{ fontSize: 16, color: "var(--ink-3)" }}>%</span></span>
        <span className="ao-meta">{filled} of {total}</span>
      </div>
    </div>
  );
}

export function StatusWord({ status }: { status: "missing" | "submitted" | "verified" | "expired" | "rejected" }) {
  const map = {
    missing: { g: "—", w: "Missing", c: "var(--ink-3)" },
    submitted: { g: "○", w: "On file", c: "var(--ink-2)" },
    verified: { g: "✓", w: "Verified", c: "var(--pine)" },
    expired: { g: "⧗", w: "Expired", c: "var(--amber)" },
    rejected: { g: "✕", w: "Needs a new copy", c: "var(--brick)" },
  }[status];
  return <span style={{ color: map.c, fontSize: 14, fontWeight: 500, display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}><span aria-hidden style={{ width: 14, textAlign: "center" }}>{map.g}</span>{map.w}</span>;
}

export function DemoBanner({ children }: { children?: React.ReactNode }) {
  return (
    <div role="note" className="ao-noprint" style={{ background: "var(--seal-tint)", color: "var(--ink)", borderBottom: "1px solid var(--linen)", fontSize: 13, lineHeight: "18px", padding: "8px 16px", textAlign: "center" }}>
      <strong style={{ fontWeight: 600 }}>Sample record.</strong> {children ?? "Fictional demo data for design review. Not a real person; nothing here is saved."}
    </div>
  );
}
