import { ConsentPanel } from "./components/panels/ConsentPanel";
import { ReadinessPanel } from "./components/panels/ReadinessPanel";
import { EvidencePanel } from "./components/panels/EvidencePanel";
import { StateHistoryPanel } from "./components/panels/StateHistoryPanel";
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
  occurred_at: string; // required for sort
  label: string;
  actor?: string;
  meta?: string;
};

export default async function SubjectPage({
  params,
}: {
  params: { participant_id: string };
}) {
  const id = params.participant_id;

  const [subject, consent, readiness, evidence, stateHistory] =
    await Promise.all([
      getSubject(id),
      getConsent(id),
      getReadiness(id),
      getEvidenceEvents(id),
      getStateHistory(id),
    ]);

  // Normalize all timelines into a single typed list
  const timelineEvents: TimelineEvent[] = [
    ...(((consent as any)?.timeline ?? []) as TimelineEvent[]),
    ...(((evidence as any)?.timeline ?? []) as TimelineEvent[]),
    ...(((readiness as any)?.timeline ?? []) as TimelineEvent[]),
    ...(((stateHistory as any)?.timeline ?? []) as TimelineEvent[]),
  ]
    .map((ev: any, idx: number) => ({
      // harden fields so TypeScript + runtime both behave
      id: String(ev?.id ?? `${ev?.kind ?? "event"}-${idx}`),
      kind: (ev?.kind ?? "state") as TimelineKind,
      occurred_at: String(ev?.occurred_at ?? ev?.created_at ?? new Date().toISOString()),
      label: String(ev?.label ?? ev?.type ?? "Event"),
      actor: ev?.actor ? String(ev.actor) : undefined,
      meta: ev?.meta ? String(ev.meta) : undefined,
    }))
    .sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Subject: {(subject as any)?.label || id}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ConsentPanel
          consent={consent as any}
          onGrant={() => grantConsent(id)}
          onRevoke={() => revokeConsent(id)}
        />

        <ReadinessPanel
          readiness={readiness as any}
          onRecompute={() => recomputeReadiness(id)}
        />

        <EvidencePanel
          events={(((evidence as any)?.events ?? []) as any[])}
          onAddCheckIn={() => addCheckIn(id)}
        />

        <StateHistoryPanel entries={(((stateHistory as any)?.entries ?? []) as any[])} />
      </div>

      <UnifiedTimeline events={timelineEvents} />
    </main>
  );
}
