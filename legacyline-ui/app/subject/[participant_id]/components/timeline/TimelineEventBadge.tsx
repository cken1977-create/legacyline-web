export function TimelineEventBadge({ label, color }) {
  return (
    <div
      className={`mt-0.5 inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[10px] font-semibold ${color}`}
    >
      {label}
    </div>
  );
}
