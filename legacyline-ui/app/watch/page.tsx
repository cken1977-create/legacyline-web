import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { demoPagesAllowed } from "../../lib/demo-mode";
import { CLIPS, FULL } from "../../lib/watch";
import WatchList from "./WatchList";

export const metadata: Metadata = {
  title: "Watch the demo",
  description: "Watch how Kamili works: one sample program, from the organization to the funder.",
  robots: { index: false, follow: false },
  openGraph: { title: "Watch the Kamili demo", description: "One sample program, start to finish, in eight minutes. Captions on.", images: [{ url: FULL.poster, width: 1280, height: 720 }], videos: [{ url: FULL.src, type: "video/mp4", width: 1920, height: 1080 }] },
  twitter: { card: "summary_large_image", images: [FULL.poster] },
};

export default function WatchPage() {
  if (!demoPagesAllowed()) notFound();
  return (
    <main className="ao-paper min-h-screen px-4 py-8 sm:px-5 sm:py-12">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p className="ao-eyebrow">Kamili demo · videos</p>
        <h1 className="ao-h1 mt-2" style={{ fontSize: "clamp(28px, 6vw, 40px)", lineHeight: 1.15 }}>Watch how Kamili works</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 680 }}>
          Press play. Nothing to download and no sign-in. The program, the scoring rules and the evaluator steps are the real
          Kamili program; the people, organizations and numbers are sample data.
        </p>
        <WatchList full={FULL} clips={CLIPS} />
        <section className="ao-card mt-12 p-5">
          <h2 className="ao-h2" style={{ fontSize: 18 }}>Want to try it yourself?</h2>
          <p className="ao-body-2 mt-1">The same sample program is open to click through. <Link className="ao-link" href="/demo">Open the demo</Link></p>
        </section>
      </div>
    </main>
  );
}
