// One band table for the whole product (visual system §2.10, overhaul §6.4).
// "Not yet assessed" = no run. "Certified" is a state, never a band. No red for people.
export const BANDS = [
  { key: "pre", label: "Pre-readiness", min: 0, max: 34 },
  { key: "early", label: "Early", min: 35, max: 49 },
  { key: "developing", label: "Developing", min: 50, max: 64 },
  { key: "proficient", label: "Proficient", min: 65, max: 79 },
  { key: "ready", label: "Ready", min: 80, max: 100 },
] as const;

export type BandKey = (typeof BANDS)[number]["key"] | "none";

export function bandFor(score: number | null | undefined) {
  if (score === null || score === undefined || Number.isNaN(score)) return { key: "none" as const, label: "Not yet assessed", min: 0, max: 0 };
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return BANDS.find((b) => s >= b.min && s <= b.max) ?? BANDS[0];
}
