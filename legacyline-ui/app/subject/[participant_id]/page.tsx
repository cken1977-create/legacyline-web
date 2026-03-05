"use client";

import { useEffect, useState } from "react";
import Shell from "../../_components/Shell";
import { api } from "../../lib/api";

type Subject = {
  id: string;
  subject_number?: number;
  status?: string;
  created_at?: string;
  registry_id?: string;
};

export default function SubjectPage({
  params,
}: {
  params: { participant_id: string };
}) {
  const participantId = params.participant_id;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setError("");
        const data = await api<Subject>(`/participants/${participantId}`, {
          method: "GET",
        });
        if (!alive) return;
        setSubject(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load subject");
      }
    }

    if (!participantId || participantId === "undefined") {
      setError("Missing participant_id in URL. Go to Intake and create a subject first.");
      return;
    }

    load();

    return () => {
      alive = false;
    };
  }, [participantId]);

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Subject</h2>

        <div className="mt-3 text-white/60 text-sm">
          participant_id: {participantId || "—"}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        {!error && !subject && (
          <div className="mt-4 text-white/70">Loading subject…</div>
        )}

        {subject && (
          <>
            <div className="mt-5 space-y-2 text-white/80">
              <div>
                <span className="text-white/60">ID:</span> {subject.id}
              </div>
              <div>
                <span className="text-white/60">Subject #:</span>{" "}
                {subject.subject_number ?? "—"}
              </div>
              <div>
                <span className="text-white/60">Status:</span>{" "}
                {subject.status ?? "—"}
              </div>
              <div>
                <span className="text-white/60">Created:</span>{" "}
                {subject.created_at ?? "—"}
              </div>
              <div>
                <span className="text-white/60">Registry ID:</span>{" "}
                {subject.registry_id ?? "—"}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
              <div className="text-sm font-semibold">Evidence Timeline</div>
              <div className="mt-2 text-sm text-white/60">
                No evidence events recorded yet.
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
