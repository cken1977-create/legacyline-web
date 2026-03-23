"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Types ──────────────────────────────────────────────────────────────────────

type OBRSubject = {
  id: string;
  name: string;
  slug: string;
  status: string;
  city: string;
  state: string;
  legal_structure: string;
  founded_date: string;
  created_at: string;
};

type OBRProfile = {
  org_id: string;
  org_name: string;
  org_slug: string;
  registered: boolean;
  obr_subject: OBRSubject | null;
  intake_status: string;
  intake_submitted_at: string | null;
  eval_status: string;
  eval_confidence: number | null;
  last_assessed: string | null;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const OBR_DOMAINS = [
  { key: "leadership", label: "Leadership & Governance", icon: "◈", color: "#4F9EFF" },
  { key: "staff", label: "Staff Behavioral Readiness", icon: "◉", color: "#A78BFA" },
  { key: "policy", label: "Policy & Compliance", icon: "◆", color: "#34D399" },
  { key: "financial", label: "Financial Health", icon: "⬡", color: "#F59E0B" },
];

const STATUS_STEPS = ["registered", "data_collecting", "under_review", "evaluated", "certified"];
const STATUS_LABELS: Record<string, string> = {
  registered: "Registered",
  data_collecting: "Data Collection",
  under_review: "Under Review",
  evaluated: "Evaluated",
  certified: "Certified",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function scoreColor(score: number) {
  if (score >= 70) return "#34D399";
  if (score >= 50) return "#F59E0B";
  return "#F87171";
}

// ── Animated Score Ring ────────────────────────────────────────────────────────

function ScoreRing({ score, size = 140 }: { score: number | null; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const r = (size / 2) - 12;
  const circumference = 2 * Math.PI * r;
  const pct = animated / 100;
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
      setAnimated(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <filter id="orgGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" filter="url(#orgGlow)"
          style={{ transition: "stroke-dashoffset 0.1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontSize: score !== null ? size * 0.24 : size * 0.12,
          fontWeight: 900, color,
          fontFamily: "'SF Pro Display', system-ui",
          lineHeight: 1,
          textShadow: score !== null ? `0 0 20px ${color}66` : "none",
        }}>
          {score !== null ? animated : "—"}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>
          {score !== null ? "OBR Score" : "Pending"}
        </div>
      </div>
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
    <div onClick={onClick} style={{
      background: gold
        ? "linear-gradient(135deg, rgba(200,168,75,0.12) 0%, rgba(200,168,75,0.04) 100%)"
        : "rgba(255,255,255,0.04)",
      border: gold ? "1px solid rgba(200,168,75,0.25)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      backdropFilter: "blur(20px)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Domain Bar ─────────────────────────────────────────────────────────────────

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

// ── Main App ───────────────────────────────────────────────────────────────────

export default function OBROrgApp() {
  const router = useRouter();
  const [tab, setTab] = useState<"home" | "score" | "docs" | "actions" | "profile">("home");
  const [profile, setProfile] = useState<OBRProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("org_token");
    const slug = localStorage.getItem("org_slug");
    if (!token || !slug) { router.replace("/login/organization"); return; }
    setOrgSlug(slug);

    async function load() {
      try {
        const res = await fetch(`${API}/orgs/${slug}/obr-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { router.replace("/login/organization"); return; }
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setOrgName(data.org_name);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function switchTab(newTab: typeof tab) {
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

  const subject = profile?.obr_subject;
  const isCertified = subject?.status === "certified";
  const isRegistered = profile?.registered;
  const currentStatusIndex = STATUS_STEPS.indexOf(subject?.status ?? "registered");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 50%, #1a1040 0%, #0a0a0f 60%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(200,168,75,0.15)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#C8A84B", animation: "spin 1s linear infinite" }} />
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080C14",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: 430, margin: "0 auto",
      position: "relative", overflow: "hidden",
    }}>

      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 40% at 20% 10%, rgba(79,158,255,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 80%, rgba(200,168,75,0.05) 0%, transparent 70%)
        `,
      }} />

      <div ref={contentRef} style={{
        paddingBottom: 90, position: "relative", zIndex: 1,
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}>

        {/* ── HOME ── */}
        {tab === "home" && (
          <div>
            {/* Hero */}
            <div style={{
              padding: "60px 24px 32px",
              background: "linear-gradient(180deg, rgba(200,168,75,0.06) 0%, transparent 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              {/* Domain badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999, marginBottom: 16,
                background: "rgba(200,168,75,0.1)",
                border: "1px solid rgba(200,168,75,0.2)",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8A84B", boxShadow: "0 0 6px #C8A84B" }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#C8A84B", textTransform: "uppercase" }}>
                  BRSA Domain III — OBR
                </span>
              </div>

              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{greeting},</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: 4 }}>
                {orgName}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
                Organizational Behavioral Readiness
              </div>

              {/* Not registered CTA */}
              {!isRegistered && (
                <GlassCard gold style={{ padding: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                    Begin Your OBR Evaluation
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 16 }}>
                    Register your organization as an OBR subject to receive a BRSA-certified organizational readiness evaluation.
                  </div>
                  <Link href={`/obr/register?org_id=${profile?.org_id ?? ""}&org_name=${encodeURIComponent(profile?.org_name ?? "")}`}
                    style={{
                    display: "block", padding: "13px 0", borderRadius: 12, textAlign: "center",
                    background: "#C8A84B", color: "#080C14",
                    fontSize: 14, fontWeight: 700, textDecoration: "none",
                  }}>
                    Register for OBR Evaluation →
                  </Link>
                </GlassCard>
              )}

              {/* Registered — show score ring */}
              {isRegistered && subject && (
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <ScoreRing score={null} size={130} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 10px", borderRadius: 999, marginBottom: 10,
                      background: isCertified ? "rgba(52,211,153,0.1)" : "rgba(200,168,75,0.1)",
                      border: `1px solid ${isCertified ? "rgba(52,211,153,0.25)" : "rgba(200,168,75,0.2)"}`,
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: isCertified ? "#34D399" : "#C8A84B" }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: isCertified ? "#34D399" : "#C8A84B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {STATUS_LABELS[subject.status]}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                      {profile?.eval_status === "approved"
                        ? "Your OBR evaluation has been approved by BRSA."
                        : profile?.eval_status === "submitted"
                        ? "Your evaluation is under BRSA review."
                        : profile?.intake_status
                        ? "Intake received. Awaiting evaluator assignment."
                        : "Complete your OBR intake to begin evaluation."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Journey pipeline */}
            {isRegistered && subject && (
              <div style={{ padding: "20px 24px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
                  OBR Journey
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        {i > 0 && <div style={{ flex: 1, height: 1, background: i <= currentStatusIndex ? "linear-gradient(90deg, #C8A84B, #C8A84B88)" : "rgba(255,255,255,0.08)" }} />}
                        <div style={{
                          width: i === currentStatusIndex ? 14 : 10,
                          height: i === currentStatusIndex ? 14 : 10,
                          borderRadius: "50%", flexShrink: 0,
                          background: i <= currentStatusIndex ? "#C8A84B" : "rgba(255,255,255,0.1)",
                          boxShadow: i === currentStatusIndex ? "0 0 0 4px rgba(200,168,75,0.15), 0 0 12px rgba(200,168,75,0.4)" : "none",
                        }} />
                        {i < STATUS_STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < currentStatusIndex ? "#C8A84B88" : "rgba(255,255,255,0.08)" }} />}
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
            )}

{/* Domain quick view — always visible */}
<div style={{ padding: "20px 24px 0" }}>
  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
    OBR Domains
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    {OBR_DOMAINS.map((d) => (
      <GlassCard key={d.key} style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 18, marginBottom: 8, color: d.color }}>{d.icon}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{d.label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.15)" }}>—</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
          {isRegistered ? "Awaiting evaluation" : "Register to unlock"}
        </div>
      </GlassCard>
    ))}
  </div>
</div>
    
            )}

            {/* Intake CTA if registered but no intake */}
            {isRegistered && !profile?.intake_status && (
              <div style={{ padding: "20px 24px 0" }}>
                <GlassCard gold style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                    Complete Your OBR Intake
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 14 }}>
                    Submit your organizational documents and information to begin your BRSA evaluation.
                  </div>
                  {subject && (
                    <Link href={`/obr/register?org_id=${profile?.org_id ?? ""}&org_name=${encodeURIComponent(profile?.org_name ?? "")}`}
                      style={{
                      display: "block", padding: "12px 0", borderRadius: 12, textAlign: "center",
                      background: "#C8A84B", color: "#080C14",
                      fontSize: 13, fontWeight: 700, textDecoration: "none",
                    }}>
                      Complete OBR Intake →
                    </Link>
                  )}
                </GlassCard>
              </div>
            )}

            <div style={{ height: 24 }} />
          </div>
        )}
    {/* ── SCORE ── */}
        {tab === "score" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>OBR Score</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 32 }}>Organizational Readiness</div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <ScoreRing score={null} size={180} />
            </div>

            <GlassCard style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
                Domain Breakdown
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {OBR_DOMAINS.map((d, i) => (
                  <div key={d.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16, color: d.color }}>{d.icon}</span>
                        <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{d.label}</span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.2)" }}>—</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3 }} />
                  </div>
                ))}
              </div>
            </GlassCard>

            {!isRegistered && (
              <GlassCard gold style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>◈</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Register for OBR Evaluation</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 16 }}>
                  Register your organization to receive a BRSA-certified readiness score across all four organizational domains.
                </div>
                <Link href={`/obr/register?org_id=${profile?.org_id ?? ""}&org_name=${encodeURIComponent(profile?.org_name ?? "")}`}
                  style={{
                  display: "inline-block", padding: "12px 24px", borderRadius: 12,
                  background: "#C8A84B", color: "#080C14",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  Begin Registration →
                </Link>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "docs" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Documents</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 32 }}>Document Status</div>

            {[
              { label: "Bylaws / Operating Agreement", icon: "◈", color: "#4F9EFF", key: "bylaws" },
              { label: "Organizational Chart", icon: "◉", color: "#A78BFA", key: "org_chart" },
              { label: "Financial Audit", icon: "◆", color: "#34D399", key: "audit" },
              { label: "Policy Manual", icon: "⬡", color: "#F59E0B", key: "policy_manual" },
              { label: "Strategic Plan", icon: "○", color: "#F87171", key: "strategic_plan" },
            ].map(({ label, icon, color, key }) => {
              const hasIntake = !!profile?.intake_status;
              return (
                <GlassCard key={key} style={{ padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: hasIntake ? `${color}15` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${hasIntake ? `${color}30` : "rgba(255,255,255,0.06)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, color: hasIntake ? color : "rgba(255,255,255,0.2)",
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{label}</div>
                    </div>
                    <div style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: hasIntake ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.1)",
                      color: hasIntake ? "#34D399" : "#F87171",
                      border: `1px solid ${hasIntake ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.2)"}`,
                      whiteSpace: "nowrap" as const,
                    }}>
                      {hasIntake ? "✓ Submitted" : "Missing"}
                    </div>
                  </div>
                </GlassCard>
              );
            })}

            {!profile?.intake_status && (
              <GlassCard gold style={{ padding: 20, marginTop: 8, textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No documents submitted yet</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.6 }}>
                  Complete your OBR intake to submit your organizational documents.
                </div>
                <Link href="/obr/register" style={{
                  display: "inline-block", padding: "12px 24px", borderRadius: 12,
                  background: "#C8A84B", color: "#080C14",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  Submit Documents →
                </Link>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── ACTIONS ── */}
        {tab === "actions" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Actions</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8 }}>OBR Readiness Plan</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 24, lineHeight: 1.6 }}>
              Steps to improve your organizational readiness standing.
            </div>

            {[
              {
                title: "Complete OBR Registration",
                description: "Register your organization as an OBR subject to begin the evaluation process.",
                done: isRegistered,
                icon: "◎", color: "#4F9EFF",
              },
              {
                title: "Submit OBR Intake",
                description: "Complete the 6-step organizational intake form including governance, staff, policy, financial, and document submission.",
                done: !!profile?.intake_status,
                icon: "◈", color: "#A78BFA",
              },
              {
                title: "Await Evaluator Assignment",
                description: "A BRSA-certified OBR evaluator will be assigned to your organization.",
                done: ["under_review", "evaluated", "certified"].includes(subject?.status ?? ""),
                icon: "◆", color: "#34D399",
              },
              {
                title: "OBR Evaluation Under Review",
                description: "Your BRSA evaluator is reviewing your organizational record and conducting the OBR assessment.",
                done: ["evaluated", "certified"].includes(subject?.status ?? ""),
                icon: "⬡", color: "#F59E0B",
              },
              {
                title: "Receive OBR Certification",
                description: "Upon approval by BRSA Standards Authority, your organization receives its OBR certification.",
                done: isCertified,
                icon: "✦", color: "#C8A84B",
              },
            ].map((step, i) => (
              <div key={i} style={{
                background: step.done ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${step.done ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16, padding: 16, marginBottom: 12,
                animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: step.done ? "rgba(52,211,153,0.12)" : `${step.color}12`,
                    border: `1px solid ${step.done ? "rgba(52,211,153,0.25)" : `${step.color}25`}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: step.done ? "#34D399" : step.color,
                  }}>
                    {step.done ? "✓" : step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: step.done ? "rgba(255,255,255,0.4)" : "#fff", marginBottom: 4 }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div style={{ padding: "60px 24px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,168,75,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Profile</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 32 }}>{orgName}</div>

            {/* OBR Certification badge */}
            {isCertified && (
              <GlassCard gold style={{ padding: 24, marginBottom: 20, textAlign: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
                  background: "linear-gradient(135deg, #C8A84B, #8A6E2F)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 32px rgba(200,168,75,0.4)",
                  fontSize: 28,
                }}>
                  ✦
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#C8A84B", marginBottom: 4 }}>OBR Certified</div>
                <div style={{ fontSize: 12, color: "rgba(200,168,75,0.6)" }}>BRSA Domain III — Organizational Readiness</div>
              </GlassCard>
            )}

            {/* Org details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Organization", value: orgName },
                { label: "OBR Status", value: subject ? STATUS_LABELS[subject.status] : "Not Registered" },
                { label: "Location", value: subject?.city && subject?.state ? `${subject.city}, ${subject.state}` : "—" },
                { label: "Legal Structure", value: subject?.legal_structure || "—" },
                { label: "Founded", value: subject?.founded_date || "—" },
                { label: "OBR Subject ID", value: subject?.id || "—", mono: true },
                { label: "Registered", value: subject?.created_at ? fmt(subject.created_at) : "—" },
              ].map(({ label, value, mono }: any) => (
                <GlassCard key={label} style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                    <span style={{
                      fontSize: mono ? 10 : 13, fontWeight: 600, color: "#fff",
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

            {/* Switch to cohort dashboard */}
            <Link href="/dashboard" style={{
              display: "block", padding: "14px 0", borderRadius: 14, textAlign: "center",
              background: "rgba(79,158,255,0.08)", border: "1px solid rgba(79,158,255,0.2)",
              color: "#4F9EFF", fontSize: 14, fontWeight: 700, textDecoration: "none",
              marginBottom: 12,
            }}>
              View Participant Cohort Dashboard →
            </Link>

            <button
              onClick={() => { localStorage.removeItem("org_token"); localStorage.removeItem("org_slug"); router.push("/login/organization"); }}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 14,
                background: "transparent", border: "1px solid rgba(248,113,113,0.2)",
                color: "#F87171", fontSize: 14, fontWeight: 600, cursor: "pointer",
                marginBottom: 24,
              }}
            >
              Sign Out
            </button>

            <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.12)", lineHeight: 1.8 }}>
              © 2026 Legacyline · Powered by BRSA doctrine<br />
              Domain III — Organizational Behavioral Readiness
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
            <button key={key} onClick={() => switchTab(key as typeof tab)}
              style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", padding: "6px 0" }}>
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
                  filter: active ? "drop-shadow(0 0 4px rgba(200,168,75,0.6))" : "none",
                }}>
                  {icon}
                </span>
              </div>
              <span style={{
                fontSize: 9, fontWeight: active ? 700 : 400,
                color: active ? "#C8A84B" : "rgba(255,255,255,0.2)",
                letterSpacing: "0.08em", textTransform: "uppercase",
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
                        }
