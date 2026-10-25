import { notFound } from "next/navigation";
import ProgramDesk from "../../dashboard/ProgramDesk";
import { DEMO_DESK_PEOPLE, DEMO_ORG, DEMO_TODAY_ISO } from "../../../lib/demo";

const people = DEMO_DESK_PEOPLE;
const counts = people.reduce<Record<string, number>>((a, p) => ({ ...a, [p.status]: (a[p.status] ?? 0) + 1 }), {});
export default function DemoDesk() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <ProgramDesk demo={{ summary: { org: { name: DEMO_ORG.name, slug: "demo", created_at: "2026-04-27T16:00:00Z" }, total_participants: people.length, lifecycle_counts: counts, flagged_count: people.filter((p) => p.flagged).length }, people, today: DEMO_TODAY_ISO }} />;
}
