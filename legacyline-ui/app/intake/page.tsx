"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

type CreateParticipantResponse = {
  participant_id: string; // <-- your API returns "id"
  subject_number?: number;
  status?: string;
  created_at?: string;
  registry_id?: string; // if added later, fine
};

export default function IntakePage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function createSubject() {
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const data = await api<CreateParticipantResponse>("/participants", {
        method: "POST",
        body: JSON.stringify({}),
      });

      // Canon: redirect using returned id
      if (data?.participant_id) {
        router.push(`/subject/${data.participant_id}`);
        return;
      }

      // fallback if API shape changes
      setMessage(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setMessage(err?.message || "Error connecting to API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Intake</h2>

        <p className="mt-2 text-white/70">
          Create a subject record and start evidence collection.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Subject Creation</div>
            <div className="mt-2 text-sm text-white/65">
              Deterministic subject number + registry binding.
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Consent + Scope</div>
            <div className="mt-2 text-sm text-white/65">
              Consent-based behavioral data. No credit scoring. No lending decisions.
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

        {message && (
          <pre className="mt-6 rounded-xl bg-black/40 p-4 text-xs text-green-300 whitespace-pre-wrap">
            {message}
          </pre>
        )}
      </div>
    </Shell>
  );
}
