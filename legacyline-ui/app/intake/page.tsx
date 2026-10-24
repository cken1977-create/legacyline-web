"use client";
// Add to your record — story + documents, each saved on its own (draft saves),
// then one "Send for review". Signed-out visitors start at /app/signup.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BRAND } from "../../lib/brand";
import { core, currentParticipantId, hasIndividualSession } from "../../lib/core";
import { Wordmark } from "../_components/assay";
import { Alert, DocUpload, EMPTY_STORY, Story, StoryForm, storyToForm } from "../_components/assay/forms";
import { IconArrowRight, IconLock } from "../_components/assay/icons";

type DocKey = "gov_id" | "selfie" | "bank_statement";
const DOCS: { key: DocKey; label: string; help: string; capture?: "user" }[] = [
  { key: "gov_id", label: "Photo ID", help: "Driver's license, state ID or passport. Front side, all four corners." },
  { key: "selfie", label: "A photo of you", help: "Plain background, face clearly visible. Used only to match your ID.", capture: "user" },
  { key: "bank_statement", label: "Recent bank statement", help: "Any page from the last 60 days that shows your name." },
];

function AddToRecord() {
  const router = useRouter();
  const q = useSearchParams();
  const [pid, setPid] = useState<string | null>(null);
  const [story, setStory] = useState<Story>(EMPTY_STORY);
  const [docs, setDocs] = useState<Record<DocKey, "missing" | "submitted" | "uploading" | "error">>({ gov_id: "missing", selfie: "missing", bank_statement: "missing" });
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [sent, setSent] = useState(false);
  const focus = q.get("slot");

  useEffect(() => {
    const p = currentParticipantId();
    if (!hasIndividualSession() || !p) { router.replace("/app/signup"); return; }
    setPid(p);
    core<any>(`/intake/by-participant/${p}`).then((i) => {
      if (!i) return;
      const a = i.answers ?? {};
      setStory({ ...EMPTY_STORY, ...Object.fromEntries(Object.keys(EMPTY_STORY).map((k) => [k, a[k] ?? ""])) } as Story);
      const u = i.docs_uploaded ?? {};
      setDocs({ gov_id: u.gov_id ? "submitted" : "missing", selfie: u.selfie ? "submitted" : "missing", bank_statement: u.bank_statement ? "submitted" : "missing" });
    }).catch(() => null);
  }, [router]);

  useEffect(() => { if (focus) setTimeout(() => document.getElementById(`doc-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 300); }, [focus]);

  async function upload(key: DocKey, file: File) {
    if (!pid) return;
    if (file.size > 10 * 1024 * 1024) { setDocs((d) => ({ ...d, [key]: "error" })); return; }
    setDocs((d) => ({ ...d, [key]: "uploading" }));
    try {
      const fd = storyToForm(story); fd.append(key, file); fd.append("draft", "true");
      await core(`/intake/${pid}`, { method: "POST", body: fd });
      setDocs((d) => ({ ...d, [key]: "submitted" }));
      setNote({ tone: "ok", text: `${DOCS.find((x) => x.key === key)!.label} is on file.` });
    } catch { setDocs((d) => ({ ...d, [key]: "error" })); }
  }

  async function saveStory() {
    if (!pid) return;
    setSaving(true); setNote(null);
    try { const fd = storyToForm(story); fd.append("tier", "2"); await core(`/intake/${pid}`, { method: "POST", body: fd }); setNote({ tone: "ok", text: "Saved to your record." }); }
    catch { setNote({ tone: "error", text: "We couldn't save that. Your answers are still here; try again." }); }
    finally { setSaving(false); }
  }

  async function sendForReview() {
    if (!pid) return;
    setSaving(true); setNote(null);
    try { await core(`/intake/${pid}`, { method: "POST", body: storyToForm(story) }); setSent(true); setTimeout(() => router.push("/app"), 1600); }
    catch { setNote({ tone: "error", text: "We couldn't send it. Nothing was lost; try again." }); }
    finally { setSaving(false); }
  }

  const onFile = Object.values(docs).filter((d) => d === "submitted").length;

  return (
    <div className="ao-paper min-h-screen">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between px-4 md:px-8" style={{ background: "var(--paper)", borderBottom: "1px solid var(--linen)" }}>
        <Link href="/app" aria-label={`${BRAND.name} — My Record`}><Wordmark /></Link>
        <Link href="/app" className="ao-btn ao-btn-quiet ao-btn-sm">Back to My Record</Link>
      </header>
      <main className="mx-auto max-w-[720px] px-4 pb-24 pt-8 md:px-8">
        <p className="ao-eyebrow">Add to your record</p>
        <h1 className="ao-h1 mt-1" style={{ fontSize: 32, lineHeight: "38px" }}>Documents and your story</h1>
        <p className="ao-body-2 mt-2" style={{ fontSize: 16 }}>Everything saves as you go. When you're ready, send it for review — a reviewer reads it and the {BRAND.standard} check re-runs.</p>
        {note && <div className="mt-5"><Alert tone={note.tone}>{note.text}</Alert></div>}

        <section aria-labelledby="docs" className="mt-8">
          <div className="flex items-baseline justify-between"><h2 id="docs" className="ao-h2">Documents</h2><span className="ao-mono ao-meta">{onFile}/3 on file</span></div>
          <div className="mt-3 flex flex-col gap-3">
            {DOCS.map((d) => <div key={d.key} id={`doc-${d.key}`} style={focus === d.key ? { outline: "2px solid var(--action)", outlineOffset: 3, borderRadius: 12 } : undefined}><DocUpload label={d.label} help={d.help} capture={d.capture} state={docs[d.key]} onFile={(f) => upload(d.key, f)} /></div>)}
          </div>
          <p className="ao-meta mt-3 flex items-center gap-1.5"><IconLock size={14} />Stored privately. Reviewers open documents through a link that expires in minutes.</p>
        </section>

        <section aria-labelledby="story" className="mt-12">
          <h2 id="story" className="ao-h2">Your story</h2>
          <div className="ao-card mt-3 p-5 md:p-6"><StoryForm value={story} onChange={setStory} />
            <div className="mt-6 flex justify-end"><button className="ao-btn ao-btn-secondary" onClick={saveStory} disabled={saving}>{saving ? "Saving…" : "Save answers"}</button></div>
          </div>
        </section>

        <div className="ao-card mt-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center" style={{ background: "var(--vellum)" }}>
          <div className="flex-1"><p style={{ fontWeight: 600 }}>{sent ? "Sent for review" : "Ready for a reviewer?"}</p><p className="ao-meta mt-0.5">{sent ? "Taking you back to My Record…" : "You can keep adding after you send."}</p></div>
          <button className="ao-btn ao-btn-primary" onClick={sendForReview} disabled={saving || sent || onFile === 0}>Send for review <IconArrowRight size={16} /></button>
        </div>
      </main>
    </div>
  );
}

export default function Page() { return <Suspense><AddToRecord /></Suspense>; }
