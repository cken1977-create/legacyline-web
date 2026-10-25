import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ObrRating from "../../_components/program/ObrRating";
import OBROversight from "../../_components/program/OBROversight";
import { DEMO_OBR_OVERSIGHT, DEMO_OBR_PASSED, DEMO_ORG, DEMO_ORG_RENEWAL } from "../../../lib/demo";
import { demoPagesAllowed } from "../../../lib/demo-mode";

export const metadata: Metadata = { title: "Organization review (staff, sample)", robots: { index: false, follow: false } };

// Staff view of an organization rating: computed scores (read-only) and the oversight controls.
// Never served on production. Actions here are added to the on-screen log only.
export default function DemoOrgReview() {
  if (!demoPagesAllowed()) notFound();
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p className="ao-eyebrow">Organization review · staff · sample</p>
        <h1 className="ao-h1 mt-2">{DEMO_ORG.name}</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 700 }}>The scores below were computed by the published rules from the evidence J. Okafor verified. As the overseer, you can flag, pause or send back, each with a written reason. There is no box to type a score.</p>
        <ObrRating passed={DEMO_OBR_PASSED} assessedOn={DEMO_ORG.ratedOn} expiresOn={DEMO_ORG_RENEWAL.expiresOn} renewalOpens={DEMO_ORG_RENEWAL.renewalOpens} />
        <div className="ao-card mt-6 p-5">
          <OBROversight obrSubjectId="obr-demo-01" demo={DEMO_OBR_OVERSIGHT} />
        </div>
      </div>
    </main>
  );
}
