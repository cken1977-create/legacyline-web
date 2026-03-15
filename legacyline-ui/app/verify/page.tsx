"use client";

import { useState } from "react";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

type VerifyResult = {
  registry_id: string;
  readiness_state: "GREEN" | "YELLOW" | "RED";
  status: string;
  last_updated_at: string;
};

const STATE_CONFIG = {
  GREEN:  { label: "Green — Ready",        color: "#34D399", bg: "rgba(52,211,153,0.1)",  ring: "rgba(52,211,153,0.3)"  },
  YELLOW: { label: "Yellow — Developing",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  ring: "rgba(245,158,11,0.3)"  },
  RED:    { label: "Red — Pre-Readiness",  color: "#F87171", bg: "rgba(248,113,113,0.1)", ring: "rgba(248,113,113,0.3)" },
};

export default function VerifyPage() {
  const [rid, setRid] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify() {
    const clean = rid.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api<VerifyResult>(`/registry/v1/lookup?rid=${encodeURIComponent(clean)}`);
      setResult(data);
    } catch (err: any) {
      setError("No record found for that Registry ID.");
    } finally {
      setLoading(false);
    }
  }

  const cfg = result ? STATE_CONFIG[result.readiness_state] ?? STATE_CONFIG.RED : null;

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Verify Record</h2>
        <p className="mt-2 text-white/70">
          Enter a BRSA Registry ID to verify readiness standing.
        </p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={rid}
            onChange={(e) => setRid(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none focus:ring-white/25"
            placeholder="BRSA-26-XXXXXXXX"
          />
          <button
            onClick={handleVerify}
            disabled={loading || !rid.trim()}
            className="rounded-2xl bg-[#C8A84B] px-6 py-3 text-sm font-semibold text-[#0B1C30] hover:bg-[#E2C47A] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Checking..." : "Verify"}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && cfg && (
          <div className="mt-5 rounded-2xl p-5 ring-1" style={{ background: cfg.bg, boxShadow: `0 0 0 1px ${cfg.ring}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-white/50">Readiness Standing</div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded" style={{ color: cfg.color, background: cfg.bg, boxShadow: `0 0 0 1px ${cfg.ring}` }}>
                {result.readiness_state}
              </span>
            </div>
            <div className="text-lg font-bold mb-1" style={{ color: cfg.color }}>{cfg.label}</div>
            <div className="text-sm text-white/60 mb-4">Evidence-backed readiness classification per BRSA doctrine.</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Registry ID</div>
                <div className="text-white font-mono">{result.registry_id}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Status</div>
                <div className="text-white capitalize">{result.status}</div>
              </div>
              <div className="col-span-2">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Last Updated</div>
                <div className="text-white">{new Date(result.last_updated_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/35">
              Powered by BRSA Standards Authority · Deterministic · Auditable · Consent-based
            </div>
          </div>
        )}

        {!result && !error && !loading && (
          <div className="mt-7 rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Standing</div>
            <div className="mt-2 text-sm text-white/65">
              Green / Yellow / Red — evidence-backed readiness classification.
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
