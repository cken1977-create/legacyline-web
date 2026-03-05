import { TimelineEventItem } from "./TimelineEventItem";
import { TimelineEmptyState } from "./TimelineEmptyState";
import type { TimelineEvent } from "../../page";

type Props = {
  events: TimelineEvent[];
  className?: string;
};

export function UnifiedTimeline({ events, className = "" }: Props) {
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
    <section className={`relative overflow-hidden bg-black/85 ring-1 ring-white/10 ${className}`}>
      <div className="absolute inset-0 bg-[url('/images/timeline.jpg')] bg-cover bg-center opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/85 to-black/80" />

      <div className="relative p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-white/60">
          Unified ledger
        </div>

        <div className="mt-1 text-xs text-white/60">
          Consent, evidence, readiness, and state transitions in one chronological chain.
        </div>

        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto text-xs text-white/80">
          {events.length === 0 && <TimelineEmptyState />}

          {events.map((ev) => (
            <TimelineEventItem key={ev.id} ev={ev} kindLabel={kindLabel} kindColor={kindColor} />
          ))}
        </div>
      </div>
    </section>
  );
}
