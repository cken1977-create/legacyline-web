import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Report from "../../report/Report";
import { DEMO_PERSON } from "../../../../lib/demo";

export const metadata: Metadata = { title: "Sample report", robots: { index: false, follow: false } };
export default function DemoReport() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <Report demo={DEMO_PERSON} />;
}
