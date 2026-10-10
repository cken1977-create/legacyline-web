import type { Metadata } from "next";
import ReadingRoom from "./ReadingRoom";
export const metadata: Metadata = { title: "Reading Room", robots: { index: false, follow: false } };
// Staff-only: renders the reviewer sign-in until a verified staff token exists;
// every data call is authorized server-side by legacyline-core.
export default function Page() { return <ReadingRoom />; }
