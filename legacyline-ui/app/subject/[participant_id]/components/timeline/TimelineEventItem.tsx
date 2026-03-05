import { TimelineEventBadge } from "./TimelineEventBadge";

type TimelineEvent = {
  kind: string;
  label?: string;
  occurred_at: string;
  actor?: string;
  meta?: string;
};

type TimelineEventItemProps = {
  ev: TimelineEvent;
  kindLabel: Record<string, string>;
  kindColor: Record<string, string>;
};

export function TimelineEventItem({ ev, kindLabel, kindColor }: TimelineEventItemProps) {
  const label = kindLabel?.[ev.kind] ?? ev.kind;
  const color = kindColor?.[ev.kind] ?? "bg-white/10 text-white";

  return (
    <div className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <TimelineEventBadge label={label} color={color} />

      <div className="flex-1 space-y-1">
        <div className="text-[11px] font-medium">{ev.label ?? label}</div>

        <div className="text-[11px] text-white/55">
          {new Date(ev.occurred_at).toLocaleString()}
          {ev.actor && (
            <>
              {" "}
              • <span className="text-white/65">Actor:</span> {ev.actor}
            </>
          )}
        </div>

        {ev.meta && <div className="text-[11px] text-white/60">{ev.meta}</div>}
      </div>
    </div>
  );
}
