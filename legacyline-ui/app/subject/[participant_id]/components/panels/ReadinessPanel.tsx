type ReadinessTimelineEntry = {
  id?: string;
  occurred_at?: string;
  label?: string;
  actor?: string;
  meta?: string;
};

type Readiness = {
  readiness?: number | null;
  timeline?: ReadinessTimelineEntry[];
};

type ReadinessPanelProps = {
  readiness: Readiness;
  subjectId: string;
  recomputeAction: (formData: FormData) => Promise<void>;
};

export default function ReadinessPanel({
  readiness,
  subjectId,
  recomputeAction,
}: ReadinessPanelProps) {
  const score = readiness?.readiness ?? null;
  const timeline = readiness?.timeline ?? [];

  return (
    <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="text-sm font-semibold text-white">Readiness</div>

      <div className="mt-1 text-xs text-white/60">
        Computed readiness state and audit trail.
      </div>

      <div className="mt-4 text-sm text-white/80">
        Score:{" "}
        <span className="font-medium">
          {score === null ? "Not computed" : score}
        </span>
      </div>

      <div className="mt-4">
        <form action={recomputeAction}>
          <input type="hidden" name="subjectId" value={subjectId} />

          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Recompute Readiness
          </button>
        </form>
      </div>

      <div className="mt-5 space-y-2">
        {timeline.length === 0 && (
          <div className="text-xs text-white/60">
            No readiness events yet.
          </div>
        )}

        {timeline.map((entry, idx) => {
          const occurred =
            entry?.occurred_at ?? new Date().toISOString();

          return (
            <div
              key={entry.id ?? `${occurred}-${idx}`}
              className="rounded-xl bg-black/30 p-3 ring-1 ring-white/10"
            >
              <div className="text-[11px] font-medium text-white">
                {entry.label ?? "Readiness event"}
              </div>

              <div className="mt-1 text-[11px] text-white/55">
                {new Date(occurred).toLocaleString()}

                {entry.actor && (
                  <>
                    {" "}
                    • <span className="text-white/65">Actor:</span>{" "}
                    {entry.actor}
                  </>
                )}
              </div>

              {entry.meta && (
                <div className="mt-1 text-[11px] text-white/60">
                  {entry.meta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
