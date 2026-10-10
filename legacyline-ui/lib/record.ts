import { AREAS, SLOTS, type Run, type Slot, compositeOf, ruleSets, slotPoints, rulePoints } from "./frari";

export type SlotState = Slot & { status: "missing" | "submitted"; points: number };

const filled = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== "";

/** Derive evidence slots from intake data + the latest FRARI run. Never invents "verified". */
export function deriveSlots(intake: Record<string, any> | null, run: Run | null): SlotState[] {
  const { passed } = ruleSets(run);
  const docs = intake?.docs_uploaded ?? {};
  return SLOTS.map((s) => {
    let on = s.rules.some((r) => passed.has(r));
    if (!on && intake) {
      if (s.key === "gov_id") on = !!docs.gov_id || filled(intake.gov_id_url);
      else if (s.key === "selfie") on = !!docs.selfie || filled(intake.selfie_url);
      else if (s.key === "bank_statement") on = !!docs.bank_statement || filled(intake.bank_statement_url);
      else if (s.key === "consent") on = intake.consent_status === "granted";
      else on = filled(intake[s.key] ?? intake.answers?.[s.key]);
    }
    return { ...s, status: on ? "submitted" : "missing", points: slotPoints(s) };
  });
}

export function summarize(intake: Record<string, any> | null, run: Run | null) {
  const slots = deriveSlots(intake, run);
  const onFile = slots.filter((s) => s.status !== "missing").length;
  const next = slots.filter((s) => s.status === "missing").sort((a, b) => b.points - a.points).slice(0, 3);
  const areas = AREAS.map((a) => {
    const of = slots.filter((s) => s.area === a.key);
    return { ...a, total: of.length, onFile: of.filter((s) => s.status !== "missing").length };
  });
  return { slots, onFile, total: slots.length, next, areas, score: compositeOf(run) };
}

export function pointsMeta(slot: Slot) {
  const parts = slot.rules.map((r) => ({ r, ...rulePoints(r) }));
  const total = parts.reduce((a, p) => a + p.total, 0);
  const areas = new Set(parts.flatMap((p) => Object.keys(p.domains))).size;
  return { total, areas, ruleIds: slot.rules };
}

export const STATUS_STEPS = [
  { key: "registered", label: "Started", plain: "Your record exists." },
  { key: "data_collecting", label: "Gathering", plain: "You're adding what's on file." },
  { key: "under_review", label: "In review", plain: "A certified reviewer is reading your record." },
  { key: "evaluated", label: "Reviewed", plain: "The review is done." },
  { key: "certified", label: "Certified", plain: "Sealed by the standard." },
];
