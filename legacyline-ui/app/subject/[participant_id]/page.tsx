import Shell from "../../_components/Shell";
import ConsentPanel from "./components/panels/ConsentPanel";
import ReadinessPanel from "./components/panels/ReadinessPanel";
import EvidencePanel from "./components/panels/EvidencePanel";
import StateHistoryPanel from "./components/panels/StateHistoryPanel";
import StateTransitionPanel from "./components/panels/StateTransitionPanel";
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
  transitionState,
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

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  registered:      { label: "Registered",      classes: "bg-blue-500/15 text-blue-400 ring-blue-500/25" },
  data_collecting: { label: "Data Collection",  classes: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/25" },
  under_review:    { label: "Under Review",     classes: "bg-orange-500/15 text-orange-400 ring-orange-500/25" },
  evaluated:       { label: "Evaluated",        classes: "bg-purple-500/15 text-purple-400 ring-purple-500/25" },
  certified:       { label: "Certified",        classes: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25" },
  revoked:         { label: "Revoked",          classes: "bg-red-500/15 text-red-400 ring-red-500/25" },
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

  const s = subject as any;
  const fullName = s?.first_name && s?.last_name
    ? `${s.first_name} ${s.last_name}`
    : s?.first_name ?? "Unknown Participant";
  const status = s?.status ?? "registered";
  const statusConfig = STATUS_MAP[status] ?? { label: status, classes: "bg-white/10 text-white/60 ring-white/10" };
  const org = s?.organization ?? "—";
  const dob = s?.dob ?? s?.date_of_birth ?? null;
  const subjectNumber = s?.subject_number ?? null;
  const registryId = s?.registry_id ?? null;

  const timelineEvents: TimelineEvent[] = [
    ...((consent as any)?.timeline ?? []),
    ...((evidence as any)?.timeline ?? []),
    ...((readiness as any)?.timeline ?? []),
    ...((stateHistory as any)?.timeline ?? []),
  ]
    .map((ev: any, idx: number) => ({
      id: String(ev?.id ?? `${ev?.kind ?? "event"}-${idx}`),
      kind: (ev?.kind ?? "state") as TimelineKind,
      occurred_at: String(ev?.occurred_at ?? ev?.created_at ?? new Date().toISOString()),
      label: String(ev?.label ?? ev?.type ?? "Event"),
      actor: ev?.actor ? String(ev.actor) : undefined,
      meta: ev?.meta ? String(ev.meta) : undefined,
    }))
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

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

  const handleTransition = async (to: string, reason: string) => {
    "use server";
    await transitionState(subjectId, to, reason);
  };

  return (
    <Shell>
      <div className="space-y-6">

        {/* Participant Identity Block */}
        <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Participant Profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {fullName}
              </h1>
              <p className="mt-1 text-sm text-white/55">
                {org.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusConfig.classes}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
              <div className="text-xs text-white/50">Subject Number</div>
              <div className="mt-1 font-mono text-lg font-semibold text-[#C8A84B]">
                {subjectNumber ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
              <div className="text-xs text-white/50">Date of Birth</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {dob ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
              <div className="text-xs text-white/50">Participant ID</div>
              <div className="mt-1 font-mono text-xs text-white/60 break-all">
                {subjectId}
              </div>
            </div>
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
              <div className="text-xs text-white/50">Registry ID</div>
              <div className="mt-1 font-mono text-sm font-semibold text-[#C8A84B] break-all">
                {registryId ?? "—"}
              </div>
            </div>
          </div>

          {registryId && (
            <div className="mt-4">
              <a
                href={`/verify?rid=${registryId}`}
                className="text-xs text-[#C8A84B] hover:underline"
              >
                Verify your readiness standing →
              </a>
            </div>
          )}
        </div>

        {/* Evaluator Actions — full width */}
        <StateTransitionPanel
          currentStatus={status}
          subjectId={subjectId}
          onTransition={handleTransition}
        />

        {/* Panels Grid */}
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

        {/* Unified Timeline */}
        <UnifiedTimeline events={timelineEvents} />

      </div>
    </Shell>
  );
