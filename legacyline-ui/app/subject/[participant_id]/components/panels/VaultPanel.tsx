"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

type VaultSnapshot = {
  id: string;
  score: number;
  trajectory: string;
  computed_at: string;
};

type VaultStateEvent = {
  id: string;
  from_state: string;
  to_state: string;
  actor: string;
  reason: string;
  occurred_at: string;
};

type VaultEvaluation = {
  id: string;
  evaluator_email: string;
  status: string;
  domain_scores: any[];
  narrative_notes: string;
  ai_confidence: number | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string;
  created_at: string;
};

type VaultRecord = {
  participant_id: string;
  subject_number: number;
  first_name: string;
  last_name: string;
  current_status: string;
  organization_id: string;
  created_at: string;
  snapshots: VaultSnapshot[];
  state_history: VaultStateEvent[];
  evaluations: VaultEvaluation[];
  composite_score: number | null;
  trajectory: string;
};

function trajectoryColor(t: string) {
  if (t === "improving") return "#34D399";
  if (t === "declining") return "#F87171";
  return "#FBBF24";
}

function trajectoryIcon(t: string) {
  if (t === "improving") return "↑";
  if (t === "declining") return "↓";
  return "→";
}

function scoreColor(score: number) {
  if (score >= 70) return "#34D399";
  if (score >= 50) return "#FBBF24";
  return "#F87171";
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: "Draft",     color: "#8899AA", bg: "rgba(136,153,170,0.1)" },
    submitted: { label: "Submitted", color: "#C8A84B", bg: "rgba(200,168,75,0.1)" },
    approved:  { label: "Approved",  color: "#34D399", bg: "rgba(52,211,153,0.1)" },
    rejected:  { label: "Rejected",  color: "#F87171", bg: "rgba(248,113,113,0.1)" },
  };
  const s = map[status] ?? { label: status, color: "#8899AA", bg: "rgba(136,153,170,0.1)" };
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 999, fontSize: 11,
      fontWeight: 700, background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
    }}>
      {s.label}
    </span>
  );
}

export default function VaultPanel({ participantId }: { participantId: string }) {
  const [vault, setVault] = useState<VaultRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"snapshots" | "lifecycle" | "evaluations">("snapshots");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/participants/${participantId}/vault`);
        if (!res.ok) throw new Error("Failed to load vault");
        const data = await res.json();
        setVault(data);
      } catch (e: any) {
        setError(e.message ?? "Vault unavailable");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [participantId]);

  if (loading) return (
    <div style={{ padding: 24, color: "#8899AA", fontSize: 13 }}>
      Loading Readiness Vault...
    </div>
  );

  if (error || !vault) return (
    <div style={{ padding: 24, color: "#F87171", fontSize: 13 }}>
      {error || "Vault unavailable"}
    </div>
  );

  const tColor = trajectoryColor(vault.trajectory);
  const tIcon = trajectoryIcon(vault.trajectory);

  return (
    <div style={{
      background: "#0B1C30",
      border: "1px solid rgba(200,168,75,0.2)",
      borderRadius: 12, padding: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8899AA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Longitudinal Readiness Vault
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F4F6F9" }}>
            {vault.first_name} {vault.last_name}
          </div>
          <div style={{ fontSize: 12, color: "#8899AA", marginTop: 2 }}>
            Member since {fmt(vault.created_at)}
          </div>
        </div>

        {/* Composite Score */}
        <div style={{ textAlign: "right" }}>
          {vault.composite_score !== null ? (
            <>
              <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(vault.composite_score), lineHeight: 1 }}>
                {vault.composite_score}
              </div>
              <div style={{ fontSize: 12, color: tColor, fontWeight: 600, marginTop: 4 }}>
                {tIcon} {vault.trajectory.charAt(0).toUpperCase() + vault.trajectory.slice(1)}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#8899AA" }}>No score yet</div>
          )}
          <div style={{ fontSize: 10, color: "#8899AA", marginTop: 2 }}>Composite Readiness</div>
        </div>
      </div>

      {/* Score Timeline Bar */}
      {vault.snapshots.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 8 }}>Score History</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
            {vault.snapshots.map((s, i) => (
              <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ fontSize: 9, color: scoreColor(s.score), fontWeight: 700 }}>{s.score}</div>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0",
                  height: `${Math.max((s.score / 100) * 36, 4)}px`,
                  background: scoreColor(s.score),
                  opacity: i === vault.snapshots.length - 1 ? 1 : 0.5,
                }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 0 }}>
        {(["snapshots", "lifecycle", "evaluations"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 14px", borderRadius: "6px 6px 0 0",
              background: tab === t ? "rgba(200,168,75,0.12)" : "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid #C8A84B" : "2px solid transparent",
              color: tab === t ? "#C8A84B" : "#8899AA",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t === "snapshots" ? `Readiness (${vault.snapshots.length})` :
             t === "lifecycle" ? `Lifecycle (${vault.state_history.length})` :
             `Evaluations (${vault.evaluations.length})`}
          </button>
        ))}
      </div>

      {/* Snapshots Tab */}
      {tab === "snapshots" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vault.snapshots.length === 0 ? (
            <div style={{ color: "#8899AA", fontSize: 13 }}>No readiness snapshots yet.</div>
          ) : (
            [...vault.snapshots].reverse().map((s) => (
              <div key={s.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "#8899AA" }}>{fmt(s.computed_at)}</div>
                  <div style={{ fontSize: 11, color: trajectoryColor(s.trajectory), marginTop: 2, fontWeight: 600 }}>
                    {trajectoryIcon(s.trajectory)} {s.trajectory}
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(s.score) }}>
                  {s.score}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lifecycle Tab */}
      {tab === "lifecycle" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {vault.state_history.length === 0 ? (
            <div style={{ color: "#8899AA", fontSize: 13 }}>No lifecycle events yet.</div>
          ) : (
            vault.state_history.map((e, i) => (
              <div key={e.id} style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#C8A84B", marginTop: 3, flexShrink: 0,
                  }} />
                  {i < vault.state_history.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "rgba(200,168,75,0.2)", marginTop: 4 }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#F4F6F9", fontWeight: 600 }}>
                    {e.from_state === "none" ? "Registered" : `${e.from_state} → ${e.to_state}`}
                  </div>
                  {e.reason && (
                    <div style={{ fontSize: 11, color: "#8899AA", marginTop: 2 }}>{e.reason}</div>
                  )}
                  <div style={{ fontSize: 10, color: "#8899AA", marginTop: 2 }}>
                    {fmt(e.occurred_at)} · {e.actor}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Evaluations Tab */}
      {tab === "evaluations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {vault.evaluations.length === 0 ? (
            <div style={{ color: "#8899AA", fontSize: 13 }}>No evaluations on record.</div>
          ) : (
            vault.evaluations.map((e) => (
              <div key={e.id} style={{
                padding: "14px 16px", borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#8899AA" }}>
                    {fmt(e.created_at)} · {e.evaluator_email}
                  </div>
                  <StatusBadge status={e.status} />
                </div>

                {/* Domain scores */}
                {Array.isArray(e.domain_scores) && e.domain_scores.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {e.domain_scores.map((ds: any, i: number) => (
                      <div key={i} style={{
                        padding: "4px 10px", borderRadius: 6,
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}>
                        <span style={{ fontSize: 10, color: "#8899AA", textTransform: "capitalize" }}>
                          {ds.domain?.replace(/_readiness/, "")}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(ds.score), marginLeft: 6 }}>
                          {ds.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {e.ai_confidence !== null && (
                  <div style={{ fontSize: 11, color: "#8899AA" }}>
                    AI Confidence:{" "}
                    <span style={{
                      color: e.ai_confidence >= 0.8 ? "#34D399" : e.ai_confidence >= 0.6 ? "#F4F6F9" : "#FBBF24",
                      fontWeight: 600,
                    }}>
                      {((e.ai_confidence ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {e.approved_by && (
                  <div style={{ fontSize: 11, color: "#34D399", marginTop: 4 }}>
                    Approved by {e.approved_by} · {e.approved_at ? fmt(e.approved_at) : ""}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
    }
