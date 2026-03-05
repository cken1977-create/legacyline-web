type StateHistoryEntry = {
  id?: string;
  from_state?: string;
  to_state?: string;
  occurred_at?: string;
  created_at?: string;
  actor?: string;
  note?: string;
};

type StateHistoryPanelProps = {
  entries: StateHistoryEntry[];
};

export function StateHistoryPanel({ entries }: StateHistoryPanelProps) {
  return (
    <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="text-sm font-semibold text-white">State History</div>
      <div className="mt-2 text-xs text-white/60">
        Deterministic state transitions recorded by the kernel.
      </div>

      <div className="mt-4 space-y-2">
        {entries.length === 0 && (
          <div className="text-xs text-white/60">No state transitions yet.</div>
        )}

        {entries.map((e, i) => (
          <div key={e.id ?? i} className="rounded-xl bg-black/30 p-3 ring-1 ring-white/10">
            <div className="text-[11px] text-white/80">
              {(e.from_state || "—")} → {(e.to_state || "—")}
            </div>

            <div className="mt-1 text-[11px] text-white/55">
              {new Date(e.occurred_at || e.created_at || Date.now()).toLocaleString()}
              {e.actor ? (
                <>
                  {" "}
                  • <span className="text-white/65">Actor:</span> {e.actor}
                </>
              ) : null}
            </div>

            {e.note ? <div className="mt-1 text-[11px] text-white/60">{e.note}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
