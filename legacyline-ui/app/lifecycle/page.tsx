"use client";

import Link from "next/link";

const C = {
  navy: "#1A3A5C",
  navyDark: "#112540",
  navyDeep: "#0B1C30",
  gold: "#C8A84B",
  white: "#F4F6F9",
  gray: "#8899AA",
  surface: "#162E4A",
  surfaceHi: "#1E3D5A",
};

const STATES = [
  {
    key: "registered",
    index: 0,
    label: "Registered",
    color: "#8899AA",
    bg: "rgba(136,153,170,0.08)",
    border: "rgba(136,153,170,0.2)",
    description:
      "The participant has entered the BRSA registry. Consent has been recorded and a Registry ID has been issued. No assessment has begun.",
    triggers: ["Participant completes registration form", "Consent event recorded", "Registry ID generated"],
    transitions: ["data_collecting"],
    transitionNotes: "Advances when intake submission begins.",
    immutable: false,
  },
  {
    key: "data_collecting",
    index: 1,
    label: "Data Collecting",
    color: "#4F9EFF",
    bg: "rgba(79,158,255,0.08)",
    border: "rgba(79,158,255,0.2)",
    description:
      "The participant's intake form is in progress. Evidence events are being collected by a certified BRSA evaluator across active assessment domains.",
    triggers: ["Intake submission initiated", "Evaluator begins evidence collection"],
    transitions: ["under_review"],
    transitionNotes: "Advances when evaluator submits the case for review.",
    immutable: false,
  },
  {
    key: "under_review",
    index: 2,
    label: "Under Review",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.2)",
    description:
      "The participant's file has been submitted for evaluator review. Domain scores, document verification, and narrative assessment are being recorded. The evaluator may return the file to data_collecting if additional evidence is needed.",
    triggers: ["Evaluator submits case to review queue", "Intake completed with all required documents"],
    transitions: ["data_collecting", "evaluated"],
    transitionNotes:
      "May return to data_collecting if evidence is insufficient. Advances to evaluated when evaluation is submitted and approved by the BRSA Standards Authority.",
    immutable: false,
  },
  {
    key: "evaluated",
    index: 3,
    label: "Evaluated",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
    description:
      "The FRARI v1.0.0 ruleset has been applied to the evidence record. A composite readiness score and trajectory have been generated deterministically by the Legacyline readiness engine. The evaluation has been approved by the BRSA Standards Authority.",
    triggers: [
      "Evaluator submits evaluation record",
      "BRSA Standards Authority approves evaluation",
      "FRARI engine computes composite score",
      "SHA-256 hash sealed on readiness snapshot",
    ],
    transitions: ["certified"],
    transitionNotes: "Advances to certified when the participant meets the certification threshold.",
    immutable: false,
  },
  {
    key: "certified",
    index: 4,
    label: "Certified",
    color: "#34D399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
    description:
      "The participant has achieved BRSA certification. Their public readiness state has been updated in the registry. The internal snapshot is sealed and the ledger entry is permanent. The participant may share their Registry ID to verify standing.",
    triggers: [
      "Evaluation approved and certification threshold met",
      "Public readiness state updated",
      "Immutable ledger entry written",
    ],
    transitions: ["revoked"],
    transitionNotes:
      "Certification may be revoked for cause. Revocation requires documented reason and evaluator action.",
    immutable: false,
  },
  {
    key: "revoked",
    index: 5,
    label: "Revoked",
    color: "#F87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.2)",
    description:
      "Certification has been revoked. The public readiness state is updated to reflect the revocation. The original certification record remains in the immutable ledger — revocation does not erase history. A reason is required for all revocations.",
    triggers: [
      "Evaluator initiates revocation with documented reason",
      "BRSA Standards Authority approves revocation",
    ],
    transitions: [],
    transitionNotes: "Terminal state. No further transitions are permitted from revoked.",
    immutable: true,
  },
];

const TRANSITIONS = [
  { from: "registered", to: "data_collecting", label: "Intake begins" },
  { from: "data_collecting", to: "under_review", label: "Evaluator submits case" },
  { from: "under_review", to: "data_collecting", label: "Returned for more evidence" },
  { from: "under_review", to: "evaluated", label: "Evaluation approved" },
  { from: "evaluated", to: "certified", label: "Certification threshold met" },
  { from: "certified", to: "revoked", label: "Revocation with cause" },
];

export default function LifecyclePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.navyDeep,
        fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
        color: C.white,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: C.navyDark,
          borderBottom: `1px solid ${C.surfaceHi}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.gold}, #8A6E2F)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: C.navyDeep,
            }}
          >
            L
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.white, letterSpacing: "0.06em" }}>LEGACYLINE</div>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>Standards Reference</div>
          </div>
        </Link>
        <Link
          href="/evaluator"
          style={{
            fontSize: 12, color: C.gray, textDecoration: "none",
            padding: "6px 14px", borderRadius: 6,
            border: `1px solid ${C.surfaceHi}`,
          }}
        >
          Evaluator Console →
        </Link>
      </div>

      {/* Hero */}
      <div
        style={{
          padding: "48px 24px 40px",
          maxWidth: 900, margin: "0 auto",
          borderBottom: `1px solid ${C.surfaceHi}`,
        }}
      >
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: `${C.gold}15`, border: `1px solid ${C.gold}33`,
            borderRadius: 20, padding: "5px 14px", marginBottom: 20,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            BRSA Standards Authority · Published 2026
          </span>
        </div>
        <h1
          style={{
            fontSize: 36, fontWeight: 900, color: C.white,
            letterSpacing: "-0.5px", marginBottom: 16, lineHeight: 1.1,
          }}
        >
          Participant State Taxonomy
        </h1>
        <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.8, maxWidth: 680 }}>
          The Legacyline platform governs participant readiness through a six-state lifecycle. No stage may be skipped. Every transition is logged to an immutable audit trail with a timestamp and actor identifier. This document is the authoritative reference for all state definitions, allowed transitions, and trigger conditions.
        </p>
      </div>

      {/* Transition Map */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
          State Transition Map
        </div>
        <div
          style={{
            background: C.surface, border: `1px solid ${C.surfaceHi}`,
            borderRadius: 12, padding: 24, marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
            {STATES.map((s, i) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    padding: "6px 14px", borderRadius: 20,
                    background: s.bg, border: `1px solid ${s.border}`,
                    fontSize: 12, fontWeight: 700, color: s.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </div>
                {i < STATES.length - 1 && (
                  <span style={{ color: C.gray, fontSize: 14, opacity: 0.5 }}>→</span>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.surfaceHi}` }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              All Allowed Transitions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TRANSITIONS.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                  <span style={{ fontFamily: "monospace", color: C.gold }}>{t.from}</span>
                  <span style={{ color: C.gray }}>→</span>
                  <span style={{ fontFamily: "monospace", color: C.white }}>{t.to}</span>
                  <span style={{ color: C.gray, fontSize: 11 }}>· {t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State Cards */}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
          State Definitions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 60 }}>
          {STATES.map((s) => (
            <div
              key={s.key}
              style={{
                background: C.surface,
                border: `1px solid ${s.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* State header */}
              <div
                style={{
                  background: s.bg,
                  padding: "20px 24px",
                  borderBottom: `1px solid ${s.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                    State {String(s.index + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: s.color, letterSpacing: "0.06em" }}>{s.key}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {s.immutable && (
                    <span
                      style={{
                        padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                        background: "rgba(248,113,113,0.1)", color: "#F87171",
                        border: "1px solid rgba(248,113,113,0.3)",
                      }}
                    >
                      Terminal State
                    </span>
                  )}
                  {s.transitions.length > 0 && s.transitions.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                        background: `${C.gold}10`, color: C.gold,
                        border: `1px solid ${C.gold}33`,
                        fontFamily: "monospace",
                      }}
                    >
                      → {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* State body */}
              <div style={{ padding: "20px 24px", display: "grid", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Definition
                  </div>
                  <div style={{ fontSize: 14, color: C.white, lineHeight: 1.7 }}>{s.description}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Entry Triggers
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {s.triggers.map((t, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: s.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>◆</span>
                          <span style={{ fontSize: 13, color: C.gray, lineHeight: 1.5 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Transition Notes
                    </div>
                    <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.7 }}>{s.transitionNotes}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div
          style={{
            padding: "24px", marginBottom: 40,
            background: `${C.gold}08`, border: `1px solid ${C.gold}22`,
            borderRadius: 12, fontSize: 13, color: C.gray, lineHeight: 1.7,
          }}
        >
          <strong style={{ color: C.white }}>Audit Trail:</strong> Every state transition is recorded in the{" "}
          <span style={{ fontFamily: "monospace", color: C.gold }}>state_history</span> table with a timestamp, actor identifier, from-state, to-state, and reason. The audit trail is immutable — transitions may not be modified or deleted after they are recorded. This is a foundational requirement of the BRSA Standards Authority.
        </div>
      </div>
    </div>
  );
              }
