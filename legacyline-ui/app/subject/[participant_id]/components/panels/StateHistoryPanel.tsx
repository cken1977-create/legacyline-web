export function StateHistoryPanel({ entries }) {
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
                  {e.from_state} <span className="text-white/45">→</span>{" "}
                  {e.to_state}
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
