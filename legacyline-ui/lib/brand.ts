/**
 * BRAND — the single source of every user-facing product name.
 * ⟢ RENAME: change values here; nothing else in the UI hard-codes the name.
 * Repos, domains, cookies, storage keys and API hosts are deliberately NOT derived
 * from this (they stay brand-neutral / unchanged until the cutover plan lands).
 */
export const BRAND = {
  name: "Kamili",
  shortName: "Kamili",
  tagline: "Your readiness record",
  /** Swahili: "complete". Drives the completeness moment in My Record. */
  meaning: "kamili — complete",
  family: "A Yakini system",
  standard: "BRSA",
  engine: "FRARI",
  endorsement: "Standard: BRSA · Engine: FRARI",
  legalEntity: "Yakini",
  supportEmail: "",
} as const;

export const brandTitle = (page?: string) => (page ? `${page} · ${BRAND.name}` : `${BRAND.name} — ${BRAND.tagline}`);
