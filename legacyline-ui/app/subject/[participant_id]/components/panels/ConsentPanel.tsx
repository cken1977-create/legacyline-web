type ConsentTimelineEntry = {
  timestamp: string;
  event: string;
};

type Consent = {
  status: string;
  timeline: ConsentTimelineEntry[];
};

type ConsentPanelProps = {
  consent: Consent;
  onGrant: () => void;
  onRevoke: () => void;
};

export function ConsentPanel({
  consent,
  onGrant,
  onRevoke,
}: ConsentPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">Consent</h2>

      <div className="text-gray-300">
        <p className="mb-2">
          <span className="font-medium text-white">Status:</span>{" "}
          {consent.status}
        </p>

        <div className="space-y-1">
          <p className="font-medium text-white">Timeline:</p>
          {consent.timeline.length === 0 ? (
            <p className="text-gray-500 text-sm">No consent events yet.</p>
          ) : (
            consent.timeline.map((entry, i) => (
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

      <div className="flex gap-2 pt-2">
        <button
          onClick={onGrant}
          className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
        >
          Grant
        </button>

        <button
          onClick={onRevoke}
          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        >
          Revoke
        </button>
      </div>
    </div>
  );
}
