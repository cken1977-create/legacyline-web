export function ConsentPanel({
  consent,
  onGrant,
  onRevoke,
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
