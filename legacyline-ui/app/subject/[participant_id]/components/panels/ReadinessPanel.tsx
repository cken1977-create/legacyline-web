type ReadinessTimelineEntry = {
  id?: string;
  occurred_at?: string;
  label?: string;
  actor?: string;
  meta?: string;
};

type Readiness = {
  readiness?: number | null;
  trajectory?: string | null;
  ruleset?: string | null;
  computed_at?: string | null;
  timeline?: ReadinessTimelineEntry[];
};

type ReadinessPanelProps = {
  readiness: Readiness;
  subjectId: string;
  recomputeAction: (formData: FormData) => Promise<void>;
};

function ScoreMeter({ score }: { score: number }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const color =
    pct >= 75 ? "bg-emerald-400" :
    pct >= 50 ? "bg-yellow-400" :
    pct >= 25 ? "bg-orange-400" : "bg-red-400";

  const label =
    pct >= 75 ? "Strong" :
    pct >= 50 ? "Developing" :
    pct >= 25 ? "Early Stage" : "Needs Support";

  return (
    <div className="mt-4">
      <div className="flex items-end justify-between mb-1.5">
        <span className="text-xs text-white/60">Readiness Score</span>
        <span className="text-lg font-semibold text-[#C8A84B]">{pct}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-white/50">{label}</div>
    </div>
  );
}

export default function ReadinessPanel({
  readiness,
  subjectId,
  recomputeAction,
}: ReadinessPanelProps) {
  const score = readiness?.readiness ?? null;
  const trajectory = readiness?.trajectory ?? null;
  const computedAt = readiness?.computed_at ?? null;
  const timeline = readiness?.timeline ?? [];

  return (
    <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="text-sm font-semibold text-white">Readiness</div>
      <div className="mt-1 text-xs text-white/60">
        Computed readiness state and audit trail.
      </div>

      {score === null ? (
        <div className="mt-4 text-sm text-white/50">
          No readiness score computed yet.
        </div>
      ) : (
        <ScoreMeter score={score} />
      )}

      {trajectory && (
        <div className="mt-2 text-xs text-white/50">
          Trajectory: <span className="text-white/80 capitalize">{trajectory}</span>
        </div>
      )}

      {computedAt && (
        <div className="mt-1 text-xs text-white/40">
          Last computed: {new Date(computedAt).toLocaleString()}
        </div>
      )}

      <div className="mt-4">
        <form action={recomputeAction}>
          <input type="hidden" name="subjectId" value={subjectId} />
          <button
            type="submit"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 transition-colors"
          >
            Recompute Score
          </button>
        </form>
      </div>

      <div className="mt-5 space-y-2">
        {timeline.length === 0 && (
          <div className="text-xs text-white/40">No readiness events yet.</div>
        )}
        {timeline.map((entry, idx) => {
          const occurred = entry?.occurred_at ?? new Date().toISOString();
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
                  <> • <span className="text-white/65">Actor:</span> {entry.actor}</>
                )}
              </div>
              {entry.meta && (
                <div className="mt-1 text-[11px] text-white/60">{entry.meta}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
