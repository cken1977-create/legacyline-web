import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Report from "../../report/Report";
import { DEMO_PERSON } from "../../../../lib/demo";
import { demoPagesAllowed } from "../../../../lib/demo-mode";

export const metadata: Metadata = { title: "Sample report", robots: { index: false, follow: false } };
export default function DemoReport() {
  if (!demoPagesAllowed()) notFound();
  return <Report demo={DEMO_PERSON} />;
}
