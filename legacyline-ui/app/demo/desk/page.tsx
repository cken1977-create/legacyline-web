import { notFound } from "next/navigation";
import ProgramDesk from "../../dashboard/ProgramDesk";
import { DEMO_CASES } from "../../../lib/demo";

const people = DEMO_CASES.map((c, i) => ({ id: c.id, subject_number: 101 + i, first_name: c.first_name, last_name: c.last_name, status: c.status, created_at: c.created_at, flagged: c.id === "ptc-demo-0003" }));
const counts = people.reduce<Record<string, number>>((a, p) => ({ ...a, [p.status]: (a[p.status] ?? 0) + 1 }), {});
export default function DemoDesk() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <ProgramDesk demo={{ summary: { org: { name: "Vizionz Sankofa (demo)", slug: "demo", created_at: "2026-09-01T00:00:00Z" }, total_participants: people.length, lifecycle_counts: counts, flagged_count: 1 }, people }} />;
}
