"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

const C = {
  navy: "#1A3A5C", navyDeep: "#0B1C30", gold: "#C8A84B",
  white: "#F4F6F9", gray: "#8899AA", surface: "#162E4A",
  surfaceHi: "#1E3D5A", teal: "#2DD4BF", red: "#F87171",
  yellow: "#FBBF24", green: "#34D399",
};

type OBRDomainScore = {
  domain: string;
  score: number;
  notes: string;
};

type AIEvalResponse = {
  pre_evaluation_brief: {
    summary: string;
    key_strengths: string[];
    key_gaps: string[];
    missing_inputs: string[];
    immediate_action_items: string[];
  };
  domain_analysis: {
    leadership: string;
    staff: string;
    policy: string;
    financial: string;
  };
  narrative_draft: string;
  recommended_actions: string[];
  explainability: {
    score_summary: string;
    factors_supporting: string[];
    factors_limiting: string[];
    evidence_used: string[];
    confidence_notes: string[];
  };
  confidence_score: number;
  anomaly_flags: string[];
};

const OBR_DOMAINS = [
  { key: "leadership", label: "Leadership & Governance" },
  { key: "staff", label: "Staff Behavioral Readiness" },
  { key: "policy", label: "Policy & Compliance" },
  { key: "financial", label: "Financial Health" },
];

const DOC_ITEMS = [
  { key: "bylaws", label: "Bylaws / Operating Agreement" },
  { key: "org_chart", label: "Organizational Chart" },
  { key: "audit", label: "Financial Audit" },
  { key: "policy_manual", label: "Policy Manual" },
  { key: "strategic_plan", label: "Strategic Plan" },
];

function confidenceStyle(score: number) {
  if (score < 0.6) return { label: "Low Confidence — Requires careful human judgment", color: C.yellow, bg: "rgba(251,191,36,0.1)" };
  if (score < 0.8) return { label: "Moderate Confidence — Review recommended", color: C.white, bg: "rgba(255,255,255,0.05)" };
  return { label: "High Confidence — Aligned with readiness model", color: C.green, bg: "rgba(52,211,153,0.1)" };
}

export default function OBREvaluationPanel({
  obrSubjectId,
  actorEmail,
  subjectStatus,
}: {
  obrSubjectId: string;
  actorEmail: string;
  subjectStatus: string;
}) {
  const [domainScores, setDomainScores] = useState<OBRDomainScore[]>(
    OBR_DOMAINS.map((d) => ({ domain: d.key, score: 50, notes: "" }))
  );
  const [docChecklist, setDocChecklist] = useState(
    DOC_ITEMS.map((d) => ({ item: d.key, checked: false }))
  );
  const [narrative, setNarrative] = useState("");
  const [recommended, setRecommended] = useState("");
  const [attestation, setAttestation] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [aiEval, setAiEval] = useState<AIEvalResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/obr/subjects/${obrSubjectId}/evaluation`);
        const data = await res.json();
        if (data.evaluation) {
          const ev = data.evaluation;
          setEvaluation(ev);
          if (ev.domain_scores?.length) setDomainScores(ev.domain_scores);
          setNarrative(ev.narrative_notes ?? "");
          setRecommended(ev.recommended_next ?? "");
          setAttestation(ev.attestation ?? "");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [obrSubjectId]);

  async function generateAI() {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch(`${API}/ai/evaluate/organization/${obrSubjectId}`, {
        method: "POST",
        headers: { "X-Actor": actorEmail },
      });
      if (!res.ok) throw new Error("AI evaluation failed");
      const data = await res.json();
      setAiEval(data);
    } catch (e: any) {
      setAiError(e.message ?? "AI evaluation failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function save(submit: boolean) {
    submit ? setSubmitting(true) : setSaving(true);
    setMsg(null);
    setShowSummary(false);
    try {
      const res = await fetch(`${API}/obr/subjects/${obrSubjectId}/evaluation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Actor": actorEmail,
        },
        body: JSON.stringify({
          domain_scores: domainScores,
          doc_checklist: docChecklist,
          narrative_notes: narrative,
          recommended_next: recommended,
          attestation,
          submit,
          ai_summary: aiEval?.pre_evaluation_brief ?? null,
          ai_confidence: aiEval?.confidence_score ?? 0,
          ai_missing_data: aiEval?.pre_evaluation_brief?.missing_inputs ?? null,
          ai_recommended: aiEval?.recommended_actions ?? null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg({
        ok: true,
        text: submit
          ? "✓ OBR evaluation submitted to BRSA Standards Authority."
          : "✓ Draft saved.",
      });
      if (submit) {
        const updated = await fetch(`${API}/obr/subjects/${obrSubjectId}/evaluation`);
        const data = await updated.json();
        if (data.evaluation) setEvaluation(data.evaluation);
      }
    } catch (e: any) {
      setMsg({ ok: false, text: e.message ?? "Save failed" });
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  function setScore(domain: string, score: number) {
    setDomainScores((prev) => prev.map((d) => d.domain === domain ? { ...d, score } : d));
  }

  function setNotes(domain: string, notes: string) {
    setDomainScores((prev) => prev.map((d) => d.domain === domain ? { ...d, notes } : d));
  }

  function toggleDoc(key: string) {
    setDocChecklist((prev) => prev.map((d) => d.item === key ? { ...d, checked: !d.checked } : d));
  }

  const isLocked = evaluation?.status === "submitted" || evaluation?.status === "approved";
  const confidence = aiEval?.confidence_score ?? 0;
  const confStyle = confidenceStyle(confidence);
  const missingCount = aiEval?.pre_evaluation_brief?.missing_inputs?.length ?? 0;

  if (loading) return <div style={{ color: C.gray, padding: 20, fontSize: 13 }}>Loading OBR evaluation...</div>;

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

      {/* LEFT — Evaluation Form */}
      <div style={{
        flex: 1, background: C.surface,
        border: `1px solid ${C.gold}44`,
        borderRadius: 8, padding: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          OBR Evaluation Record
        </div>
        <div style={{ fontSize: 10, color: "rgba(200,168,75,0.6)", marginBottom: 16 }}>
          Domain III — Organizational Behavioral Readiness
        </div>

        {evaluation?.status && (
          <div style={{
            display: "inline-flex", alignItems: "center",
            padding: "4px 12px", borderRadius: 999,
            background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
            color: C.gold, fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", marginBottom: 20,
          }}>
            {evaluation.status.toUpperCase()}
          </div>
        )}

        {/* Domain Scores */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Domain Scores (0–100)
          </div>
          {OBR_DOMAINS.map(({ key, label }) => {
            const entry = domainScores.find((d) => d.domain === key) ?? { score: 50, notes: "" };
            return (
              <div key={key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{entry.score}</span>
                </div>
                <input type="range" min={0} max={100} value={entry.score}
                  disabled={isLocked}
                  onChange={(e) => setScore(key, Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.gold, marginBottom: 6 }} />
                <input placeholder="Notes (optional)" value={entry.notes}
                  disabled={isLocked}
                  onChange={(e) => setNotes(key, e.target.value)}
                  style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "6px 10px", color: C.white, fontSize: 12, outline: "none", boxSizing: "border-box" as const }} />
              </div>
            );
          })}
        </div>

        {/* Doc Checklist */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Document Checklist
          </div>
          {DOC_ITEMS.map(({ key, label }) => {
            const entry = docChecklist.find((d) => d.item === key);
            return (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: isLocked ? "default" : "pointer" }}>
                <input type="checkbox" checked={entry?.checked ?? false}
                  disabled={isLocked} onChange={() => toggleDoc(key)}
                  style={{ accentColor: C.gold, width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: entry?.checked ? C.white : C.gray }}>{label}</span>
              </label>
            );
          })}
        </div>

        {/* Narrative */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Narrative Assessment
          </div>
          <textarea rows={5} value={narrative} disabled={isLocked}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Document your organizational readiness assessment..."
            style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const }} />
        </div>

        {/* Recommended */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Recommended Next Steps
          </div>
          <textarea rows={3} value={recommended} disabled={isLocked}
            onChange={(e) => setRecommended(e.target.value)}
            placeholder="What should this organization focus on next..."
            style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const }} />
        </div>

        {/* Attestation */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Evaluator Attestation
          </div>
          <textarea rows={3} value={attestation} disabled={isLocked}
            onChange={(e) => setAttestation(e.target.value)}
            placeholder="I attest that I reviewed the organizational record, supporting documents, AI assistance output, and domain assessments, and that this submission reflects my OBR evaluator judgment."
            style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const }} />
        </div>

        {/* Submission Summary */}
        {showSummary && !isLocked && (
          <div style={{ marginBottom: 20, padding: 16, borderRadius: 8, background: "rgba(200,168,75,0.06)", border: `1px solid ${C.gold}44` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              OBR Submission Summary
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Subject Type", value: "Organization (OBR)" },
                { label: "Missing Inputs (AI)", value: missingCount > 0 ? `${missingCount} flagged` : "None flagged", color: missingCount > 0 ? C.yellow : C.green },
                { label: "AI Confidence", value: aiEval ? `${(confidence * 100).toFixed(0)}%` : "Not generated", color: aiEval ? confStyle.color : C.gray },
                { label: "Attestation", value: attestation ? "Provided" : "Missing", color: attestation ? C.green : C.red },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: C.gray }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: color ?? C.white }}>{value}</span>
                </div>
              ))}
            </div>
            {confidence > 0 && confidence < 0.6 && (
              <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 6, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: C.yellow, fontSize: 12 }}>
                ⚠ Low AI confidence. Your human judgment is the deciding factor.
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setShowSummary(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 6, background: "transparent", border: `1px solid ${C.gray}55`, color: C.gray, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Go Back
              </button>
              <button onClick={() => save(true)} disabled={submitting || !attestation}
                style={{ flex: 2, padding: "10px 0", borderRadius: 6, background: C.gold, border: "none", color: C.navyDeep, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: submitting || !attestation ? 0.5 : 1 }}>
                {submitting ? "Submitting..." : "Confirm & Submit to BRSA"}
              </button>
            </div>
          </div>
        )}

        {msg && (
          <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 13, background: msg.ok ? "rgba(45,212,191,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${msg.ok ? C.teal : C.red}55`, color: msg.ok ? C.teal : C.red }}>
            {msg.text}
          </div>
        )}

        {!isLocked && !showSummary && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => save(false)} disabled={saving}
              style={{ flex: 1, padding: "11px 0", borderRadius: 6, background: "transparent", border: `1px solid ${C.gold}66`, color: C.gold, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button onClick={() => setShowSummary(true)} disabled={!attestation}
              style={{ flex: 2, padding: "11px 0", borderRadius: 6, background: C.gold, border: "none", color: C.navyDeep, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: !attestation ? 0.5 : 1 }}>
              Review & Submit →
            </button>
          </div>
        )}
      </div>

      {/* RIGHT — AI Panel */}
      <div style={{ width: 360, background: C.navyDeep, border: `1px solid ${C.gold}33`, borderRadius: 8, padding: 16, overflowY: "auto" as const, maxHeight: "calc(100vh - 120px)", flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          OBR AI Assistant
        </div>
        <div style={{ fontSize: 10, color: "rgba(200,168,75,0.5)", marginBottom: 12 }}>
          BRSA Domain III — Organizational Readiness
        </div>

        <button onClick={generateAI} disabled={aiLoading}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 4, background: C.gold, color: C.navyDeep, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", marginBottom: 14, border: "none" }}>
          {aiLoading ? "Generating..." : "Generate OBR AI Evaluation"}
        </button>

        {confidence > 0 && (
          <div style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 14, background: confStyle.bg, border: `1px solid ${confStyle.color}44`, color: confStyle.color, fontSize: 12, fontWeight: 600 }}>
            {confidence < 0.6 && "⚠ "}{confidence >= 0.8 && "✓ "}
            {confStyle.label}
            <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, opacity: 0.8 }}>
              Score: {(confidence * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {aiError && (
          <div style={{ padding: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: C.red, borderRadius: 4, marginBottom: 14, fontSize: 12 }}>
            {aiError}
          </div>
        )}

        {aiEval && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <AISection title="Pre-Evaluation Brief">
              <p style={{ color: C.white, fontSize: 12, marginBottom: 8, lineHeight: 1.6 }}>{aiEval.pre_evaluation_brief.summary}</p>
              <AIList label="Strengths" items={aiEval.pre_evaluation_brief.key_strengths} />
              <AIList label="Gaps" items={aiEval.pre_evaluation_brief.key_gaps} />
              <AIList label="Missing Inputs" items={aiEval.pre_evaluation_brief.missing_inputs} />
              <AIList label="Immediate Actions" items={aiEval.pre_evaluation_brief.immediate_action_items} />
            </AISection>

            <AISection title="Domain Analysis">
              <AIField label="Leadership & Governance" value={aiEval.domain_analysis.leadership} />
              <AIField label="Staff Behavioral Readiness" value={aiEval.domain_analysis.staff} />
              <AIField label="Policy & Compliance" value={aiEval.domain_analysis.policy} />
              <AIField label="Financial Health" value={aiEval.domain_analysis.financial} />
            </AISection>

            <AISection title="Narrative Draft">
              <p style={{ color: C.white, fontSize: 12, whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 8 }}>{aiEval.narrative_draft}</p>
              <ApplyBtn onClick={() => setNarrative(aiEval.narrative_draft)} />
            </AISection>

            <AISection title="Recommended Actions">
              <AIList items={aiEval.recommended_actions} />
              <ApplyBtn onClick={() => setRecommended(aiEval.recommended_actions.join("\n"))} />
            </AISection>

            <AISection title="Explainability">
              <AIField label="Score Summary" value={aiEval.explainability.score_summary} />
              <AIList label="Supporting Factors" items={aiEval.explainability.factors_supporting} />
              <AIList label="Limiting Factors" items={aiEval.explainability.factors_limiting} />
              <AIList label="Evidence Used" items={aiEval.explainability.evidence_used} />
            </AISection>

            <AISection title="Confidence & Anomalies">
              <AIField label="Confidence Score" value={`${(confidence * 100).toFixed(0)}%`} />
              <AIList label="Anomaly Flags" items={aiEval.anomaly_flags ?? []} />
            </AISection>

          </div>
        )}
      </div>
    </div>
  );
}

function AISection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, background: "#0F2236", borderRadius: 6, border: "1px solid rgba(200,168,75,0.15)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#C8A84B", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function AIList({ label, items }: { label?: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 4 }}>{label}</div>}
      <ul style={{ paddingLeft: 16, margin: 0 }}>
        {items.map((x, i) => <li key={i} style={{ color: "#F4F6F9", fontSize: 12, marginBottom: 2 }}>{x}</li>)}
      </ul>
    </div>
  );
}

function AIField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#F4F6F9", fontSize: 12, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function ApplyBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ marginTop: 8, padding: "6px 10px", borderRadius: 4, background: "#C8A84B", color: "#0B1C30", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none" }}>
      Apply to Form
    </button>
  );
      }
