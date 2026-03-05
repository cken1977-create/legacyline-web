"use client";

import { useEffect, useState } from "react";
import Shell from "../../_components/Shell";

type Subject = {
  participant_id: string;
  subject_number: number;
  registry_id: string;
  status: string;
  created_at: string;
};

export default function SubjectPage({ params }: any) {
  const { participant_id } = params;

  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    async function loadSubject() {
      const res = await fetch(
        `https://legacyline-core-production.up.railway.app/participants/${participant_id}`
      );

      const data = await res.json();
      setSubject(data);
    }

    loadSubject();
  }, [participant_id]);

  if (!subject) {
    return (
      <Shell>
        <div className="p-8 text-white">Loading subject...</div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">
          Subject #{subject.subject_number}
        </h2>

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
      </div>
    </Shell>
  );
}
