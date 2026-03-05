"use client";

import { useEffect, useMemo, useState } from "react";
import Shell from "../../_components/Shell";
import { api } from "../../../lib/api";

type Subject = {
  id: string;
  subject_number?: number;
  status?: string;
  created_at?: string;
  registry_id?: string;
};

type ConsentSnapshot = {
  status: "granted" | "revoked" | "none";
  scope?: string;
  terms_ref?: string;
  actor?: string;
  reason?: string;
  occurred_at?: string;
};

type ReadinessSnapshot = {
  readiness: number;
  computed_at: string;
  actor: string;
  reason?: string;
};

type EvidenceEvent = {
  id: string;
  type: string;
  payload: any;
  actor: string;
  reason?: string;
  occurred_at: string;
};

type StateHistoryEntry = {
  id: string;
  from_state: string;
  to_state: string;
  actor: string;
  reason?: string;
  occurred_at: string;
};

type TimelineEvent = {
  id: string;
  kind: "consent" | "evidence" | "readiness" | "state";
  label: string;
  occurred_at: string;
  actor?: string;
  meta?: string;
};

export default function SubjectPage({
  params,
}: {
  params: { participant_id: string };
}) {
  const participantId = params.participant_id;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [consent, setConsent] = useState<ConsentSnapshot | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSnapshot | null>(null);
  const [evidence, setEvidence] = useState<EvidenceEvent[]>([]);
  const [stateHistory, setStateHistory] = useState<StateHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!participantId || participantId === "undefined") {
        setError(
          "Missing participant_id in URL. Go to Intake and create a subject first."
        );
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);

      try {
        const [
          subjectRes,
          consentRes,
          readinessRes,
          evidenceRes,
          stateRes,
        ] = await Promise.all([
          api<Subject>(`/participants/${participantId}`),
          api<ConsentSnapshot | {}>(`/participants/${participantId}/consent`),
          api<ReadinessSnapshot | {}>(
            `/participants/${participantId}/readiness/latest`
          ),
          api<{ events: EvidenceEvent[] }>(
            `/participants/${participantId}/evidence`
          ),
          api<{ history: StateHistoryEntry[] }>(
            `/participants/${participantId}/state/history`
          ),
        ]);

        if (!alive) return;

        setSubject(subjectRes || null);

        // Consent: if empty object, treat as none
        if (consentRes && Object.keys(consentRes).length > 0) {
          setConsent({
            status: (consentRes as any).status ?? "granted",
            scope: (consentRes as any).scope,
            terms_ref: (consentRes as any).terms_ref,
            actor: (consentRes as any).actor,
            reason: (consentRes as any).reason,
            occurred_at: (consentRes as any).occurred_at,
          });
        } else {
          setConsent({ status: "none" });
        }

        // Readiness: if empty, no snapshot yet
        if (readinessRes && Object.keys(readinessRes).length > 0) {
          setReadiness(readinessRes as ReadinessSnapshot);
        } else {
          setReadiness(null);
        }

        setEvidence(evidenceRes?.events ?? []);
        setStateHistory(stateRes?.history ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load subject");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [participantId]);

  const timeline: TimelineEvent[] = useMemo(() => {
    const items: TimelineEvent[] = [];

    if (consent && consent.occurred_at) {
      items.push({
        id: `consent-${consent.occurred_at}`,
        kind: "consent",
        label:
          consent.status === "granted"
            ? "Consent granted"
            : consent.status === "revoked"
            ? "Consent revoked"
            : "Consent status updated",
        occurred_at: consent.occurred_at,
        actor: consent.actor,
        meta: consent.scope || consent.terms_ref,
      });
    }

    if (readiness) {
      items.push({
        id: `readiness-${readiness.computed_at}`,
        kind: "readiness",
        label: `Readiness computed: ${readiness.readiness}`,
        occurred_at: readiness.computed_at,
        actor: readiness.actor,
        meta: readiness.reason,
      });
    }

    evidence.forEach((ev) => {
      items.push({
        id: `evidence-${ev.id}`,
        kind: "evidence",
        label: `Evidence: ${ev.type}`,
        occurred_at: ev.occurred_at,
        actor: ev.actor,
        meta: ev.reason,
      });
    });

    stateHistory.forEach((st) => {
      items.push({
        id: `state-${st.id}`,
        kind: "state",
        label: `${st.from_state} → ${st.to_state}`,
        occurred_at: st.occurred_at,
        actor: st.actor,
        meta: st.reason,
      });
    });

    return items.sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );
  }, [consent, readiness, evidence, stateHistory]);

  async function recomputeReadiness() {
    try {
      const snap = await api<ReadinessSnapshot>(
        `/participants/${participantId}/readiness/compute`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );
      setReadiness(snap);
    } catch (e: any) {
      setError(e?.message || "Failed to recompute readiness");
    }
  }

  async function grantConsent() {
    try {
      const data = await api<any>(`/participants/${participantId}/consent`, {
        method: "POST",
        body: JSON.stringify({
          scope: "behavioral_readiness_v1",
          terms: "brsa-consent-v1",
          reason: "initial enrollment",
        }),
      });

      setConsent({
        status: "granted",
        scope: data.scope,
        terms_ref: data.terms_ref,
        actor: data.actor,
        reason: data.reason,
        occurred_at: data.occurred_at,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to grant consent");
    }
  }

  async function revokeConsent() {
    try {
      const data = await api<any>(`/participants/${participantId}/consent`, {
        method: "DELETE",
        body: JSON.stringify({ reason: "participant request" }),
      });

      setConsent({
        status: "revoked",
        scope: "",
        terms_ref: "",
        actor: data.actor,
        reason: data.reason,
        occurred_at: data.occurred_at,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to revoke consent");
    }
  }

  async function addCheckInEvidence() {
    try {
      await api<any>(`/participants/${participantId}/evidence`, {
        method: "POST",
        body: JSON.stringify({
          type: "check_in",
          payload: { channel: "phone", notes: "Routine check-in" },
          reason: "scheduled_check_in",
        }),
      });

      const list = await api<{ events: EvidenceEvent[] }>(
        `/participants/${participantId}/evidence`
      );
      setEvidence(list.events ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to add evidence");
    }
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        {/* Identity header with cinematic feel */}
        <section className="relative overflow-hidden rounded-2xl bg-black">
          <div className="absolute inset-0 bg-[url('/images/subject-header.jpg')] bg-cover bg-center opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60" />
          <div className="relative p-6 md:p-7">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Subject Readiness Profile
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {subject ? subject.id : "Subject"}
            </h2>

            <div className="mt-4 grid gap-4 text-sm text-white/80 md:grid-cols-3">
              <div>
                <div className="text-xs text-white/55">Subject #</div>
                <div className="mt-1 text-base">
                  {subject?.subject_number ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/55">Status</div>
                <div className="mt-1 text-base">
                  {subject?.status ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/55">Registry ID</div>
                <div className="mt-1 text-base">
                  {subject?.registry_id ?? "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 text-xs text-white/60 md:grid-cols-2">
              <div>
                <span className="text-white/45">Created:</span>{" "}
                {subject?.created_at ?? "—"}
              </div>
              {readiness && (
                <div>
                  <span className="text-white/45">Latest readiness:</span>{" "}
                  <span className="font-semibold text-white">
                    {readiness.readiness}
                  </span>{" "}
                  <span className="text-white/50">
                    (as of{" "}
                    {new Date(readiness.computed_at).toLocaleString()})
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        {loading && !error && (
          <div className="mt-4 text-sm text-white/70">
            Loading subject readiness…
          </div>
        )}

        {!loading && !subject && !error && (
          <div className="mt-4 text-sm text-white/70">
            Subject not found. Confirm the participant_id or create a new
            subject from Intake.
          </div>
        )}

        {subject && (
          <>
            {/* Instrument grid */}
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <ConsentPanel
                consent={consent}
                onGrant={grantConsent}
                onRevoke={revokeConsent}
              />
              <ReadinessPanel
                readiness={readiness}
                onRecompute={recomputeReadiness}
              />
              <EvidencePanel
                events={evidence}
                onAddCheckIn={addCheckInEvidence}
              />
              <StateHistoryPanel entries={stateHistory} />
            </div>

            {/* Unified timeline */}
            <UnifiedTimeline events={timeline} className="mt-7" />
          </>
        )}
      </div>
    </Shell>
  );
}

function ConsentPanel({
  consent,
  onGrant,
  onRevoke,
}: {
  consent: ConsentSnapshot | null;
  onGrant: () => Promise<void> | void;
  onRevoke: () => Promise<void> | void;
}) {
  const statusLabel =
    consent?.status === "granted"
      ? "Consent granted"
      : consent?.status === "revoked"
      ? "Consent revoked"
      : "No consent on record";

  const statusColor =
    consent?.status === "granted"
      ? "bg-emerald-400/15 text-emerald-200 ring-emerald-400/30"
      : consent?.status === "revoked"
      ? "bg-red-400/15 text-red-200 ring-red-400/30"
      : "bg-white/5 text-white/70 ring-white/15";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-black/80 ring-1 ring-white/10">
      <div className="absolute inset-0 bg-[url('/images/consent.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/80 to-black/75" />
      <div className="relative p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-white/60">
          Consent
        </div>
        <div
          className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusColor}`}
        >
          {statusLabel}
        </div>

        <div className="mt-4 space-y-1 text-xs text-white/65">
          <div>
            <span className="text-white/45">Scope:</span>{" "}
            {consent?.scope || "—"}
          </div>
          <div>
            <span className="text-white/45">Terms:</span>{" "}
            {consent?.terms_ref || "—"}
          </div>
          {consent?.occurred_at && (
            <div>
              <span className="text-white/45">Last change:</span>{" "}
              {new Date(consent.occurred_at).toLocaleString()}
            </div>
          )}
          {consent?.actor && (
            <div>
              <span className="text-white/45">Actor:</span> {consent.actor}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <button
            onClick={onGrant}
            className="rounded-xl bg-white px-3 py-2 font-semibold text-black hover:bg-white/90"
          >
            Grant consent
          </button>
          <button
            onClick={onRevoke}
            className="rounded-xl bg-white/10 px-3 py-2 font-semibold text-white hover:bg-white/15"
          >
            Revoke consent
          </button>
        </div>
      </div>
    </section>
  );
}

function ReadinessPanel({
  readiness,
  onRecompute,
}: {
  readiness: ReadinessSnapshot | null;
  onRecompute: () => Promise<void> | void;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-black/80 ring-1 ring-white/10">
      <div className="absolute inset-0 bg-[url('/images/readiness.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/80 to-black/75" />
      <div className="relative p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-white/60">
          Readiness
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-white/55">Current score</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">
              {readiness ? readiness.readiness : "—"}
            </div>
          </div>
          <button
            onClick={onRecompute}
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90"
          >
            Recompute
          </button>
        </div>

        <div className="mt-4 space-y-1 text-xs text-white/65">
          {readiness ? (
            <>
              <div>
                <span className="text-white/45">Computed at:</span>{" "}
                {new Date(readiness.computed_at).toLocaleString()}
              </div>
              <div>
                <span className="text-white/45">Actor:</span>{" "}
                {readiness.actor}
              </div>
              {readiness.reason && (
                <div>
                  <span className="text-white/45">Reason:</span>{" "}
                  {readiness.reason}
                </div>
              )}
            </>
          ) : (
            <div>No readiness snapshot computed yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function EvidencePanel({
  events,
  onAddCheckIn,
}: {
  events: EvidenceEvent[];
  onAddCheckIn: () => Promise<void> | void;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-black/80 ring-1 ring-white/10">
      <div className="absolute inset-0 bg-[url('/images/evidence.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/80 to-black/75" />
      <div className="relative p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Evidence
            </div>
            <div className="mt-1 text-xs text-white/60">
              Behavioral and contextual signals over time.
            </div>
          </div>
          <button
            onClick={onAddCheckIn}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
          >
            Add check-in
          </button>
        </div>

        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto text-xs text-white/75">
          {events.length === 0 && (
            <div className="text-white/60">
              No evidence events recorded yet.
            </div>
          )}
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                  {ev.type}
                </div>
                <div className="text-[11px] text-white/45">
                  {new Date(ev.occurred_at).toLocaleString()}
                </div>
              </div>
              <div className="mt-1 text-[11px] text-white/65">
                Actor: {ev.actor}
              </div>
              {ev.reason && (
                <div className="mt-1 text-[11px] text-white/60">
                  Reason: {ev.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StateHistoryPanel({ entries }: { entries: StateHistoryEntry[] }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-black/80 ring-1 ring-white/10">
      <div className="absolute inset-0 bg-[url('/images/state.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/80 to-black/75" />
      <div className="relative p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-white/60">
          State transitions
        </div>
        <div className="mt-1 text-xs text-white/60">
          Deterministic changes in subject state over time.
        </div>

        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto text-xs text-white/75">
          {entries.length === 0 && (
            <div className="text-white/60">
              No state transitions recorded yet.
            </div>
          )}
          {entries.map((e) => (
            <div
              key={e.id}
              className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px]">
                  {e.from_state}{" "}
                  <span className="text-white/45">→</span> {e.to_state}
                </div>
                <div className="text-[11px] text-white/45">
                  {new Date(e.occurred_at).toLocaleString()}
                </div>
              </div>
              <div className="mt-1 text-[11px] text-white/65">
                Actor: {e.actor}
              </div>
              {e.reason && (
                <div className="mt-1 text-[11px] text-white/60">
                  Reason: {e.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UnifiedTimeline({
  events,
  className = "",
}: {
  events: TimelineEvent[];
  className?: string;
}) {
  const kindLabel: Record<TimelineEvent["kind"], string> = {
    consent: "Consent",
    evidence: "Evidence",
    readiness: "Readiness",
    state: "State",
  };

  const kindColor: Record<TimelineEvent["kind"], string> = {
    consent: "bg-emerald-400/20 text-emerald-100",
    evidence: "bg-sky-400/20 text-sky-100",
    readiness: "bg-amber-400/20 text-amber-100",
    state: "bg-purple-400/20 text-purple-100",
  };

  return (
    <section
      className={relative overflow-hidden rounded-2xl bg-black/85 ring-1 ring-white/10 ${className}}
    >
      <div className="absolute inset-0 bg-[url('/images/timeline.jpg')] bg-cover bg-center opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/85 to-black/80" />
      <div className="relative p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-white/60">
          Unified ledger
        </div>
        <div className="mt-1 text-xs text-white/60">
          Consent, evidence, readiness, and state transitions in one
          chronological chain.
        </div>

        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto text-xs text-white/80">
          {events.length === 0 && (
            <div className="text-white/60">
              No events recorded yet. Once consent, evidence, readiness, or
              state changes occur, they will appear here.
            </div>
          )}

          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10"
            >
              <div
                className={mt-0.5 inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[10px] font-semibold ${kindColor[ev.kind]}}
              >
                {kindLabel[ev.kind]}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[11px] font-medium">{ev.label}</div>
                <div className="text-[11px] text-white/55">
                  {new Date(ev.occurred_at).toLocaleString()}
                  {ev.actor && (
                    <>
                      {" "}
                      • <span className="text-white/65">Actor:</span>{" "}
                      {ev.actor}
                    </>
                  )}
                </div>
                {ev.meta && (
                  <div className="text-[11px] text-white/60">{ev.meta}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`
