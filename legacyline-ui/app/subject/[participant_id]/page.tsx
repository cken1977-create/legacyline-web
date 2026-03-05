"use client";

import { useEffect, useState } from "react";
import Shell from "../../_components/Shell";

type Subject = {
  participant_id?: string;
  subject_number?: number;
  registry_id?: string;
  status?: string;
  created_at?: string;
};

export default function SubjectPage({
  params,
}: {
  params: { participant_id?: string };
}) {
  const participantId = params?.participant_id;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSubject(pid: string) {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://legacyline-core-production.up.railway.app/participants/${pid}`,
          { cache: "no-store" }
        );

        const text = await res.text();

        if (!res.ok) {
          if (!cancelled) setError(`API ${res.status}: ${text || res.statusText}`);
          return;
        }

        let data: Subject;
        try {
          data = JSON.parse(text);
        } catch {
          if (!cancelled) setError(`API returned non-JSON:\n${text}`);
          return;
        }

        if (!cancelled) setSubject(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load subject");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // ✅ THIS prevents infinite loading
    if (!participantId) {
      setError("Missing participant_id in the URL. Go to Intake and create a subject first.");
      setLoading(false);
      return;
    }

    loadSubject(participantId);

    return () => {
      cancelled = true;
    };
  }, [participantId]);

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">
          {subject?.subject_number ? `Subject #${subject.subject_number}` : "Subject"}
        </h2>

        {/* Debug line (keep it for now) */}
        <div className="mt-2 text-xs text-white/40">participant_id: {participantId ?? "—"}</div>

        {loading && !error && <div className="mt-4 text-white/70">Loading subject…</div>}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        {subject && !error && (
          <>
            <div className="mt-4 space-y-2 text-white/80">
              <div>Participant ID: {subject.participant_id ?? participantId}</div>
              <div>Registry ID: {subject.registry_id ?? "—"}</div>
              <div>Status: {subject.status ?? "—"}</div>
              <div>Created: {subject.created_at ?? "—"}</div>
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
