type EvidenceEvent = {
  id?: string;
  occurred_at?: string;
  label?: string;
  actor?: string;
  meta?: string;
};

type EvidencePanelProps = {
  events: EvidenceEvent[];
  subjectId: string;
  addCheckInAction: (formData: FormData) => Promise<void>;
};

export default function EvidencePanel({
  events,
  subjectId,
  addCheckInAction,
}: EvidencePanelProps) {
  const timeline = events ?? [];

  return (
    <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="text-sm font-semibold text-white">Evidence</div>

      <div className="mt-1 text-xs text-white/60">
        Recorded behavioral evidence and check-ins.
      </div>

      <div className="mt-4 space-y-2">
        {timeline.length === 0 && (
          <div className="text-xs text-white/60">
            No evidence events yet.
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
                {entry.label ?? "Evidence event"}
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

      {/* SERVER ACTION BUTTON */}

      <div className="mt-4">
        <form action={addCheckInAction}>
          <input type="hidden" name="subjectId" value={subjectId} />

          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Add Check-In
          </button>
        </form>
      </div>
    </section>
  );
}
