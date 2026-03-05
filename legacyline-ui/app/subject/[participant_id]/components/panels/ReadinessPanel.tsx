type ReadinessTimelineEntry = {
  timestamp: string;
  event: string;
};

type Readiness = {
  readiness: number | null;
  timeline: ReadinessTimelineEntry[];
};

type ReadinessPanelProps = {
  readiness: Readiness;
  onRecompute: () => void;
};

export function ReadinessPanel({
  readiness,
  onRecompute,
}: ReadinessPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Readiness</h2>

      <div className="text-gray-300">
        <p className="mb-2">
          <span className="font-medium text-white">Score:</span>{" "}
          {readiness.readiness === null ? "Not computed" : readiness.readiness}
        </p>

        <div className="space-y-1">
          <p className="font-medium text-white">Timeline:</p>
          {readiness.timeline.length === 0 ? (
            <p className="text-gray-500 text-sm">No readiness events yet.</p>
          ) : (
            readiness.timeline.map((entry, i) => (
              <div
                key={i}
                className="text-sm text-gray-400 border-l border-gray-600 pl-2"
              >
                <span className="text-gray-300">{entry.timestamp}</span> —{" "}
                {entry.event}
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={onRecompute}
        className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700"
      >
        Recompute Readiness
      </button>
    </div>
  );
}
