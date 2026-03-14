"use client";

import { useState } from "react";

type StateTransitionPanelProps = {
  currentStatus: string;
  subjectId: string;
  onTransition: (to: string, reason: string) => Promise<void>;
};

const TRANSITION_LABELS: Record<string, { label: string; color: string; description: string }> = {
  data_collecting: {
    label: "Begin Data Collection",
    color: "bg-yellow-500/20 text-yellow-300 ring-yellow-500/30 hover:bg-yellow-500/30",
    description: "Move client into active data collection phase",
  },
  under_review: {
    label: "Submit for Review",
    color: "bg-orange-500/20 text-orange-300 ring-orange-500/30 hover:bg-orange-500/30",
    description: "Submit client file for evaluator review",
  },
  evaluated: {
    label: "Mark as Evaluated",
    color: "bg-purple-500/20 text-purple-300 ring-purple-500/30 hover:bg-purple-500/30",
    description: "Confirm evaluation is complete",
  },
  certified: {
    label: "Issue Certification",
    color: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30 hover:bg-emerald-500/30",
    description: "Issue BRSA Readiness Certification to client",
  },
  revoked: {
    label: "Revoke Certification",
    color: "bg-red-500/20 text-red-300 ring-red-500/30 hover:bg-red-500/30",
    description: "Revoke this client's certification",
  },
};

const TRANSITIONS: Record<string, string[]> = {
  registered: ["data_collecting"],
  data_collecting: ["under_review"],
  under_review: ["data_collecting", "evaluated"],
  evaluated: ["certified"],
  certified: ["revoked"],
  revoked: [],
};

const STATUS_STEPS = [
  "registered",
  "data_collecting",
  "under_review",
  "evaluated",
  "certified",
];

export default function StateTransitionPanel({
  currentStatus,
  subjectId,
  onTransition,
}: StateTransitionPanelProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const allowed = TRANSITIONS[currentStatus] ?? [];
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  async function handleTransition(to: string) {
    setLoading(to);
    setMessage("");
    try {
      await onTransition(to, reason || `Transitioned to ${to} by evaluator`);
      setMessage(`✓ Status updated to ${to.replace(/_/g, " ")}`);
      setReason("");
    } catch (err: any) {
      setMessage(`Error: ${err?.message ?? "Transition failed"}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="text-sm font-semibold text-white">Evaluator Actions</div>
      <div className="mt-1 text-xs text-white/60">
        Move this client through the BRSA readiness pipeline.
      </div>

      {/* Progress Track */}
      <div className="mt-5 flex items-center gap-1">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step} className="flex items-center gap-1 flex-1">
            <div
              className={`h-2 flex-1 rounded-full transition-colors ${
                idx <= currentIndex
                  ? "bg-[#C8A84B]"
                  : "bg-white/10"
              }`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 text-xs text-[#C8A84B] capitalize">
        {currentStatus.replace(/_/g, " ")}
      </div>

      {/* Reason Input */}
      {allowed.length > 0 && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-white/60">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. All documents verified"
            className="w-full rounded-xl bg-black/30 px-3 py-2 text-xs text-white placeholder-white/30 ring-1 ring-white/10 outline-none focus:ring-[#C8A84B]/60"
          />
        </div>
      )}

      {/* Transition Buttons */}
      <div className="mt-4 space-y-2">
        {allowed.length === 0 ? (
          <div className="text-xs text-white/40">
            {currentStatus === "certified"
              ? "Client is certified. No further transitions available."
              : currentStatus === "revoked"
              ? "Certification has been revoked."
              : "No transitions available from this state."}
          </div>
        ) : (
          allowed.map((to) => {
            const config = TRANSITION_LABELS[to];
            return (
              <button
                key={to}
                onClick={() => handleTransition(to)}
                disabled={loading !== null}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ring-1 transition-colors disabled:opacity-50 ${config.color}`}
              >
                <div>{config.label}</div>
                <div className="mt-0.5 text-xs font-normal opacity-70">
                  {config.description}
                </div>
              </button>
            );
          })
        )}
      </div>

      {message && (
        <div className={`mt-3 text-xs ${message.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
          {message}
        </div>
      )}
    </section>
  );
        }
