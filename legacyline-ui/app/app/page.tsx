"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Types ──────────────────────────────────────────────────────────────────────

type VaultRecord = {
  participant_id: string;
  first_name: string;
  last_name: string;
  current_status: string;
  created_at: string;
  composite_score: number | null;
  trajectory: string;
  snapshots: any[];
  state_history: any[];
  evaluations: any[];
};

type IntakeData = {
  employment_status: string;
  housing_type: string;
  monthly_income: string;
  monthly_housing_cost: string;
  gov_id_url: string;
  selfie_url: string;
  bank_statement_url: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const DOMAINS = [
  { key: "housing", label: "Housing", icon: "🏠" },
  { key: "workforce", label: "Workforce", icon: "💼" },
  { key: "financial", label: "Financial", icon: "💰" },
  { key: "behavioral", label: "Behavioral", icon: "🧠" },
];

const STATUS_STEPS = [
  "registered", "data_collecting", "under_review", "evaluated", "certified"
];

const STATUS_LABELS: Record<string, string> = {
  registered: "Registered",
  data_collecting: "Data Collection",
  under_review: "Under Review",
  evaluated: "Evaluated",
  certified: "Certified",
};

// ── Nudge engine ───────────────────────────────────────────────────────────────

function generateNudges(vault: VaultRecord | null, intake: IntakeData | null): { id: string; title: string; description: string; impact: "high" | "medium" | "low"; domain: string; completed: boolean }[] {
  const nudges = [];

  if (!intake) {
    nudges.push({
      id: "complete_intake",
      title: "Complete your intake form",
      description: "Your intake form is the foundation of your readiness profile. Complete it to unlock your score.",
      impact: "high" as const,
      domain: "all",
      completed: false,
    });
  }

  if (intake && !intake.gov_id_url) {
    nudges.push({
      id: "upload_gov_id",
      title: "Upload your government ID",
      description: "Identity verification is required before your evaluation can begin.",
      impact: "high" as const,
      domain: "behavioral",
      completed: false,
    });
  }

  if (intake && !intake.selfie_url) {
    nudges.push({
      id: "upload_selfie",
      title: "Add your identity selfie",
      description: "A selfie with your ID confirms your identity and unlocks the review process.",
      impact: "high" as const,
      domain: "behavioral",
      completed: false,
    });
  }

  if (intake && !intake.bank_statement_url) {
    nudges.push({
      id: "upload_bank",
      title: "Upload your bank statement",
      description: "Financial documentation is the #1 factor in your Financial Readiness score.",
      impact: "high" as const,
      domain: "financial",
      completed: false,
    });
  }

  if (intake && intake.employment_status === "unemployed") {
    nudges.push({
      id: "workforce_gap",
      title: "Address your workforce gap",
      description: "Participants who document job search activity or training improve their Workforce score by an average of 22 points.",
      impact: "medium" as const,
      domain: "workforce",
      completed: false,
    });
  }

  if (vault?.current_status === "registered") {
    nudges.push({
      id: "move_to_review",
      title: "Move your profile to active review",
      description: "Your evaluator is ready. Complete your documents to advance to Under Review.",
      impact: "high" as const,
      domain: "all",
      completed: false,
    });
  }

  if (vault?.current_status === "evaluated") {
    nudges.push({
      id: "certification_pending",
      title: "Certification review in progress",
      description: "Your evaluation has been submitted to BRSA Standards Authority for certification review.",
      impact: "low" as const,
      domain: "all",
      completed: true,
    });
  }

  if (vault?.current_status === "certified") {
    nudges.push({
      id: "share_cert",
      title: "Share your certification",
      description: "You're BRSA certified. Share your readiness standing with lenders, employers, or housing authorities.",
      impact: "medium" as const,
      domain: "all",
      completed: true,
    });
  }

  if (nudges.length === 0) {
    nudges.push({
      id: "maintain",
      title: "Keep your profile current",
      description: "Update your documents every 90 days to maintain your readiness standing.",
      impact: "low" as const,
      domain: "all",
      completed: false,
    });
  }

  return nudges;
}

// ── Helper functions ───────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 70) return "#34D399";
  if (score >= 50) return "#FBBF24";
  return "#F87171";
}

function trajectoryIcon(t: string) {
  if (t === "improving") return "↑";
  if (t === "declining") return "↓";
  return "→";
}

function trajectoryColor(t: string) {
  if (t === "improving") return "#34D399";
  if (t === "declining") return "#F87171";
  return "#FBBF24";
}

function impactColor(impact: string) {
  if (impact === "high") return { color: "#F87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" };
  if (impact === "medium") return { color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" };
  return { color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" };
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Score ring component ───────────────────────────────────────────────────────

function ScoreRing({ score, size = 120 }: { score: number | null; size?: number }) {
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  const pct = score !== null ? Math.min(score, 100) / 100 : 0;
  const offset = circumference - pct * circumference;
  const color = score !== null ? scoreColor(score) : "#8899AA";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg) translate(0px, -${size}px)`, fontSize: score !== null ? size * 0.22 : size * 0.14, fontWeight: 800, fill: color }}
      >
        {score !== null ? score : "—"}
      </text>
    </svg>
  );
}

// ── Main app ───────────────────────────────────────────────────────────────────

export default function ParticipantApp() {
  const router = useRouter();
  const [tab, setTab] = useState<"home" | "score" | "docs" | "actions" | "profile">("home");
  const [vault, setVault] = useState<VaultRecord | null>(null);
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [registryId, setRegistryId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("individual_token");
    const pid = localStorage.getItem("participant_id");
    const fn = localStorage.getItem("user_first_name");

    if (!token || !pid) {
      router.replace("/app/login");
      return;
    }

    setParticipantId(pid);
    setFirstName(fn ?? "");

    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [vaultRes, meRes] = await Promise.all([
          fetch(`${API}/participants/${pid}/vault`),
          fetch(`${API}/auth/individual/me`, { headers }),
        ]);

        if (vaultRes.ok) {
          const v = await vaultRes.json();
          setVault(v);
        }

        if (meRes.ok) {
          const me = await meRes.json();
          setRegistryId(me.registry_id ?? "");
        }

        // Try to get intake
        const intakeRes = await fetch(`${API}/intake/${pid}`);
        if (intakeRes.ok) {
          const i = await intakeRes.json();
          setIntake(i);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function logout() {
    localStorage.clear();
    router.push("/app/login");
  }

  const nudges = generateNudges(vault, intake);
  const highNudges = nudges.filter(n => n.impact === "high" && !n.completed);
  const domainScores = vault?.evaluations?.[vault.evaluations.length - 1]?.domain_scores ?? [];
  const currentStatusIndex = STATUS_STEPS.indexOf(vault?.current_status ?? "registered");

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0B1C30",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(200,168,75,0.3)", borderTop: "3px solid #C8A84B", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "rgba(244,246,249,0.5)", fontSize: 13 }}>Loading your readiness profile...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0B1C30",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      maxWidth: 430, margin: "0 auto", position: "relative",
    }}>

      {/* Content area */}
      <div style={{ paddingBottom: 80 }}>

        {/* ── HOME TAB ── */}
        {tab === "home" && (
          <div>
            {/* Header */}
            <div style={{
              background: "linear-gradient(160deg, #1A3A5C 0%, #0B1C30 100%)",
              padding: "56px 24px 32px",
            }}>
              <div style={{ fontSize: 13, color: "rgba(200,168,75,0.8)", fontWeight: 600, marginBottom: 4 }}>
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#F4F6F9", marginBottom: 20 }}>
                {firstName} 👋
              </div>

              {/* Score card */}
              <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(200,168,75,0.2)",
                borderRadius: 20, padding: 20,
                display: "flex", alignItems: "center", gap: 20,
              }}>
                <ScoreRing score={vault?.composite_score ?? null} size={100} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "rgba(244,246,249,0.5)", marginBottom: 4 }}>
                    Composite Readiness Score
                  </div>
                  {vault?.composite_score !== null && vault?.trajectory ? (
                    <>
                      <div style={{ fontSize: 14, color: trajectoryColor(vault.trajectory), fontWeight: 600 }}>
                        {trajectoryIcon(vault.trajectory)} {vault.trajectory.charAt(0).toUpperCase() + vault.trajectory.slice(1)}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(244,246,249,0.35)", marginTop: 6 }}>
                        Based on {vault.snapshots.length} assessment{vault.snapshots.length !== 1 ? "s" : ""}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: "rgba(244,246,249,0.4)" }}>
                      Complete intake to unlock your score
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status pipeline */}
            <div style={{ padding: "20px 24px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(244,246,249,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Your Journey
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      {i > 0 && (
                        <div style={{ flex: 1, height: 2, background: i <= currentStatusIndex ? "#C8A84B" : "rgba(255,255,255,0.1)" }} />
                      )}
                      <div style={{
                        width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                        background: i < currentStatusIndex ? "#C8A84B" : i === currentStatusIndex ? "#C8A84B" : "rgba(255,255,255,0.15)",
                        border: i === currentStatusIndex ? "3px solid rgba(200,168,75,0.4)" : "none",
                        boxShadow: i === currentStatusIndex ? "0 0 0 4px rgba(200,168,75,0.15)" : "none",
                      }} />
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: i < currentStatusIndex ? "#C8A84B" : "rgba(255,255,255,0.1)" }} />
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: i === currentStatusIndex ? "#C8A84B" : "rgba(244,246,249,0.3)", marginTop: 6, textAlign: "center", fontWeight: i === currentStatusIndex ? 700 : 400 }}>
                      {STATUS_LABELS[s]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top nudge */}
            {highNudges.length > 0 && (
              <div style={{ padding: "20px 24px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(244,246,249,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Top Action
                </div>
                <div
                  onClick={() => setTab("actions")}
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    borderRadius: 16, padding: 16, cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                      🎯
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F4F6F9", marginBottom: 4 }}>
                        {highNudges[0].title}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(244,246,249,0.5)", lineHeight: 1.5 }}>
                        {highNudges[0].description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Domain quick view */}
            {domainScores.length > 0 && (
              <div style={{ padding: "20px 24px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(244,246,249,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Domain Scores
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {DOMAINS.map((d) => {
                    const ds = domainScores.find((s: any) => s.domain?.includes(d.key));
                    const score = ds?.score ?? null;
                    return (
                      <div key={d.key} style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 14, padding: "14px 16px",
                      }}>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>{d.icon}</div>
                        <div style={{ fontSize: 11, color: "rgba(244,246,249,0.5)", marginBottom: 4 }}>{d.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: score !== null ? scoreColor(score) : "rgba(244,246,249,0.2)" }}>
                          {score !== null ? score : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ height: 24 }} />
          </div>
        )}

        {/* ── SCORE TAB ── */}
        {tab === "score" && (
          <div style={{ padding: "56px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.8)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Readiness Score
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#F4F6F9", marginBottom: 24 }}>
              Your Full Breakdown
            </h2>

            {/* Big score ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", textAlign: "center" }}>
                <ScoreRing score={vault?.composite_score ?? null} size={160} />
                {vault?.trajectory && (
                  <div style={{ marginTop: 8, fontSize: 14, color: trajectoryColor(vault.trajectory), fontWeight: 600 }}>
                    {trajectoryIcon(vault.trajectory)} {vault.trajectory.charAt(0).toUpperCase() + vault.trajectory.slice(1)} trajectory
                  </div>
                )}
              </div>
            </div>

            {/* Domain bars */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(244,246,249,0.6)", marginBottom: 14 }}>
                Domain Breakdown
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {DOMAINS.map((d) => {
                  const ds = domainScores.find((s: any) => s.domain?.includes(d.key));
                  const score = ds?.score ?? null;
                  return (
                    <div key={d.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{d.icon}</span>
                          <span style={{ fontSize: 14, color: "#F4F6F9", fontWeight: 600 }}>{d.label} Readiness</span>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: score !== null ? scoreColor(score) : "rgba(244,246,249,0.3)" }}>
                          {score !== null ? score : "—"}
                        </span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
                        <div style={{
                          height: "100%", borderRadius: 4,
                          background: score !== null ? scoreColor(score) : "transparent",
                          width: score !== null ? `${score}%` : "0%",
                          transition: "width 1s ease",
                        }} />
                      </div>
                      {ds?.notes && (
                        <div style={{ fontSize: 11, color: "rgba(244,246,249,0.35)", marginTop: 4 }}>{ds.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score history */}
            {vault && vault.snapshots.length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(244,246,249,0.6)", marginBottom: 12 }}>
                  Score History
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...vault.snapshots].reverse().map((s: any) => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "rgba(244,246,249,0.4)" }}>{fmt(s.computed_at)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 11, color: trajectoryColor(s.trajectory) }}>
                          {trajectoryIcon(s.trajectory)}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(s.score) }}>{s.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vault?.composite_score === null && (
              <div style={{
                background: "rgba(200,168,75,0.08)",
                border: "1px solid rgba(200,168,75,0.2)",
                borderRadius: 16, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F4F6F9", marginBottom: 8 }}>
                  No score yet
                </div>
                <div style={{ fontSize: 13, color: "rgba(244,246,249,0.5)", lineHeight: 1.6 }}>
                  Complete your intake and document submission to receive your readiness score from a BRSA-certified evaluator.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {tab === "docs" && (
          <div style={{ padding: "56px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.8)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Documents
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#F4F6F9", marginBottom: 24 }}>
              Document Status
            </h2>

            {[
              { key: "gov_id_url", label: "Government-Issued ID", icon: "🪪", hint: "Driver's license, passport, or state ID" },
              { key: "selfie_url", label: "Identity Selfie", icon: "🤳", hint: "Clear photo of you holding your ID" },
              { key: "bank_statement_url", label: "Bank Statement", icon: "🏦", hint: "Last 30 days of statements" },
            ].map(({ key, label, icon, hint }) => {
              const uploaded = intake?.[key as keyof IntakeData];
              return (
                <div key={key} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${uploaded ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16, padding: 16, marginBottom: 12,
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: uploaded ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#F4F6F9", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "rgba(244,246,249,0.4)" }}>{hint}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                    background: uploaded ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                    color: uploaded ? "#34D399" : "#F87171",
                    border: `1px solid ${uploaded ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                  }}>
                    {uploaded ? "✓ On File" : "Missing"}
                  </div>
                </div>
              );
            })}

            {!intake ? (
              <div style={{
                background: "rgba(200,168,75,0.08)",
                border: "1px solid rgba(200,168,75,0.2)",
                borderRadius: 16, padding: 20, textAlign: "center", marginTop: 8,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F4F6F9", marginBottom: 8 }}>
                  Intake not yet completed
                </div>
                <div style={{ fontSize: 13, color: "rgba(244,246,249,0.5)", marginBottom: 16, lineHeight: 1.6 }}>
                  Complete your intake form to submit your documents.
                </div>
                <a
                  href={`/intake/${participantId}`}
                  style={{
                    display: "inline-block", padding: "12px 24px", borderRadius: 12,
                    background: "#C8A84B", color: "#0B1C30",
                    fontSize: 14, fontWeight: 700, textDecoration: "none",
                  }}
                >
                  Complete Intake →
                </a>
              </div>
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: 16, marginTop: 8,
              }}>
                <div style={{ fontSize: 12, color: "rgba(244,246,249,0.4)", marginBottom: 12 }}>
                  Need to update a document?
                </div>
                <a
                  href={`/intake/${participantId}`}
                  style={{
                    display: "block", padding: "12px 0", borderRadius: 12, textAlign: "center",
                    background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)",
                    color: "#C8A84B", fontSize: 14, fontWeight: 700, textDecoration: "none",
                  }}
                >
                  Update Intake Form →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIONS TAB ── */}
        {tab === "actions" && (
          <div style={{ padding: "56px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.8)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Actions
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#F4F6F9", marginBottom: 8 }}>
              Your Readiness Plan
            </h2>
            <p style={{ fontSize: 13, color: "rgba(244,246,249,0.4)", marginBottom: 24, lineHeight: 1.6 }}>
              These actions are personalized to your profile and ranked by score impact.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {nudges.map((nudge) => {
                const impact = impactColor(nudge.impact);
                return (
                  <div key={nudge.id} style={{
                    background: nudge.completed ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${nudge.completed ? "rgba(255,255,255,0.06)" : impact.border}`,
                    borderRadius: 16, padding: 16,
                    opacity: nudge.completed ? 0.6 : 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: nudge.completed ? "rgba(255,255,255,0.05)" : impact.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>
                        {nudge.completed ? "✓" : nudge.impact === "high" ? "🔴" : nudge.impact === "medium" ? "🟡" : "🟢"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: nudge.completed ? "rgba(244,246,249,0.4)" : "#F4F6F9" }}>
                            {nudge.title}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, marginLeft: 8, flexShrink: 0,
                            background: impact.bg, color: impact.color, border: `1px solid ${impact.border}`,
                          }}>
                            {nudge.impact.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(244,246,249,0.5)", lineHeight: 1.6 }}>
                          {nudge.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div style={{ padding: "56px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.8)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Profile
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#F4F6F9", marginBottom: 24 }}>
              {firstName} {localStorage.getItem("user_last_name")}
            </h2>

            {/* Certification badge */}
            {vault?.current_status === "certified" && (
              <div style={{
                background: "linear-gradient(135deg, rgba(200,168,75,0.2) 0%, rgba(200,168,75,0.05) 100%)",
                border: "1px solid rgba(200,168,75,0.4)",
                borderRadius: 20, padding: 20, marginBottom: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#C8A84B", marginBottom: 4 }}>
                  BRSA Certified
                </div>
                <div style={{ fontSize: 12, color: "rgba(200,168,75,0.7)" }}>
                  Verified Readiness Standing
                </div>
              </div>
            )}

            {/* Identity cards */}
            {[
              { label: "Registry ID", value: registryId || "Pending", mono: true },
              { label: "Participant ID", value: participantId, mono: true },
              { label: "Current Status", value: STATUS_LABELS[vault?.current_status ?? "registered"] || "Registered", mono: false },
              { label: "Member Since", value: vault?.created_at ? fmt(vault.created_at) : "—", mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "rgba(244,246,249,0.4)" }}>{label}</span>
                <span style={{
                  fontSize: mono ? 11 : 13, fontWeight: 600, color: "#F4F6F9",
                  fontFamily: mono ? "monospace" : "inherit",
                  maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {value}
                </span>
              </div>
            ))}

            {/* Verify link */}
            {registryId && (
              <a
                href={`/verify?rid=${registryId}`}
                style={{
                  display: "block", padding: "14px 0", borderRadius: 14, textAlign: "center",
                  background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)",
                  color: "#C8A84B", fontSize: 14, fontWeight: 700, textDecoration: "none",
                  marginBottom: 12,
                }}
              >
                Verify My Readiness Standing →
              </a>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 14,
                background: "transparent", border: "1px solid rgba(248,113,113,0.3)",
                color: "#F87171", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Sign Out
            </button>

            <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "rgba(244,246,249,0.2)" }}>
              © 2026 Legacyline · Powered by BRSA doctrine
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "rgba(11,28,48,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", padding: "8px 0 20px",
        zIndex: 100,
      }}>
        {[
          { key: "home", icon: "🏠", label: "Home" },
          { key: "score", icon: "📊", label: "Score" },
          { key: "docs", icon: "📄", label: "Docs" },
          { key: "actions", icon: "⚡", label: "Actions" },
          { key: "profile", icon: "👤", label: "Profile" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            style={{
              flex: 1, background: "none", border: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              cursor: "pointer", padding: "8px 0",
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
            <span style={{
              fontSize: 10, fontWeight: tab === key ? 700 : 400,
              color: tab === key ? "#C8A84B" : "rgba(244,246,249,0.35)",
            }}>
              {label}
            </span>
            {tab === key && (
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C8A84B" }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
                        }
