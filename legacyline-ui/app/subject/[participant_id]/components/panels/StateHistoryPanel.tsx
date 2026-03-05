type StateHistoryEntry = {
  timestamp: string;
  from: string;
  to: string;
  actor: string;
  reason: string;
};

type StateHistoryPanelProps = {
  history: StateHistoryEntry[];
};

export function StateHistoryPanel({ history }: StateHistoryPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-white">State History</h2>

      {history.length === 0 ? (
        <p className="text-gray-500 text-sm">No state transitions recorded.</p>
      ) : (
        <div className="space-y-3">
          {history.map((entry, i) => (
            <div
              key={i}
              className="rounded border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300"
            >
              <div className="flex justify-between">
                <span className="font-medium text-white">
                  {entry.from} → {entry.to}
                </span>
                <span className="text-gray-400">{entry.timestamp}</span>
              </div>

              <div className="mt-1 text-gray-400">
                <p>
                  <span className="font-medium text-gray-300">Actor:</span>{" "}
                  {entry.actor}
                </p>
                <p>
                  <span className="font-medium text-gray-300">Reason:</span>{" "}
                  {entry.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
