"use client";

import { useState, useEffect } from "react";
import { api } from "../../../lib/api";

const DOMAINS = [
  { key: "housing",    label: "Housing Readiness" },
  { key: "workforce",  label: "Workforce Readiness" },
  { key: "financial",  label: "Financial Readiness" },
  { key: "behavioral", label: "Behavioral Readiness" },
];

const DOCS = [
  { key: "gov_id",        label: "Government ID" },
  { key: "selfie",        label: "Identity Selfie" },
  { key: "bank_statement", label: "Bank Statement" },
];

const C = {
  navy: "#1A3A5C", navyDeep: "#0B1C30", gold: "#C8A84B",
  white: "#F4F6F9", gray: "#8899AA", surface: "#162E4A",
  surfaceHi: "#1E3D5A", teal: "#2DD4BF",
};

type DomainScore = { domain: string; score: number; notes: string };
type DocVerification = { document: string; verified: boolean; notes: string };

type Evaluation = {
  id: string;
  status: string;
  evaluator_email: string;
  domain_scores: DomainScore[];
  doc_checklist: DocVerification[];
  narrative_notes: string;
  recommended_next: string;
  attestation: string;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string;
};

export default function EvaluationPanel({
  participantId,
  actorEmail,
  currentStatus,
}: {
  participantId: string;
  actorEmail: string;
  currentStatus: string;
}) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>(
    DOMAINS.map((d) => ({ domain: d.key, score: 0, notes: "" }))
  );
  const [docChecklist, setDocChecklist] = useState<DocVerification[]>(
    DOCS.map((d) => ({ document: d.key, verified: false, notes: "" }))
  );
  const [narrative, setNarrative] = useState("");
  const [recommended, setRecommended] = useState("");
  const [attestation, setAttestation] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api<{ evaluation: Evaluation | null }>(
          `/participants/${participantId}/evaluation`
        );
        if (res.evaluation) {
          const ev = res.evaluation;
          setEvaluation(ev);
          if (ev.domain_scores?.length) setDomainScores(ev.domain_scores);
          if (ev.doc_checklist?.length) setDocChecklist(ev.doc_checklist);
          setNarrative(ev.narrative_notes ?? "");
          setRecommended(ev.recommended_next ?? "");
          setAttestation(ev.attestation ?? "");
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [participantId]);

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
        const res = await api<{ evaluation: Evaluation | null }>(
          `/participants/${participantId}/evaluation`
        );
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
    <div style={{
      background: C.surface,
      border: `1px solid ${C.gold}44`,
      borderRadius: 8,
      padding: 20,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
        Evaluation Record
      </div>

      {evaluation?.status && (
        <div style={{ marginBottom: 14 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "3px 10px", borderRadius: 20,
            background: evaluation.status === "approved"
              ? "rgba(52,211,153,0.15)"
              : evaluation.status === "submitted"
              ? "rgba(200,168,75,0.15)"
              : evaluation.status === "rejected"
              ? "rgba(248,113,113,0.15)"
              : "rgba(255,255,255,0.08)",
            color: evaluation.status === "approved" ? "#34D399"
              : evaluation.status === "submitted" ? C.gold
              : evaluation.status === "rejected" ? "#F87171"
              : C.gray,
          }}>
            {evaluation.status.toUpperCase()}
          </span>
          {evaluation.approved_by && (
            <span style={{ fontSize: 10, color: C.gray, marginLeft: 10 }}>
              {evaluation.status === "approved" ? "Approved" : "Reviewed"} by {evaluation.approved_by}
            </span>
          )}
        </div>
      )}

      {msg && (
        <div style={{
          padding: "10px 12px", borderRadius: 4, marginBottom: 14, fontSize: 12,
          background: msg.ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
          border: `1px solid ${msg.ok ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
          color: msg.ok ? "#34D399" : "#F87171",
        }}>
          {msg.text}
        </div>
      )}

      {/* Domain Scores */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: C.gray, marginBottom: 10 }}>Domain Scores (0–100)</div>
        {DOMAINS.map((d, i) => (
          <div key={d.key} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.teal, fontFamily: "monospace", minWidth: 36, textAlign: "right" }}>
                {domainScores[i]?.score ?? 0}
              </span>
            </div>
            <input
              type="range" min={0} max={100}
              value={domainScores[i]?.score ?? 0}
              disabled={isLocked}
              onChange={(e) => {
                const updated = [...domainScores];
                updated[i] = { ...updated[i], score: Number(e.target.value) };
                setDomainScores(updated);
              }}
              style={{ width: "100%", accentColor: C.gold, marginBottom: 6 }}
            />
            <input
              type="text"
              placeholder={`Notes on ${d.label.toLowerCase()}...`}
              value={domainScores[i]?.notes ?? ""}
              disabled={isLocked}
              onChange={(e) => {
                const updated = [...domainScores];
                updated[i] = { ...updated[i], notes: e.target.value };
                setDomainScores(updated);
              }}
              style={{
                width: "100%", padding: "6px 10px", borderRadius: 4,
                background: C.navyDeep, border: `1px solid ${C.surfaceHi}`,
                color: C.white, fontSize: 11, outline: "none", boxSizing: "border-box" as const,
              }}
            />
          </div>
        ))}
      </div>

      {/* Document Checklist */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: C.gray, marginBottom: 10 }}>Document Verification</div>
        {DOCS.map((doc, i) => (
          <div key={doc.key} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 0", borderBottom: `1px solid ${C.surfaceHi}`,
          }}>
            <input
              type="checkbox"
              checked={docChecklist[i]?.verified ?? false}
              disabled={isLocked}
              onChange={(e) => {
                const updated = [...docChecklist];
                updated[i] = { ...updated[i], verified: e.target.checked };
                setDocChecklist(updated);
              }}
              style={{ accentColor: C.gold, width: 16, height: 16, flexShrink: 0 }}
            />
            <span style={{
              fontSize: 12, flex: 1,
              color: docChecklist[i]?.verified ? "#34D399" : C.gray,
              fontWeight: docChecklist[i]?.verified ? 600 : 400,
            }}>
              {doc.label}
            </span>
          </div>
        ))}
      </div>

      {/* Narrative */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: C.gray, marginBottom: 6 }}>Narrative Assessment</div>
        <textarea
          value={narrative}
          disabled={isLocked}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="Evaluator narrative assessment of participant readiness..."
          rows={4}
          style={{
            width: "100%", padding: 10, borderRadius: 4,
            background: C.navyDeep, border: `1px solid ${C.surfaceHi}`,
            color: C.white, fontSize: 12, resize: "vertical" as const,
            outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {/* Recommended Next Steps */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: C.gray, marginBottom: 6 }}>Recommended Next Steps</div>
        <textarea
          value={recommended}
          disabled={isLocked}
          onChange={(e) => setRecommended(e.target.value)}
          placeholder="Recommended actions for participant post-evaluation..."
          rows={3}
          style={{
            width: "100%", padding: 10, borderRadius: 4,
            background: C.navyDeep, border: `1px solid ${C.surfaceHi}`,
            color: C.white, fontSize: 12, resize: "vertical" as const,
            outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {/* Attestation */}
      {!isLocked && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: C.gray, marginBottom: 6 }}>
            Evaluator Attestation <span style={{ color: "#F87171" }}>(required to submit)</span>
          </div>
          <input
            type="text"
            value={attestation}
            onChange={(e) => setAttestation(e.target.value)}
            placeholder="Full name — I attest this evaluation is accurate and complete"
            style={{
              width: "100%", padding: "8px 10px", borderRadius: 4,
              background: C.navyDeep, border: `1px solid ${C.gold}44`,
              color: C.white, fontSize: 12, outline: "none",
              boxSizing: "border-box" as const,
            }}
          />
        </div>
      )}

      {evaluation?.attestation && isLocked && (
        <div style={{
          padding: "10px 14px", borderRadius: 4, marginBottom: 14,
          background: "rgba(200,168,75,0.08)", border: `1px solid ${C.gold}33`,
        }}>
          <div style={{ fontSize: 10, color: C.gold, marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Attestation</div>
          <div style={{ fontSize: 12, color: C.white }}>{evaluation.attestation}</div>
        </div>
      )}

      {/* Actions */}
      {!isLocked && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving || submitting}
            style={{
              flex: 1, padding: "9px", borderRadius: 4, cursor: "pointer",
              background: "none", color: C.gray,
              border: `1px solid ${C.surfaceHi}`,
              fontSize: 11, fontWeight: 600,
            }}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saving || submitting || !attestation.trim()}
            style={{
              flex: 2, padding: "9px", borderRadius: 4, cursor: "pointer",
              background: attestation.trim() ? C.gold : C.surfaceHi,
              color: attestation.trim() ? C.navyDeep : C.gray,
              border: "none", fontSize: 12, fontWeight: 800,
              letterSpacing: "0.06em", textTransform: "uppercase" as const,
            }}
          >
            {submitting ? "Submitting..." : "Submit to BRSA Authority"}
          </button>
        </div>
      )}
    </div>
  );
                                                 }
