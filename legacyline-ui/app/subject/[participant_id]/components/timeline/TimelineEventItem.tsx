import { TimelineEventBadge } from "./TimelineEventBadge";

export function TimelineEventItem({
  ev,
  kindLabel,
  kindColor,
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <TimelineEventBadge
        label={kindLabel[ev.kind]}
        color={kindColor[ev.kind]}
      />

      <div className="flex-1 space-y-1">
        <div className="text-[11px] font-medium">{ev.label}</div>

        <div className="text-[11px] text-white/55">
          {new Date(ev.occurred_at).toLocaleString()}
          {ev.actor && (
            <>
              {" "}
              • <span className="text-white/65">Actor:</span> {ev.actor}
            </>
          )}
        </div>

        {ev.meta && (
          <div className="text-[11px] text-white/60">{ev.meta}</div>
        )}
      </div>
    </div>
  );
}
