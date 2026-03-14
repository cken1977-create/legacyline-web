// app/evaluator/components/EvaluatorHeader.tsx
"use client";

type Evaluator = {
  evaluator_id: string;
  full_name: string;
  email: string;
  organization: string;
  status: string;
  certified: boolean;
  certified_at: string | null;
};

type Props = {
  evaluator: Evaluator | null;
  activeView: "dashboard" | "queue" | "profile";
  onNav: (view: "dashboard" | "queue") => void;
};

export function EvaluatorHeader({ evaluator, activeView, onNav }: Props) {
  const initials = evaluator
    ? evaluator.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "—";

  const certLabel = evaluator?.certified
    ? "BRSA Certified Evaluator"
    : "Evaluator — Certification Pending";

  const standing = evaluator?.status ?? "unknown";
  const standingColor =
    standing === "active" || standing === "certified"
      ? "#34D399"
      : standing === "probationary"
      ? "#F59E0B"
      : "#F87171";

  return (
    <div
      style={{
        background: "#0B1C30",
        borderBottom: "1px solid rgba(200,168,75,0.2)",
        padding: "0 28px",
        display: "flex",
        alignItems: "stretch",
        position: "sticky",
        top: 0,
        zIndex: 100,
        minHeight: 56,
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingRight: 24,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          marginRight: 16,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: "linear-gradient(135deg, #C8A84B, #8A6E2F)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 900,
            color: "#0B1C30",
          }}
        >
          L
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#F4F6F9",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Legacyline
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#8A6E2F",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Evaluator Console
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 2, flex: 1 }}>
        {(["dashboard", "queue"] as const).map((view) => (
          <button
            key={view}
            onClick={() => onNav(view)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 14px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: activeView === view ? "#C8A84B" : "#8899AA",
              borderBottom:
                activeView === view
                  ? "2px solid #C8A84B"
                  : "2px solid transparent",
              transition: "all 0.15s",
              textTransform: "capitalize",
            }}
          >
            {view === "queue" ? "Decision Queue" : "Dashboard"}
          </button>
        ))}
      </div>

      {/* Evaluator identity */}
      {evaluator && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingLeft: 16,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#F4F6F9" }}>
              {evaluator.full_name}
            </div>
            <div style={{ fontSize: 10, color: "#8899AA" }}>{certLabel}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: standingColor,
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: standingColor,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {standing}
              </span>
            </div>
            <div style={{ fontSize: 9, color: "#8899AA" }}>
              {evaluator.organization}
            </div>
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1A3A5C, #1E3D5A)",
              border: "2px solid rgba(200,168,75,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "#C8A84B",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        </div>
      )}
    </div>
  );
            }
      
