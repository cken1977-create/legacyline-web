"use client";

import { useState } from "react";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

type CreateSubjectResponse = {
  participant_id?: string;
  subject_number?: number;
  registry_id?: string;
  created_at?: string;
};

export default function IntakePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateSubjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createSubject() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api<CreateSubjectResponse>("/participants", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Intake</h2>
        <p className="mt-2 text-white/70">
          Create a subject record and start evidence collection. This connects
          to Legacyline Core.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Subject Creation</div>
            <div className="mt-2 text-sm text-white/65">
              Deterministic subject number + registry ID binding.
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Consent + Scope</div>
            <div className="mt-2 text-sm text-white/65">
              Consent-based, longitudinal behavioral data. No lending decisions.
            </div>
          </div>
        </div>

        <button
          onClick={createSubject}
          disabled={loading}
          className="mt-7 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Subject"}
        </button>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-500/20">
            <div className="font-semibold">Created</div>
            <div className="mt-2 space-y-1 text-white/75">
              <div>participant_id: {result.participant_id ?? "—"}</div>
              <div>subject_number: {result.subject_number ?? "—"}</div>
              <div>registry_id: {result.registry_id ?? "—"}</div>
              <div>created_at: {result.created_at ?? "—"}</div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
