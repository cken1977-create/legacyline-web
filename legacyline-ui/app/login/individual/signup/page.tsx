import { redirect } from "next/navigation";

// Replaced by the single "Start your record" flow (no duplicate participant).
export default function LegacySignup() { redirect("/app/signup"); }
