import ConsentPanel from "./components/panels/ConsentPanel";
import ReadinessPanel from "./components/panels/ReadinessPanel";
import EvidencePanel from "./components/panels/EvidencePanel";
import StateHistoryPanel from "./components/panels/StateHistoryPanel";
import { UnifiedTimeline } from "./components/timeline/UnifiedTimeline";

import {
  getSubject,
  getConsent,
  getReadiness,
  getEvidenceEvents,
  getStateHistory,
  grantConsent,
  revokeConsent,
  recomputeReadiness,
  addCheckIn,
} from "./actions";

type TimelineKind = "consent" | "evidence" | "readiness" | "state";

export type TimelineEvent = {
  id: string;
  kind: TimelineKind;
  occurred_at: string;
  label: string;
  actor?: string;
  meta?: string;
};

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ participant_id: string }>;
}) {
  const { participant_id: id } = await params;
  
  const subjectId = id;

  const [subject, consent, readiness, evidence, stateHistory] =
    await Promise.all([
      getSubject(subjectId).catch(() => null),
      getConsent(subjectId).catch(() => ({ status: "none", timeline: [] })),
      getReadiness(subjectId).catch(() => ({ readiness: null, timeline: [] })),
      getEvidenceEvents(subjectId).catch(() => ({ events: [], timeline: [] })),
      getStateHistory(subjectId).catch(() => ({ entries: [], timeline: [] })),
    ]);

  const timelineEvents: TimelineEvent[] = [
    ...((consent as any)?.timeline ?? []),
    ...((evidence as any)?.timeline ?? []),
    ...((readiness as any)?.timeline ?? []),
    ...((stateHistory as any)?.timeline ?? []),
  ]
    .map((ev: any, idx: number) => ({
      id: String(ev?.id ?? `${ev?.kind ?? "event"}-${idx}`),
      kind: (ev?.kind ?? "state") as TimelineKind,
      occurred_at: String(
        ev?.occurred_at ?? ev?.created_at ?? new Date().toISOString()
      ),
      label: String(ev?.label ?? ev?.type ?? "Event"),
      actor: ev?.actor ? String(ev.actor) : undefined,
      meta: ev?.meta ? String(ev.meta) : undefined,
    }))
    .sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() -
        new Date(a.occurred_at).getTime()
    );

  // Create wrapper functions that return Promise<void> as expected by the panels
  const handleGrantAction = async (formData: FormData) => {
    "use server";
    formData.append("subjectId", subjectId);
    await grantConsent(formData);
  };

  const handleRevokeAction = async (formData: FormData) => {
    "use server";
    formData.append("subjectId", subjectId);
    await revokeConsent(formData);
  };

  const handleRecomputeAction = async (formData: FormData) => {
    "use server";
    formData.append("subjectId", subjectId);
    await recomputeReadiness(formData);
  };

  const handleAddCheckInAction = async (formData: FormData) => {
    "use server";
    formData.append("subjectId", subjectId);
    await addCheckIn(formData);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Subject: {(subject as any)?.label || id}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ConsentPanel
          consent={consent as any}
          subjectId={subjectId}
          grantAction={handleGrantAction}
          revokeAction={handleRevokeAction}
        />

        <EvidencePanel
          events={((evidence as any)?.events ?? []) as any[]}
          subjectId={subjectId}
          addCheckInAction={handleAddCheckInAction}
        />

        <ReadinessPanel
          readiness={readiness as any}
          subjectId={subjectId}
          recomputeAction={handleRecomputeAction}
        />

        <StateHistoryPanel
          entries={((stateHistory as any)?.entries ?? []) as any[]}
        />
      </div>

      <UnifiedTimeline events={timelineEvents} />
    </main>
  );
}
