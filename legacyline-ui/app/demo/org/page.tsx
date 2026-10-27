import { notFound } from "next/navigation";
import OurRecord from "../../app/org/OurRecord";
import ObrRating from "../../_components/program/ObrRating";
import { DEMO_OBR_OVERSIGHT, DEMO_OBR_PASSED, DEMO_ORG, DEMO_ORG_RENEWAL } from "../../../lib/demo";
import { obrScore } from "../../../lib/program";
import { demoPagesAllowed } from "../../../lib/demo-mode";

export default function DemoOrg() {
  if (!demoPagesAllowed()) notFound();
  return <OurRecord
    score={obrScore(DEMO_OBR_PASSED).composite}
    demo={{ org_name: DEMO_ORG.name, org_slug: DEMO_ORG.slug, registered: true, obr_subject: { id: "obr-demo-01", name: DEMO_ORG.name, status: "evaluated", city: "Albuquerque", state: "NM", legal_structure: "nonprofit_501c3", founded_date: "2014", created_at: "2026-04-27T16:00:00Z" }, intake_status: "submitted", intake_submitted_at: "2026-10-02T16:00:00Z", eval_status: "submitted", last_assessed: DEMO_ORG.ratedAt }}
    extra={<ObrRating passed={DEMO_OBR_PASSED} assessedOn={DEMO_ORG.ratedOn} expiresOn={DEMO_ORG_RENEWAL.expiresOn} renewalOpens={DEMO_ORG_RENEWAL.renewalOpens} log={DEMO_OBR_OVERSIGHT} />}
  />;
}
