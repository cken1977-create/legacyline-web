/** Single checkout config. PLACEHOLDER prices. No Stripe yet: set env link to enable. */
export const PRICING = [
  { id: "program", name: "Kamili for programs", price: "$X,XXX / program / yr", note: "Placeholder. Includes reviewer seats and participant records.",
    features: ["Participant records + reading room", "Rules-based readiness runs", "Audit-ready timeline"],
    envName: "STRIPE_LINK_KAMILI_PROGRAM", checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_LINK_KAMILI_PROGRAM ?? "" },
] as const;
