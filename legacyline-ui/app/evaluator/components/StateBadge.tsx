// app/evaluator/components/StateBadge.tsx

export type ParticipantState =
  | "registered"
  | "data_collecting"
  | "under_review"
  | "evaluated"
  | "certified"
  | "revoked";

const STATE_CONFIG: Record<
  ParticipantState,
  { label: string; color: string; bg: string; ring: string }
> = {
  registered:      { label: "Registered",      color: "#8899AA", bg: "rgba(136,153,170,0.12)", ring: "rgba(136,153,170,0.25)" },
  data_collecting: { label: "Data Collecting",  color: "#60A5FA", bg: "rgba(96,165,250,0.12)",  ring: "rgba(96,165,250,0.25)"  },
  under_review:    { label: "Under Review",     color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  ring: "rgba(245,158,11,0.25)"  },
  evaluated:       { label: "Evaluated",        color: "#2DD4BF", bg: "rgba(45,212,191,0.12)",  ring: "rgba(45,212,191,0.25)"  },
  certified:       { label: "Certified",        color: "#34D399", bg: "rgba(52,211,153,0.12)",  ring: "rgba(52,211,153,0.25)"  },
  revoked:         { label: "Revoked",          color: "#F87171", bg: "rgba(248,113,113,0.12)", ring: "rgba(248,113,113,0.25)" },
};

export function StateBadge({
  state,
  large = false,
}: {
  state: string;
  large?: boolean;
}) {
  const cfg = STATE_CONFIG[state as ParticipantState] ?? STATE_CONFIG.registered;
  return (
    <span
      style={{
        display: "inline-block",
        padding: large ? "5px 14px" : "3px 9px",
        borderRadius: 4,
        fontSize: large ? 12 : 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: cfg.color,
        background: cfg.bg,
        boxShadow: `0 0 0 1px ${cfg.ring}`,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
