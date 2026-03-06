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
  
  // Keep as string - this is what the actions expect
  const subjectId = id;

  const [subject, consent, readiness, evidence, stateHistory] =
    await Promise.all([
      getSubject(subjectId),      // 👈 Pass string
      getConsent(subjectId),      // 👈 Pass string
      getReadiness(subjectId),    // 👈 Pass string
      getEvidenceEvents(subjectId), // 👈 Pass string
      getStateHistory(subjectId), // 👈 Pass string
    ]);

  const timelineEvents: TimelineEvent[] = [
    ...(((consent as any)?.timeline ?? []) as TimelineEvent[]),
    ...(((evidence as any)?.timeline ?? []) as TimelineEvent[]),
    ...(((readiness as any)?.timeline ?? []) as TimelineEvent[]),
    ...(((stateHistory as any)?.timeline ?? []) as TimelineEvent[]),
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

  // Create wrapped action functions that handle the subjectId as string
  const handleGrantConsent = async () => {
    "use server";
    return grantConsent(subjectId);  // 👈 Pass string
  };

  const handleRevokeConsent = async () => {
    "use server";
    return revokeConsent(subjectId);  // 👈 Pass string
  };

  const handleAddCheckIn = async (data: any) => {
    "use server";
    return addCheckIn(subjectId, data);  // 👈 Pass string
  };

  const handleRecomputeReadiness = async () => {
    "use server";
    return recomputeReadiness(subjectId);  // 👈 Pass string
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Subject: {(subject as any)?.label || id}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ConsentPanel
          consent={consent as any}
          subjectId={subjectId}  // 👈 Pass string
          grantAction={handleGrantConsent}
          revokeAction={handleRevokeConsent}
        />

        <EvidencePanel
          events={((evidence as any)?.events ?? []) as any[]}
          subjectId={subjectId}  // 👈 Pass string
          addCheckInAction={handleAddCheckIn}
        />

        <ReadinessPanel
          readiness={readiness as any}
          subjectId={subjectId}  // 👈 Pass string
          recomputeAction={handleRecomputeReadiness}
        />

        <StateHistoryPanel
          entries={((stateHistory as any)?.entries ?? []) as any[]}
        />
      </div>

      <UnifiedTimeline events={timelineEvents} />
    </main>
  );
}
