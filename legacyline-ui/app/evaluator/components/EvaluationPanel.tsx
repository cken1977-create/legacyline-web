"use client";

import { useState, useEffect } from "react";
import { api } from "../../../lib/api";

const C = {
  navy: "#1A3A5C", navyDeep: "#0B1C30", gold: "#C8A84B",
  white: "#F4F6F9", gray: "#8899AA", surface: "#162E4A",
  surfaceHi: "#1E3D5A", teal: "#2DD4BF",
};

// --- REQUIRED TYPES (fixes Vercel build) ---
type EvaluationPanelProps = {
  participantId: string;
  actorEmail: string;
  currentStatus: string;
};

type EvaluationResponse = {
  evaluation?: {
    domain_scores?: any[];
    doc_checklist?: any[];
    narrative_notes?: string;
    recommended_next?: string;
    attestation?: string;
    status?: string;
  };
};

type AIEvalResponse = {
  PreEvaluationBrief: {
    Summary: string;
    KeyStrengths: string[];
    KeyGaps: string[];
    MissingInputs: string[];
    ImmediateActionItems: string[];
  };
  DomainAnalysis: {
    Housing: string;
    Workforce: string;
    Financial: string;
    Behavioral: string;
  };
  NarrativeDraft: string;
  RecommendedActions: string[];
  Explainability: {
    ScoreSummary: string;
    FactorsSupporting: string[];
    FactorsLimiting: string[];
    EvidenceUsed: string[];
    ConfidenceNotes: string[];
  };
  ConfidenceScore: string;
  AnomalyFlags: string[];
};

// --- COMPONENT ---
export default function EvaluationPanel({
  participantId,
  actorEmail,
  currentStatus,
}: EvaluationPanelProps) {

  const [evaluation, setEvaluation] = useState<any>(null);
  const [domainScores, setDomainScores] = useState<any[]>([]);
  const [docChecklist, setDocChecklist] = useState<any[]>([]);
  const [narrative, setNarrative] = useState("");
  const [recommended, setRecommended] = useState("");
  const [attestation, setAttestation] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- AI Evaluation State ---
  const [aiEval, setAiEval] = useState<AIEvalResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // --- LOAD EXISTING EVALUATION ---
  useEffect(() => {
    async function load() {
      try {
        const res: EvaluationResponse = await api(`/participants/${participantId}/evaluation`);
        if (res.evaluation) {
          const ev = res.evaluation;
          setEvaluation(ev);
          if (ev.domain_scores?.length) setDomainScores(ev.domain_scores);
          if (ev.doc_checklist?.length) setDocChecklist(ev.doc_checklist);
          setNarrative(ev.narrative_notes ?? "");
          setRecommended(ev.recommended_next ?? "");
          setAttestation(ev.attestation ?? "");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [participantId]);

  // --- GENERATE AI EVALUATION ---
  async function generateAI() {
    setAiLoading(true);
    setAiError("");
    try {
      const out: AIEvalResponse = await api(`/ai/evaluate/individual/${participantId}`, {
        method: "POST",
        headers: { "X-Actor": actorEmail },
      });
      setAiEval(out);
    } catch (err: any) {
      setAiError(err?.message ?? "AI evaluation failed.");
    } finally {
      setAiLoading(false);
    }
  }

  // --- SAVE OR SUBMIT ---
  async function save(submit: boolean) {
    submit ? setSubmitting(true) : setSaving(true);
    setMsg(null);
    try {
      await api(`/participants/${participantId}/evaluation`, {
        method: "POST",
        body: JSON.stringify({
          domain_scores: domainScores,
          doc_checklist: docChecklist,
          narrative_notes: narrative,
          recommended_next: recommended,
          attestation,
          submit,
        }),
        headers: { "X-Actor": actorEmail },
      });

      setMsg({
        ok: true,
        text: submit
          ? "✓ Evaluation submitted to BRSA Standards Authority for approval."
          : "✓ Draft saved.",
      });

      if (submit) {
        const res: EvaluationResponse = await api(`/participants/${participantId}/evaluation`);
        if (res.evaluation) setEvaluation(res.evaluation);
      }
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message ?? "Save failed." });
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  const isLocked =
    evaluation?.status === "submitted" ||
    evaluation?.status === "approved";

  const canEvaluate = ["under_review", "evaluated"].includes(currentStatus);

  if (loading) return null;
  if (!canEvaluate && !evaluation) return null;

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* LEFT: Evaluation Form */}
      <div style={{
        flex: 1,
        background: C.surface,
        border: `1px solid ${C.gold}44`,
        borderRadius: 8,
        padding: 20,
      }}>
        {/* ... your existing form stays unchanged ... */}
      </div>

      {/* RIGHT: AI EVALUATOR PANEL */}
      <div style={{
        width: 360,
        background: C.navyDeep,
        border: `1px solid ${C.gold}33`,
        borderRadius: 8,
        padding: 16,
        overflowY: "auto",
        maxHeight: "calc(100vh - 120px)",
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.gray,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          Evaluator AI Assistant
        </div>

        <button
          onClick={generateAI}
          disabled={aiLoading}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 4,
            background: C.gold,
            color: C.navyDeep,
            fontWeight: 700,
            letterSpacing: "0.05em",
            cursor: "pointer",
            marginBottom: 14,
            border: "none",
          }}
        >
          {aiLoading ? "Generating..." : "Generate AI Evaluation"}
        </button>

        {aiError && (
          <div style={{
            padding: 10,
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.3)",
            color: "#F87171",
            borderRadius: 4,
            marginBottom: 14,
            fontSize: 12,
          }}>
            {aiError}
          </div>
        )}

        {aiEval && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Section title="Pre‑Evaluation Brief">
              <p style={{ color: C.white, fontSize: 12 }}>{aiEval.PreEvaluationBrief.Summary}</p>
              <SubList label="Strengths" items={aiEval.PreEvaluationBrief.KeyStrengths} />
              <SubList label="Gaps" items={aiEval.PreEvaluationBrief.KeyGaps} />
              <SubList label="Missing Inputs" items={aiEval.PreEvaluationBrief.MissingInputs} />
              <SubList label="Immediate Actions" items={aiEval.PreEvaluationBrief.ImmediateActionItems} />
            </Section>

            <Section title="Domain Analysis">
              <SubField label="Housing" value={aiEval.DomainAnalysis.Housing} />
              <SubField label="Workforce" value={aiEval.DomainAnalysis.Workforce} />
              <SubField label="Financial" value={aiEval.DomainAnalysis.Financial} />
              <SubField label="Behavioral" value={aiEval.DomainAnalysis.Behavioral} />
            </Section>

            <Section title="Narrative Draft">
              <p style={{ color: C.white, fontSize: 12, whiteSpace: "pre-wrap" }}>
                {aiEval.NarrativeDraft}
              </p>
              <ApplyButton onClick={() => setNarrative(aiEval.NarrativeDraft)} />
            </Section>

            <Section title="Recommended Actions">
              <SubList items={aiEval.RecommendedActions} />
              <ApplyButton onClick={() => setRecommended(aiEval.RecommendedActions.join("\n"))} />
            </Section>

            <Section title="Explainability">
              <SubField label="Score Summary" value={aiEval.Explainability.ScoreSummary} />
              <SubList label="Supporting Factors" items={aiEval.Explainability.FactorsSupporting} />
              <SubList label="Limiting Factors" items={aiEval.Explainability.FactorsLimiting} />
              <SubList label="Evidence Used" items={aiEval.Explainability.EvidenceUsed} />
              <SubList label="Confidence Notes" items={aiEval.Explainability.ConfidenceNotes} />
            </Section>

            <Section title="Confidence & Anomalies">
              <SubField label="Confidence Score" value={aiEval.ConfidenceScore} />
              <SubList label="Anomaly Flags" items={aiEval.AnomalyFlags} />
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

// --- UI HELPERS ---
function Section({ title, children }: { title: string; children: any }) {
  return (
    <div style={{
      padding: 12,
      background: "#0F2236",
      borderRadius: 6,
      border: "1px solid rgba(200,168,75,0.15)",
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#C8A84B",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SubList({ label, items }: { label?: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      {label && (
        <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 4 }}>
          {label}
        </div>
      )}
      <ul style={{ paddingLeft: 16, margin: 0 }}>
        {items.map((x, i) => (
          <li key={i} style={{ color: "#F4F6F9", fontSize: 12, marginBottom: 2 }}>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ color: "#F4F6F9", fontSize: 12, whiteSpace: "pre-wrap" }}>
        {value}
      </div>
    </div>
  );
}

function ApplyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 8,
        padding: "6px 10px",
        borderRadius: 4,
        background: "#C8A84B",
        color: "#0B1C30",
        fontSize: 11,
        fontWeight: 700,
        cursor: "pointer",
        border: "none",
      }}
    >
      Apply to Form
    </button>
  );
}
