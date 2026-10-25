import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { demoPagesAllowed } from "../../../lib/demo-mode";
import { CLIPS, clipById } from "../../../lib/watch";

type Props = { params: Promise<{ clip: string }> };

export function generateStaticParams() {
  return CLIPS.map((c) => ({ clip: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = clipById((await params).clip);
  if (!c) return { title: "Watch the demo" };
  return {
    title: `${c.title} · Watch the demo`,
    description: c.sub,
    robots: { index: false, follow: false },
    openGraph: { title: `Kamili demo, part ${c.n}: ${c.title}`, description: c.sub, images: [{ url: c.poster, width: 1280, height: 720 }], videos: [{ url: c.src, type: "video/mp4", width: 1920, height: 1080 }] },
    twitter: { card: "summary_large_image", images: [c.poster] },
  };
}

export default async function ClipPage({ params }: Props) {
  if (!demoPagesAllowed()) notFound();
  const c = clipById((await params).clip);
  if (!c) notFound();
  const prev = CLIPS[c.n - 2];
  const next = CLIPS[c.n];
  return (
    <main className="ao-paper min-h-screen px-4 py-8 sm:px-5 sm:py-12">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p className="ao-eyebrow">Kamili demo · part {c.n} of 6 · {c.device}</p>
        <h1 className="ao-h1 mt-2" style={{ fontSize: "clamp(26px, 6vw, 38px)", lineHeight: 1.15 }}>{c.title}</h1>
        <p className="ao-body-2 mt-2" style={{ fontSize: 16 }}>{c.sub} <span className="ao-meta">· {c.duration} · captions on</span></p>
        <div className="mt-5" style={{ borderRadius: 12, overflow: "hidden", background: "#0F2236" }}>
          <video controls playsInline preload="metadata" poster={c.poster} style={{ display: "block", width: "100%", aspectRatio: "16 / 9", background: "#0F2236" }}>
            <source src={c.src} type="video/mp4" />
            Your browser can&apos;t play this video. <a href={c.src}>Open the video file</a>.
          </video>
        </div>
        <p className="ao-meta mt-3">Sample data: every person and number in this video is made up.</p>
        <nav aria-label="More parts" className="mt-6" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          {prev ? <Link className="ao-btn ao-btn-sm ao-btn-secondary" href={`/watch/${prev.id}`} style={{ minHeight: 40 }}>← Part {prev.n}: {prev.title}</Link> : <span />}
          {next ? <Link className="ao-btn ao-btn-sm ao-btn-secondary" href={`/watch/${next.id}`} style={{ minHeight: 40 }}>Part {next.n}: {next.title} →</Link> : <span />}
        </nav>
        <p className="ao-body-2 mt-8"><Link className="ao-link" href="/watch">Watch all six parts, or the full eight-minute demo</Link></p>
      </div>
    </main>
  );
}
