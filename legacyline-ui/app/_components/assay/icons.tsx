// 1.5px line icons (Lucide-style geometry, drawn inline — no emoji, no icon dependency).
import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });
export const IconRecord = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 3h9l3 3v15H6z" /><path d="M9 9h6M9 13h6M9 17h4" /></svg>);
export const IconShelf = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h4M7 17h4" /></svg>);
export const IconShare = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>);
export const IconUser = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>);
export const IconUpload = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 20h16" /></svg>);
export const IconCheck = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const IconCircle = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="7" /></svg>);
export const IconDash = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 12h10" /></svg>);
export const IconX = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconRefresh = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>);
export const IconChevron = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m9 6 6 6-6 6" /></svg>);
export const IconArrowRight = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconLock = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
export const IconCopy = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>);
export const IconLogout = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></svg>);
export const IconQueue = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>);
export const IconBook = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></svg>);
export const IconSeal = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="10" r="6" /><path d="m9 15-2 6 5-2 5 2-2-6" /></svg>);
export const IconSettings = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></svg>);
export const IconSearch = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconClock = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>);
export const IconFlag = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 21V4h11l-1.5 4L16 12H5" /></svg>);
export const IconEye = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);
export const IconShield = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>);
/** Tier glyphs ◯ ▢ △ — never colored by status */
export const TierGlyph = ({ tier, size = 16 }: { tier: "individual" | "organization" | "institution"; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="var(--ink-2)" strokeWidth={1.5} role="img" aria-label={tier === "individual" ? "Individual" : tier === "organization" ? "Organization" : "Institution"}>
    {tier === "individual" && <circle cx="8" cy="8" r="6" />}
    {tier === "organization" && <rect x="2.5" y="2.5" width="11" height="11" rx="1" />}
    {tier === "institution" && <path d="M8 2.5 14 13.5H2z" />}
  </svg>
);
