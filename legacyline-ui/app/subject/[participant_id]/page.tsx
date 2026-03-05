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

// Minimal type that makes TS happy AND is flexible with your backend shape.
type TimelineEvent = {
  id: string;
  kind: TimelineKind;
  occurred_at?: string;  // preferred
  created_at?: string;   // fallback
  timestamp?: string;    // fallback
  label?: string;
  actor?: string;
  meta?: string;
};

function getEventTime(ev: TimelineEvent): number {
  const t = ev.occurred_at || ev.created_at || ev.timestamp;
  const ms = t ? new Date(t).getTime() : 0;
  return Number.isFinite(ms) ? ms : 0;
}

export default async function SubjectPage({
  params,
}: {
  params: { participant_id: string };
}) {
  const id = params.participant_id;

  const [subject, consent, readiness, evidence, stateHistory] = await Promise.all([
    getSubject(id),
    getConsent(id),
    getReadiness(id),
    getEvidenceEvents(id),
    getStateHistory(id),
  ]);

  // Force a safe, consistent event type for all timeline arrays.
  const consentTimeline = (consent?.timeline ?? []) as TimelineEvent[];
  const evidenceTimeline = (evidence?.timeline ?? []) as TimelineEvent[];
  const readinessTimeline = (readiness?.timeline ?? []) as TimelineEvent[];
  const stateTimeline = (stateHistory?.timeline ?? []) as TimelineEvent[];

  const timelineEvents: TimelineEvent[] = [
    ...consentTimeline,
    ...evidenceTimeline,
    ...readinessTimeline,
    ...stateTimeline,
  ].sort((a, b) => getEventTime(b) - getEventTime(a));

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
