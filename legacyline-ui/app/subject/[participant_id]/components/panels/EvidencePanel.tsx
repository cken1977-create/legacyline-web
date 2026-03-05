type EvidenceEvent = {
  timestamp: string;
  event: string;
};

type EvidencePanelProps = {
  events: EvidenceEvent[];
  onAddCheckIn: () => void;
};

export function EvidencePanel({
  events,
  onAddCheckIn,
}: EvidencePanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Evidence Events</h2>

      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">No evidence events yet.</p>
        ) : (
          events.map((entry, i) => (
            <div
              key={i}
              className="text-sm text-gray-300 border-l border-gray-600 pl-2"
            >
              <span className="text-gray-400">{entry.timestamp}</span> —{" "}
              {entry.event}
            </div>
          ))
        )}
      </div>

      <button
        onClick={onAddCheckIn}
        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
      >
        Add Check‑In
      </button>
    </div>
  );
}
