"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Clip } from "../../lib/watch";

/** Big play-through on top, the six parts below. Each part has its own link. */
export default function WatchList({ full, clips }: { full: { title: string; sub: string; duration: string; src: string; poster: string }; clips: Clip[] }) {
  const fullRef = useRef<HTMLVideoElement>(null);
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const read = () => setHash(window.location.hash.replace("#", "").toLowerCase());
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ block: "start" });
  }, [hash]);

  const jump = (t: number) => {
    const v = fullRef.current;
    if (!v) return;
    v.currentTime = t;
    v.play().catch(() => {});
    v.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const share = async (c: Clip) => {
    const url = `${window.location.origin}/watch/${c.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `Kamili demo: ${c.title}`, url });
      else { await navigator.clipboard.writeText(url); setCopied(c.id); setTimeout(() => setCopied(""), 2500); }
    } catch { /* closed the share sheet */ }
  };

  return (
    <>
      <section aria-labelledby="full-title" className="mt-6">
        <div style={{ borderRadius: 12, overflow: "hidden", background: "#0F2236", boxShadow: "0 1px 2px rgba(26,58,92,.12)" }}>
          <video ref={fullRef} id="full" controls playsInline preload="metadata" poster={full.poster} style={{ display: "block", width: "100%", aspectRatio: "16 / 9", background: "#0F2236" }}>
            <source src={full.src} type="video/mp4" />
            Your browser can&apos;t play this video. <a href={full.src}>Open the video file</a>.
          </video>
        </div>
        <h2 id="full-title" className="ao-h2 mt-4" style={{ fontSize: 22, lineHeight: "28px" }}>{full.title}</h2>
        <p className="ao-body-2 mt-1">{full.sub} <span className="ao-meta">· {full.duration}</span></p>
        <p className="ao-meta mt-3">Jump to a part:</p>
        <div className="mt-2" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {clips.map((c) => (
            <button key={c.id} type="button" className="ao-btn ao-btn-sm ao-btn-secondary" onClick={() => jump(c.startInFull)} style={{ minHeight: 40 }}>
              {c.n}. {c.title}
            </button>
          ))}
        </div>
      </section>

      <h2 className="ao-h2 mt-12" style={{ fontSize: 20 }}>Or watch one part</h2>
      <p className="ao-body-2 mt-1">Each part is one to two minutes. Use &ldquo;Share this part&rdquo; to send one by text.</p>
      <ul className="mt-5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 20, listStyle: "none", padding: 0 }}>
        {clips.map((c) => (
          <li key={c.id} id={c.id} className="ao-card" style={{ padding: 0, overflow: "hidden", scrollMarginTop: 120, outline: hash === c.id ? "3px solid #C8A84B" : undefined }}>
            <video controls playsInline preload="none" poster={c.poster} style={{ display: "block", width: "100%", aspectRatio: "16 / 9", background: "#0F2236" }}>
              <source src={c.src} type="video/mp4" />
            </video>
            <div style={{ padding: "14px 16px 16px" }}>
              <p className="ao-eyebrow">Part {c.n} of 6 · {c.device} · {c.duration}</p>
              <h3 className="ao-h2 mt-1" style={{ fontSize: 19, lineHeight: "25px" }}>{c.title}</h3>
              <p className="ao-body-2 mt-1">{c.sub}</p>
              <div className="mt-3" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                <button type="button" className="ao-btn ao-btn-sm ao-btn-quiet" onClick={() => share(c)} style={{ minHeight: 40 }}>{copied === c.id ? "Link copied" : "Share this part"}</button>
                <Link className="ao-link" href={`/watch/${c.id}`} style={{ fontSize: 14 }}>Open on its own page</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
