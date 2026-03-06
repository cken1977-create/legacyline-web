type ConsentTimelineEntry = {
  id?: string;
  occurred_at?: string;
  label?: string;
  actor?: string;
  meta?: string;
};

type Consent = {
  status?: string;
  granted_at?: string;
  revoked_at?: string;
  timeline?: ConsentTimelineEntry[];
};

type ConsentPanelProps = {
  consent: Consent;
  subjectId: string;
  grantAction: (formData: FormData) => Promise<void>;
  revokeAction: (formData: FormData) => Promise<void>;
};

export default function ConsentPanel({
  consent,
  subjectId,
  grantAction,
  revokeAction,
}: ConsentPanelProps) {
  const status = consent?.status ?? "not_granted";
  const timeline = consent?.timeline ?? [];

  return (
    <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="text-sm font-semibold text-white">Consent</div>

      <div className="mt-1 text-xs text-white/60">
        Consent status and lifecycle events.
      </div>

      <div className="mt-4 text-sm text-white/80">
        Status: <span className="font-medium">{status}</span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-4 flex gap-3">

        <form action={grantAction}>
          <input type="hidden" name="subjectId" value={subjectId} />

          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Grant Consent
          </button>
        </form>

        <form action={revokeAction}>
          <input type="hidden" name="subjectId" value={subjectId} />

          <button
            type="submit"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15"
          >
            Revoke Consent
          </button>
        </form>

      </div>

      {/* TIMELINE */}
      <div className="mt-5 space-y-2">

        {timeline.length === 0 && (
          <div className="text-xs text-white/60">
            No consent events yet.
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
                {entry.label ?? "Consent event"}
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
