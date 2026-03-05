import { ConsentPanel } from "./components/panels/ConsentPanel";
import { ReadinessPanel } from "./components/panels/ReadinessPanel";
import { EvidencePanel } from "./components/panels/EvidencePanel";
import { StateHistoryPanel } from "./components/panels/StateHistoryPanel";
import { UnifiedTimeline } from "./components/timeline/UnifiedTimeline";

// Import your data loaders and actions
// (Adjust these paths to match your actual project structure)
import {
  getSubjectData,
  getConsent,
  getReadiness,
  getEvidenceEvents,
  getStateHistory,
  grantConsent,
  revokeConsent,
  recomputeReadiness,
  addCheckIn,
} from "./actions";

export default async function SubjectPage({
  params,
}: {
  params: { participant_id: string };
}) {
  const participantId = params.participant_id;

  // Load all subject data
  const [subject, consent, readiness, evidence, stateHistory] =
    await Promise.all([
      getSubjectData(participantId),
      getConsent(participantId),
      getReadiness(participantId),
      getEvidenceEvents(participantId),
      getStateHistory(participantId),
    ]);

  // Build unified timeline
  const timelineEvents = [
    ...consent.timeline,
    ...evidence.timeline,
    ...readiness.timeline,
    ...stateHistory.timeline,
  ].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Subject: {subject.label}
      </h1>

      {/* Panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ConsentPanel
          consent={consent}
          onGrant={() => grantConsent(participantId)}
          onRevoke={() => revokeConsent(participantId)}
        />

        <ReadinessPanel
          readiness={readiness}
          onRecompute={() => recomputeReadiness(participantId)}
        />

        <EvidencePanel
          events={evidence.events}
          onAddCheckIn={() => addCheckIn(participantId)}
        />

        <StateHistoryPanel entries={stateHistory.entries} />
      </div>

      {/* Unified Timeline */}
      <UnifiedTimeline events={timelineEvents} />
    </main>
  );
}
