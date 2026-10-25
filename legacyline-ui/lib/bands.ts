// Published BRSA bands (BRSA-RS-001): Green 70 and above, Yellow 40–69, below 40 Red.
// Same thresholds for people and organizations. "Not yet assessed" = no score.
// "Certified" is a lifecycle state, never a band.
export const BANDS = [
  { key: "red", label: "Red", min: 0, max: 39 },
  { key: "yellow", label: "Yellow", min: 40, max: 69 },
  { key: "green", label: "Green", min: 70, max: 100 },
] as const;

export type BandKey = (typeof BANDS)[number]["key"] | "none";

export function bandFor(score: number | null | undefined) {
  if (score === null || score === undefined || Number.isNaN(score)) return { key: "none" as const, label: "Not yet assessed", min: 0, max: 0 };
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return BANDS.find((b) => s >= b.min && s <= b.max) ?? BANDS[0];
}
