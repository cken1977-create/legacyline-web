import { notFound } from "next/navigation";
import OurRecord from "../../app/org/OurRecord";
export default function DemoOrg() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <OurRecord demo={{ org_name: "Riverside Community Partners (demo)", org_slug: "demo", registered: true, obr_subject: { id: "obr-demo-01", name: "Riverside Community Partners (demo)", status: "data_collecting", city: "Albuquerque", state: "NM", legal_structure: "nonprofit_501c3", founded_date: "2014", created_at: "2026-09-30T16:00:00Z" }, intake_status: "submitted", intake_submitted_at: "2026-10-02T16:00:00Z", eval_status: "", last_assessed: null }} />;
}
