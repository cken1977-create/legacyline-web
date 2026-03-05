
export function ReadinessPanel({
  readiness,
  onRecompute,
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
