"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app";

// ─── Types ────────────────────────────────────────────────────────────────────

type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  subject_number: number;
  registry_id: string;
  created_at: string;
};

type IntakeSubmission = {
  id: string;
  status: string;
  submitted_at: string;
  docs_uploaded: {
    gov_id: boolean;
    selfie: boolean;
    bank_statement: boolean;
  };
  review_notes?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const LIFECYCLE = [
  { key: "registered",      label: "Registered",       step: 1 },
  { key: "data_collecting", label: "Intake Submitted",  step: 2 },
  { key: "under_review",    label: "Under Review",      step: 3 },
  { key: "evaluated",       label: "Evaluated",         step: 4 },
  { key: "certified",       label: "Certified",         step: 5 },
];

const READINESS_LABELS = [
  { min: 0,  max: 24,  label: "Emerging",      color: "#888" },
  { min: 25, max: 49,  label: "Developing",    color: "#C8A84B" },
  { min: 50, max: 69,  label: "Progressing",   color: "#4B9BC8" },
  { min: 70, max: 89,  label: "Provider Ready", color: "#4BC87A" },
  { min: 90, max: 100, label: "BRSA Certified", color: "#C84B8A" },
];

function getLabel(score: number) {
  return READINESS_LABELS.find((r) => score >= r.min && score <= r.max) || READINESS_LABELS[0];
}

const STATUS_POINTS: Record<string, number> = {
  registered: 15,
  data_collecting: 40,
  under_review: 40,
  evaluated: 65,
  certified: 75,
};

function getPoints(status: string) {
  return STATUS_POINTS[status] ?? 15;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const label = getLabel(score);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 156, height: 156 }}>
      <svg width="156" height="156" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="78" cy="78" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="78" cy="78" r={radius}
          fill="none"
          stroke={label.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {score}
        </span>
        <span className="text-xs font-semibold mt-0.5" style={{ color: label.color }}>
          {label.label}
        </span>
      </div>
    </div>
  );
}

// ─── Lifecycle Track ──────────────────────────────────────────────────────────

function LifecycleTrack({ status }: { status: string }) {
  const currentStep = LIFECYCLE.find((l) => l.key === status)?.step ?? 1;

  return (
    <div className="flex items-center justify-between px-1">
      {LIFECYCLE.map((step, i) => {
        const done = step.step < currentStep;
        const active = step.step === currentStep;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? "#C8A84B" : active ? "rgba(200,168,75,0.2)" : "rgba(255,255,255,0.04)",
                  border: done || active ? "2px solid #C8A84B" : "2px solid rgba(255,255,255,0.08)",
                  color: done ? "#000" : active ? "#C8A84B" : "rgba(255,255,255,0.2)",
                }}
              >
                {done ? "✓" : step.step}
              </div>
              <span
                className="text-[9px] text-center leading-tight max-w-[52px]"
                style={{ color: done || active ? "#C8A84B" : "rgba(255,255,255,0.25)" }}
              >
                {step.label}
              </span>
            </div>
            {i < LIFECYCLE.length - 1 && (
              <div
                className="flex-1 h-px mx-1 mb-4 transition-all"
                style={{ background: done ? "#C8A84B" : "rgba(255,255,255,0.08)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Next Step Card ───────────────────────────────────────────────────────────

function NextStep({ status, intakeStatus }: { status: string; intakeStatus?: string }) {
  const steps: Record<string, { title: string; body: string; color: string }> = {
    registered: {
      title: "Complete Your Intake",
      body: "Your account is created. Return to intake to submit your information and documents.",
      color: "#C8A84B",
    },
    data_collecting: {
      title: "Intake Under Review",
      body: "Your intake was received. A certified BRSA evaluator will review your documents within 2 business days.",
      color: "#4B9BC8",
    },
    under_review: {
      title: "Evaluation In Progress",
      body: "Your evaluator is actively reviewing your record. You'll be notified when your score is ready.",
      color: "#C84B8A",
    },
    evaluated: {
      title: "Review Your Results",
      body: "Your readiness evaluation is complete. Review your domain scores and discuss next steps with your evaluator.",
      color: "#4BC87A",
    },
    certified: {
      title: "BRSA Certified",
      body: "Congratulations — you are BRSA certified. Your record is verified and ready to share with institutions.",
      color: "#C8A84B",
    },
  };

  const s = steps[status] ?? steps.registered;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: `${s.color}0f`, border: `1px solid ${s.color}30` }}
    >
      <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: s.color }}>
        Next Step
      </div>
      <div className="text-white font-semibold text-sm mb-1">{s.title}</div>
      <div className="text-white/45 text-xs leading-relaxed">{s.body}</div>
      {intakeStatus && intakeStatus !== "pending" && (
        <div className="mt-3 text-xs font-medium" style={{ color: s.color }}>
          Intake review status: {intakeStatus.replace(/_/g, " ")}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IndividualDashboardPage() {
  const params = useParams();
  const id = params?.id as string;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [intake, setIntake] = useState<IntakeSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        // Load participant
        const pRes = await fetch(`${API}/participants/${id}`);
        if (!pRes.ok) throw new Error("Participant not found");
        const pData = await pRes.json();
        setParticipant(pData);

        // Load intake submission if exists
        const iRes = await fetch(`${API}/participants/${id}/intake`);
        if (iRes.ok) {
          const iData = await iRes.json();
          setIntake(iData);
        }
      } catch (err: any) {
        setError(err?.message || "Unable to load your dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060d18" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8A84B] border-t-transparent animate-spin" />
          <div className="text-white/40 text-sm">Loading your dashboard…</div>
        </div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#060d18" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠</div>
          <div className="text-white font-semibold mb-2">Unable to load dashboard</div>
          <div className="text-white/40 text-sm">{error || "Participant record not found."}</div>
        </div>
      </div>
    );
  }

  const score = getPoints(participant.status);
  const docsUploaded = intake?.docs_uploaded;
  const docCount = docsUploaded
    ? [docsUploaded.gov_id, docsUploaded.selfie, docsUploaded.bank_statement].filter(Boolean).length
    : 0;

  return (
    <div className="min-h-screen px-4 py-10 space-y-5" style={{ background: "#060d18" }}>
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-1">
              Legacyline
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {participant.first_name}'s Record
            </h1>
          </div>
          {participant.registry_id && (
            <div className="text-right">
              <div className="text-[10px] text-white/30 mb-0.5">Registry ID</div>
              <div className="font-mono text-xs text-[#C8A84B]">{participant.registry_id}</div>
            </div>
          )}
        </div>

        {/* Score + Status */}
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 flex flex-col items-center gap-4">
          <ScoreRing score={score} />
          <div className="w-full">
            <LifecycleTrack status={participant.status} />
          </div>
        </div>

        {/* Next Step */}
        <NextStep status={participant.status} intakeStatus={intake?.status} />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Status",
              value: participant.status.replace(/_/g, " "),
              color: "#C8A84B",
            },
            {
              label: "Documents",
              value: intake ? `${docCount} / 3` : "0 / 3",
              color: docCount === 3 ? "#4BC87A" : docCount > 0 ? "#C8A84B" : "#888",
            },
            {
              label: "Points",
              value: `${score} pts`,
              color: "#4B9BC8",
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-center">
              <div className="text-[10px] text-white/35 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-sm font-bold capitalize" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Documents Checklist */}
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-xs font-semibold tracking-widest uppercase text-white/35 mb-4">
            Documents
          </div>
          <div className="space-y-3">
            {[
              { key: "gov_id", label: "Government-Issued ID", required: true },
              { key: "selfie", label: "Selfie with ID", required: false },
              { key: "bank_statement", label: "Bank Statement", required: false },
            ].map((doc) => {
              const uploaded = docsUploaded?.[doc.key as keyof typeof docsUploaded] ?? false;
              return (
                <div key={doc.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{
                        background: uploaded ? "rgba(75,200,122,0.15)" : "rgba(255,255,255,0.05)",
                        border: uploaded ? "1px solid rgba(75,200,122,0.4)" : "1px solid rgba(255,255,255,0.1)",
                        color: uploaded ? "#4BC87A" : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {uploaded ? "✓" : "·"}
                    </div>
                    <span className="text-sm text-white/70">{doc.label}</span>
                    {doc.required && (
                      <span className="text-[10px] text-white/25">required</span>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: uploaded ? "#4BC87A" : "rgba(255,255,255,0.2)" }}
                  >
                    {uploaded ? "Uploaded" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intake submission details */}
        {intake && (
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="text-xs font-semibold tracking-widest uppercase text-white/35 mb-4">
              Intake Submission
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Submitted</span>
                <span className="text-white/70">
                  {new Date(intake.submitted_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Review Status</span>
                <span className="capitalize font-medium" style={{ color: "#C8A84B" }}>
                  {intake.status.replace(/_/g, " ")}
                </span>
              </div>
              {intake.review_notes && (
                <div className="mt-3 rounded-xl bg-black/20 p-3 text-xs text-white/50 leading-relaxed">
                  {intake.review_notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy footer */}
        <div className="text-center text-xs text-white/20 pb-4 leading-relaxed">
          🔒 Your record is encrypted and consent-controlled.<br />
          Only shared with institutions you authorize.<br />
          © 2026 Legacyline · Powered by BRSA Holdings Inc.
        </div>
      </div>
    </div>
  );
}
