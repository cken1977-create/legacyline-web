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

// Safe timestamp resolver so TS stops complaining and mixed timeline shapes still sort correctly
function eventTime(ev: any): number {
  const t =
    ev?.occurred_at ??
    ev?.created_at ??
    ev?.timestamp ??
    ev?.time ??
    ev?.at;

  const ms = t ? new Date(t).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

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

  const timelineEvents = [
    ...(consent?.timeline || []),
    ...(evidence?.timeline || []),
    ...(readiness?.timeline || []),
    ...(stateHistory?.timeline || []),
  ].sort((a, b) => eventTime(b) - eventTime(a));

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Subject: {subject?.label || id}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ConsentPanel
          consent={consent}
          onGrant={() => grantConsent(id)}
          onRevoke={() => revokeConsent(id)}
        />

        <ReadinessPanel
          readiness={readiness}
          onRecompute={() => recomputeReadiness(id)}
        />

        <EvidencePanel
          events={evidence?.events || []}
          onAddCheckIn={() => addCheckIn(id)}
        />

        <StateHistoryPanel entries={stateHistory?.entries || []} />
      </div>

      <UnifiedTimeline events={timelineEvents} />
    </main>
  );
}
