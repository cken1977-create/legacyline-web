"use client";

import { useState, useEffect, useRef } from "react";
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
  docs_uploaded: {
    gov_id: boolean;
    selfie: boolean;
    bank_statement: boolean;
  };
};

// ── Constants ──────────────────────────────────────────────────────────────────

const DOMAINS = [
  { key: "housing", label: "Housing", icon: "⌂", color: "#4F9EFF" },
  { key: "workforce", label: "Workforce", icon: "◈", color: "#A78BFA" },
  { key: "financial", label: "Financial", icon: "◆", color: "#34D399" },
  { key: "behavioral", label: "Behavioral", icon: "◉", color: "#FB923C" },
];

const STATUS_STEPS = ["registered", "data_collecting", "under_review", "evaluated", "certified"];

const STATUS_LABELS: Record<string, string> = {
  registered: "Registered",
  data_collecting: "Data Collection",
  under_review: "Under Review",
  evaluated: "Evaluated",
  certified: "Certified",
};

// ── Nudge engine ───────────────────────────────────────────────────────────────

function generateNudges(vault: VaultRecord | null, intake: IntakeData | null) {
  const nudges = [];
  if (!intake) nudges.push({ id: "complete_intake", title: "Complete your intake form", description: "Your intake form is the foundation of your readiness profile.", impact: "high" as const, domain: "all", completed: false, points: 15 });
  if (intake && !intake.docs_uploaded?.gov_id) nudges.push({ id: "upload_gov_id", title: "Upload your government ID", description: "Identity verification unlocks your evaluation.", impact: "high" as const, domain: "behavioral", completed: false, points: 20 });
  if (intake && !intake.docs_uploaded?.selfie) nudges.push({ id: "upload_selfie", title: "Add your identity selfie", description: "A selfie with your ID confirms your identity.", impact: "high" as const, domain: "behavioral", completed: false, points: 25 });
  if (intake && !intake.docs_uploaded?.bank_statement) nudges.push({ id: "upload_bank", title: "Upload your bank statement", description: "Financial documentation is the #1 factor in your Financial score.", impact: "high" as const, domain: "financial", completed: false, points: 35 });
  if (intake?.employment_status === "unemployed") nudges.push({ id: "workforce_gap", title: "Document your job search activity", description: "Participants who document job search activity improve their Workforce score by an average of 22 points.", impact: "medium" as const, domain: "workforce", completed: false, points: 22 });
  if (vault?.current_status === "certified") nudges.push({ id: "share_cert", title: "Share your certification", description: "You're BRSA certified. Share your standing with lenders, employers, or housing authorities.", impact: "medium" as const, domain: "all", completed: true, points: 0 });
  if (nudges.length === 0) nudges.push({ id: "maintain", title: "Keep your profile current", description: "Update your documents every 90 days to maintain your readiness standing.", impact: "low" as const, domain: "all", completed: false, points: 5 });
  return nudges;
}


// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 70) return "#34D399";
  if (score >= 50) return "#F59E0B";
  return "#F87171";
}

function trajectoryColor(t: string) {
  if (t === "improving") return "#34D399";
  if (t === "declining") return "#F87171";
  return "#F59E0B";
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Animated Score Ring ────────────────────────────────────────────────────────

function ScoreRing({ score, size = 160 }: { score: number | null; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = (size / 2) - 12;
  const circumference = 2 * Math.PI * r;
  const pct = animatedScore / 100;
  const offset = circumference - pct * circumference;
  const color = score !== null ? scoreColor(score) : "#8899AA";

  useEffect(() => {
    if (score === null) return;
    const target = score;
    const duration = 1500;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        {/* Progress */}
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 0.1s ease" }}
        />
      </svg>
      {/* Center content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontSize: score !== null ? size * 0.26 : size * 0.14,
          fontWeight: 900, color,
          fontFamily: "'Clash Display', 'SF Pro Display', system-ui",
          lineHeight: 1,
          textShadow: score !== null ? `0 0 20px ${color}66` : "none",
        }}>
          {score !== null ? animatedScore : "—"}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>
          {score !== null ? "Readiness" : "No Score"}
        </div>
      </div>
    </div>
  );
}

// ── Animated Domain Bar ────────────────────────────────────────────────────────

function DomainBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), delay + 300);
    return () => clearTimeout(t);
  }, [score, delay]);
  return (
    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 3,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        width: `${width}%`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }} />
    </div>
  );
}

// ── Glass Card ─────────────────────────────────────────────────────────────────

function GlassCard({ children, style = {}, gold = false, onClick }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  gold?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: gold
          ? "linear-gradient(135deg, rgba(200,168,75,0.12) 0%, rgba(200,168,75,0.04) 100%)"
          : "rgba(255,255,255,0.04)",
        border: gold ? "1px solid rgba(200,168,75,0.25)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        backdropFilter: "blur(20px)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────

export default function ParticipantApp() {
  const router = useRouter();
  const [tab, setTab] = useState<"home" | "score" | "docs" | "actions" | "profile">("home");
  const [vault, setVault] = useState<VaultRecord | null>(null);
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [registryId, setRegistryId] = useState("");
  const [prevTab, setPrevTab] = useState<string>("home");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("individual_token");
    const pid = localStorage.getItem("participant_id");
    const fn = localStorage.getItem("user_first_name");
    const ln = localStorage.getItem("user_last_name");
    if (!token || !pid) { router.replace("/app/login"); return; }
    setParticipantId(pid);
    setFirstName(fn ?? "");
    setLastName(ln ?? "");

    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [vaultRes, meRes, intakeRes] = await Promise.allSettled([
          fetch(`${API}/participants/${pid}/vault`),
          fetch(`${API}/auth/individual/me`, { headers }),
          fetch(`${API}/intake/by-participant/${pid}`),
        ]);
        if (vaultRes.status === "fulfilled" && vaultRes.value.ok) setVault(await vaultRes.value.json());
        if (meRes.status === "fulfilled" && meRes.value.ok) { const me = await meRes.value.json(); setRegistryId(me.registry_id ?? ""); }
        if (intakeRes.status === "fulfilled" && intakeRes.value.ok) setIntake(await intakeRes.value.json());
      } finally { setLoading(false); }
    }
    load();
  }, [router]);

  function switchTab(newTab: typeof tab) {
    setPrevTab(tab);
    setTab(newTab);
    if (contentRef.current) {
      contentRef.current.style.opacity = "0";
      contentRef.current.style.transform = "translateY(8px)";
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.opacity = "1";
          contentRef.current.style.transform = "translateY(0)";
        }
      }, 150);
    }
  }

  function logout() { localStorage.clear(); router.push("/app/login"); }

  const nudges = generateNudges(vault, intake);
  const highNudges = nudges.filter(n => n.impact === "high" && !n.completed);
  const domainScores = vault?.evaluations?.[vault.evaluations.length - 1]?.domain_scores ?? [];
  const currentStatusIndex = STATUS_STEPS.indexOf(vault?.current_status ?? "registered");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isCertified = vault?.current_status === "certified";

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 50%, #1a1040 0%, #0a0a0f 60%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(200,168,75,0.15)",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#C8A84B",
            animation: "spin 1s linear infinite",
          }} />
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Loading
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: 430, margin: "0 auto",
      position: "relative", overflow: "hidden",
    }}>

      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 40% at 20% 10%, rgba(79,158,255,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 80%, rgba(200,168,75,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 40% 60% at 50% 50%, rgba(52,211,153,0.03) 0%, transparent 70%)
        `,
      }} />

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          paddingBottom: 90, position: "relative", zIndex: 1,
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >

        {/* ── HOME ── */}
        {tab === "home" && (
          <div>
            {/* Hero header */}
            <div style={{
              padding: "60px 24px 32px",
              background: "linear-gradient(180deg, rgba(79,158,255,0.08) 0%, transparent 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              {/* Status pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999, marginBottom: 16,
                background: isCertified ? "rgba(52,211,153,0.12)" : "rgba(200,168,75,0.1)",
                border: `1px solid ${isCertified ? "rgba(52,211,153,0.25)" : "rgba(200,168,75,0.2)"}`,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: isCertified ? "#34D399" : "#C8A84B",
                  boxShadow: `0 0 6px ${isCertified ? "#34D399" : "#C8A84B"}`,
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  color: isCertified ? "#34D399" : "#C8A84B",
                  textTransform: "uppercase",
                }}>
                  {STATUS_LABELS[vault?.current_status ?? "registered"]}
                </span>
              </div>

              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                {greeting},
              </div>
              <div style={{
                fontSize: 30, fontWeight: 800, color: "#fff",
                letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: 24,
              }}>
                {firstName} {lastName}
              </div>

              {/* Score ring + stats */}
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <ScoreRing score={vault?.composite_score ?? null} size={140} />
                <div style={{ flex: 1 }}>
                  {vault?.composite_score !== null && vault?.trajectory ? (
                    <>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: trajectoryColor(vault.trajectory), marginBottom: 8,
                      }}>
                        {vault.trajectory === "improving" ? "↑" : vault.trajectory === "declining" ? "↓" : "→"} {vault.trajectory.charAt(0).toUpperCase() + vault.trajectory.slice(1)}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                        Based on {vault.snapshots.length} assessment{vault.snapshots.length !== 1 ? "s" : ""}
                      </div>
                      {vault.snapshots.length > 1 && (
                        <div style={{
                          display: "flex", alignItems: "flex-end", gap: 3,
                          marginTop: 12, height: 32,
                        }}>
                          {vault.snapshots.slice(-6).map((s: any, i: number) => (
                            <div key={i} style={{
                              flex: 1, borderRadius: "3px 3px 0 0",
                              background: scoreColor(s.score),
                              opacity: 0.4 + (i / vault.snapshots.slice(-6).length) * 0.6,
                              height: `${Math.max((s.score / 100) * 32, 4)}px`,
                            }} />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                      Complete your intake to unlock your score
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Journey pipeline */}
            <div style={{ padding: "20px 24px 0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
                Your Journey
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      {i > 0 && (
                        <div style={{
                          flex: 1, height: 1,
                          background: i <= currentStatusIndex
                            ? "linear-gradient(90deg, #C8A84B, #C8A84B88)"
                            : "rgba(255,255,255,0.08)",
                        }} />
                      )}
                      <div style={{
                        width: i === currentStatusIndex ? 14 : 10,
                        height: i === currentStatusIndex ? 14 : 10,
                        borderRadius: "50%", flexShrink: 0,
                        background: i < currentStatusIndex ? "#C8A84B"
                          : i === currentStatusIndex ? "#C8A84B"
                          : "rgba(255,255,255,0.1)",
                        boxShadow: i === currentStatusIndex ? "0 0 0 4px rgba(200,168,75,0.15), 0 0 12px rgba(200,168,75,0.4)" : "none",
                        transition: "all 0.3s ease",
                      }} />
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{
                          flex: 1, height: 1,
                          background: i < currentStatusIndex
                            ? "#C8A84B88"
                            : "rgba(255,255,255,0.08)",
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: 9, marginTop: 7, textAlign: "center",
                      color: i === currentStatusIndex ? "#C8A84B" : "rgba(255,255,255,0.2)",
                      fontWeight: i === currentStatusIndex ? 700 : 400,
                      letterSpacing: "0.05em",
                    }}>
                      {STATUS_LABELS[s].split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top action nudge */}
            {highNudges.length > 0 && (
              <div style={{ padding: "20px 24px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
                  Priority Action
                </div>
                <GlassCard
                  onClick={() => switchTab("actions")}
                  style={{ padding: 16 }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: "rgba(248,113,113,0.12)",
                      border: "1px solid rgba(248,113,113,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>
                      ◎
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{highNudges[0].title}</div>
                        <div style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, marginLeft: 8,
                          background: "rgba(248,113,113,0.12)", color: "#F87171",
                          border: "1px solid rgba(248,113,113,0.2)",
                          whiteSpace: "nowrap" as const,
                        }}>
                          +{highNudges[0].points} pts
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                        {highNudges[0].description}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Domain quick view */}
            {domainScores.length > 0 && (
              <div style={{ padding: "20px 24px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
                  Domain Scores
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {DOMAINS.map((d, i) => {
                    const ds = domainScores.find((s: any) => s.domain?.includes(d.key));
                    const score = ds?.score ?? null;
                    return (
                      <GlassCard key={d.key} style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 18, marginBottom: 8, color: d.color }}>{d.icon}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{d.label}</div>
                        <div style={{
                          fontSize: 24, fontWeight: 800, lineHeight: 1, marginBottom: 8,
                          color: score !== null ? scoreColor(score) : "rgba(255,255,255,0.15)",
                        }}>
                          {score !== null ? score : "—"}
                        </div>
                        {score !== null && <DomainBar score={score} color={d.color} delay={i * 100} />}
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ height: 24 }} />
          </div>
        )}

        {/* ── SCORE ── */}
        {tab === "score" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
              Readiness Score
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 32 }}>
              Full Breakdown
            </div>

            {/* Big ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <div style={{ textAlign: "center" }}>
                <ScoreRing score={vault?.composite_score ?? null} size={180} />
                {vault?.trajectory && (
                  <div style={{
                    marginTop: 12, fontSize: 14, fontWeight: 600,
                    color: trajectoryColor(vault.trajectory),
                  }}>
                    {vault.trajectory === "improving" ? "↑" : vault.trajectory === "declining" ? "↓" : "→"} {vault.trajectory.charAt(0).toUpperCase() + vault.trajectory.slice(1)} trajectory
                  </div>
                )}
              </div>
            </div>

            {/* Domain bars */}
            <GlassCard style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
                Domain Breakdown
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {DOMAINS.map((d, i) => {
                  const ds = domainScores.find((s: any) => s.domain?.includes(d.key));
                  const score = ds?.score ?? null;
                  return (
                    <div key={d.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16, color: d.color }}>{d.icon}</span>
                          <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{d.label}</span>
                        </div>
                        <span style={{
                          fontSize: 18, fontWeight: 800,
                          color: score !== null ? scoreColor(score) : "rgba(255,255,255,0.2)",
                        }}>
                          {score !== null ? score : "—"}
                        </span>
                      </div>
                      {score !== null ? (
                        <DomainBar score={score} color={d.color} delay={i * 150} />
                      ) : (
                        <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3 }} />
                      )}
                      {ds?.notes && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{ds.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Score history */}
            {vault && vault.snapshots.length > 0 && (
              <GlassCard style={{ padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  Score History
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...vault.snapshots].reverse().map((s: any, i: number) => (
                    <div key={s.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < vault.snapshots.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{fmt(s.computed_at)}</div>
                        <div style={{ fontSize: 11, color: trajectoryColor(s.trajectory), marginTop: 2 }}>
                          {s.trajectory === "improving" ? "↑" : s.trajectory === "declining" ? "↓" : "→"} {s.trajectory}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 28, fontWeight: 900,
                        color: scoreColor(s.score),
                        textShadow: `0 0 12px ${scoreColor(s.score)}44`,
                      }}>
                        {s.score}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {vault?.composite_score === null && (
              <GlassCard gold style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>◈</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No score yet</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  Complete your intake and document submission to receive your score from a BRSA-certified evaluator.
                </div>
              </GlassCard>
            )}

            {/* AI Case Brief */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
                AI Case Brief
              </div>
              <AICaseBrief participantId={participantId} status={vault?.current_status ?? "registered"} />
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
         {tab === "docs" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
              Documents
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 32 }}>
              Document Status
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[
                { key: "gov_id", label: "Government-Issued ID", icon: "◉", hint: "Driver's license, passport, or state ID", color: "#4F9EFF" },
                { key: "selfie", label: "Identity Selfie", icon: "◈", hint: "Clear photo holding your ID", color: "#A78BFA" },
                { key: "bank_statement", label: "Bank Statement", icon: "◆", hint: "Last 30 days of activity", color: "#34D399" },
              ].map(({ key, label, icon, hint, color }) => {
                const uploaded = intake?.docs_uploaded?.[key as keyof typeof intake.docs_uploaded];
                return (
                  <GlassCard key={key} style={{ padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        background: uploaded ? `${color}15` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${uploaded ? `${color}30` : "rgba(255,255,255,0.06)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, color: uploaded ? color : "rgba(255,255,255,0.2)",
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{hint}</div>
                      </div>
                      <div style={{
                        padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                        background: uploaded ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.1)",
                        color: uploaded ? "#34D399" : "#F87171",
                        border: `1px solid ${uploaded ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.2)"}`,
                        whiteSpace: "nowrap" as const,
                      }}>
                        {uploaded ? "✓ On File" : "Missing"}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {!intake ? (
              <GlassCard gold style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  Intake not yet completed
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20, lineHeight: 1.6 }}>
                  Complete your intake form to submit your documents and begin your evaluation.
                </div>
                <a href={`/intake?pid=${participantId}&skip=1`} style={{
                  display: "inline-block", padding: "12px 24px", borderRadius: 12,
                  background: "#C8A84B", color: "#080C14",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  Complete Intake →
                </a>
              </GlassCard>
            ) : (
              <GlassCard style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
                  Need to update a document?
                </div>
                <a href={`/intake?pid=${participantId}&skip=3`} style={{
                  display: "block", padding: "12px 0", borderRadius: 12, textAlign: "center",
                  background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.2)",
                  color: "#C8A84B", fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  Update Intake Form →
                </a>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── ACTIONS ── */}
        {tab === "actions" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
              Readiness Plan
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8 }}>
              Your Actions
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 24, lineHeight: 1.6 }}>
              Ranked by score impact. Complete these to improve your readiness standing.
            </div>

            {/* Potential points */}
            {highNudges.length > 0 && (
              <GlassCard gold style={{ padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(200,168,75,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                      Potential Score Gain
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#C8A84B" }}>
                      +{highNudges.reduce((a, n) => a + n.points, 0)} pts
                    </div>
                  </div>
                  <div style={{ fontSize: 32, opacity: 0.3 }}>◆</div>
                </div>
              </GlassCard>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {nudges.map((nudge, i) => {
                const impactColors = {
                  high: { color: "#F87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
                  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
                  low: { color: "#34D399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
                };
                const ic = impactColors[nudge.impact];
                return (
                  <div
                    key={nudge.id}
                    style={{
                      background: nudge.completed ? "rgba(255,255,255,0.02)" : ic.bg,
                      border: `1px solid ${nudge.completed ? "rgba(255,255,255,0.05)" : ic.border}`,
                      borderRadius: 16, padding: 16,
                      opacity: nudge.completed ? 0.5 : 1,
                      transform: `translateY(0)`,
                      animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: nudge.completed ? "rgba(255,255,255,0.04)" : `${ic.color}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, color: nudge.completed ? "rgba(255,255,255,0.3)" : ic.color,
                      }}>
                        {nudge.completed ? "✓" : nudge.impact === "high" ? "◎" : nudge.impact === "medium" ? "◈" : "◆"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: nudge.completed ? "rgba(255,255,255,0.3)" : "#fff" }}>
                            {nudge.title}
                          </div>
                          {nudge.points > 0 && !nudge.completed && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, marginLeft: 8,
                              background: `${ic.color}15`, color: ic.color,
                              border: `1px solid ${ic.border}`, whiteSpace: "nowrap" as const,
                            }}>
                              +{nudge.points} pts
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
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

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
              Profile
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 32 }}>
              {firstName} {lastName}
            </div>

            {/* Certification badge */}
            {isCertified && (
              <GlassCard gold style={{ padding: 24, marginBottom: 20, textAlign: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
                  background: "linear-gradient(135deg, #C8A84B, #8A6E2F)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 32px rgba(200,168,75,0.4), 0 0 64px rgba(200,168,75,0.15)",
                  fontSize: 28,
                }}>
                  ✦
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#C8A84B", marginBottom: 4 }}>
                  BRSA Certified
                </div>
                <div style={{ fontSize: 12, color: "rgba(200,168,75,0.6)" }}>
                  Verified Readiness Standing
                </div>
              </GlassCard>
            )}

            {/* Identity cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Registry ID", value: registryId || "Pending assignment", mono: true, color: "#C8A84B" },
                { label: "Current Status", value: STATUS_LABELS[vault?.current_status ?? "registered"], mono: false, color: "#fff" },
                { label: "Member Since", value: vault?.created_at ? fmt(vault.created_at) : "—", mono: false, color: "#fff" },
                { label: "Participant ID", value: participantId, mono: true, color: "rgba(255,255,255,0.4)" },
              ].map(({ label, value, mono, color }) => (
                <GlassCard key={label} style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                    <span style={{
                      fontSize: mono ? 11 : 13, fontWeight: 600, color,
                      fontFamily: mono ? "monospace" : "inherit",
                      maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}>
                      {value}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Actions */}
            {registryId && (
              <a href={`/verify?rid=${registryId}`} style={{
                display: "block", padding: "14px 0", borderRadius: 14, textAlign: "center",
                background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.2)",
                color: "#C8A84B", fontSize: 14, fontWeight: 700, textDecoration: "none",
                marginBottom: 12,
              }}>
                Verify My Readiness Standing →
              </a>
            )}

            <button onClick={logout} style={{
              width: "100%", padding: "14px 0", borderRadius: 14,
              background: "transparent", border: "1px solid rgba(248,113,113,0.2)",
              color: "#F87171", fontSize: 14, fontWeight: 600, cursor: "pointer",
              marginBottom: 24,
            }}>
              Sign Out
            </button>

            <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.12)", lineHeight: 1.8 }}>
              © 2026 Legacyline<br />
              Powered by BRSA doctrine<br />
              Deterministic · Auditable · Consent-based
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{
        position: "fixed", bottom: 0,
        left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "rgba(8,12,20,0.92)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", padding: "10px 0 24px",
        zIndex: 100,
      }}>
        {[
          { key: "home", icon: "⌂", label: "Home" },
          { key: "score", icon: "◉", label: "Score" },
          { key: "docs", icon: "◈", label: "Docs" },
          { key: "actions", icon: "◆", label: "Actions" },
          { key: "profile", icon: "○", label: "Profile" },
        ].map(({ key, icon, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => switchTab(key as typeof tab)}
              style={{
                flex: 1, background: "none", border: "none",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                cursor: "pointer", padding: "6px 0",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "rgba(200,168,75,0.12)" : "transparent",
                border: active ? "1px solid rgba(200,168,75,0.2)" : "1px solid transparent",
                transition: "all 0.2s ease",
              }}>
                <span style={{
                  fontSize: 16,
                  color: active ? "#C8A84B" : "rgba(255,255,255,0.25)",
                  transition: "color 0.2s ease",
                  filter: active ? "drop-shadow(0 0 4px rgba(200,168,75,0.6))" : "none",
                }}>
                  {icon}
                </span>
              </div>
              <span style={{
                fontSize: 9, fontWeight: active ? 700 : 400,
                color: active ? "#C8A84B" : "rgba(255,255,255,0.2)",
                letterSpacing: "0.08em", textTransform: "uppercase",
                transition: "all 0.2s ease",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
