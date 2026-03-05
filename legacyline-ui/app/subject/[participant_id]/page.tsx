"use client";

import { useEffect, useMemo, useState } from "react";
import Shell from "../../_components/Shell";

type Subject = {
  participant_id: string;
  subject_number: number;
  registry_id: string;
  status: string;
  created_at: string;
};

type Props = {
  params: { participant_id: string };
};

export default function SubjectPage({ params }: Props) {
  const participant_id = params?.participant_id;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Centralize base URL (prefer env var; fallback to Railway)
  const API_URL = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      "https://legacyline-core-production.up.railway.app"
    );
  }, []);

  useEffect(() => {
    if (!participant_id) {
      setError("Missing participant_id in route.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSubject() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/participants/${participant_id}`, {
          cache: "no-store",
        });

        const text = await res.text();

        if (!res.ok) {
          if (!cancelled) {
            setError(`API ${res.status}: ${text || res.statusText}`);
            setSubject(null);
          }
          return;
        }

        let data: Subject;
        try {
          data = JSON.parse(text);
        } catch {
          if (!cancelled) {
            setError(`API returned non-JSON:\n${text}`);
            setSubject(null);
          }
          return;
        }

        if (!cancelled) setSubject(data);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load subject");
          setSubject(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSubject();

    return () => {
      cancelled = true;
    };
  }, [API_URL, participant_id]);

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">Subject</h2>

        {loading && (
          <div className="mt-4 text-white/70">Loading subject…</div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200 ring-1 ring-red-500/20 whitespace-pre-wrap">
            {error}
          </div>
        )}

        {!loading && !error && subject && (
          <>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">
              Subject #{subject.subject_number}
            </h3>

            <div className="mt-4 space-y-2 text-white/80">
              <div>Participant ID: {subject.participant_id}</div>
              <div>Registry ID: {subject.registry_id}</div>
              <div>Status: {subject.status}</div>
              <div>Created: {subject.created_at}</div>
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
