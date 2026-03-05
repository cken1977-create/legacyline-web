export function EvidencePanel({
  events,
  onAddCheckIn,
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
