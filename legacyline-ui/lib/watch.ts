// Kamili demo videos for the public watch page (demo deployment only).
// The files live in public file storage, not in git. To replace a video,
// upload the new file under a new dated folder and update MEDIA_BASE / files.
// How-to: /workspace/kamili-demo/videos/HOSTING.md (outside the repo).

export const MEDIA_ORIGIN = "https://r3ttymbsgoc2vq9s.public.blob.vercel-storage.com";
const MEDIA_BASE = `${MEDIA_ORIGIN}/kamili/2026-10-25`;

export type Clip = {
  id: string; // v1..v6, used in links: /watch/v2 and /watch#v2
  n: number;
  title: string;
  sub: string;
  device: "On a computer" | "On a phone";
  duration: string;
  src: string;
  poster: string;
  /** Where this part starts in the full play-through, in seconds. */
  startInFull: number;
};

export const FULL = {
  title: "The Kamili demo, start to finish",
  sub: "One sample program followed from the organization to the funder, in six parts. Captions are on.",
  duration: "8 min",
  src: `${MEDIA_BASE}/kamili-demo-full.mp4`,
  poster: `${MEDIA_BASE}/kamili-demo-full-poster.jpg`,
};

const clip = (n: number, title: string, sub: string, device: Clip["device"], duration: string, startInFull: number): Clip => ({
  id: `v${n}`, n, title, sub, device, duration, startInFull,
  src: `${MEDIA_BASE}/kamili-demo-v${n}.mp4`,
  poster: `${MEDIA_BASE}/kamili-demo-v${n}-poster.jpg`,
});

export const CLIPS: Clip[] = [
  clip(1, "An organization joins", "Riverside opens its own readiness record first.", "On a computer", "1:31", 4),
  clip(2, "A person sees their record", "Maya opens her record, her coaching steps and her check-ins on her phone.", "On a phone", "1:47", 88.7),
  clip(3, "Staff track progress", "A case manager spots who has gone quiet.", "On a computer", "1:08", 188.8),
  clip(4, "An evaluator review", "A second evaluator signs off before Samuel is certified.", "On a computer", "1:24", 250),
  clip(5, "Certification and verify", "A landlord checks Andre's standing, never his files.", "On a phone", "1:05", 327.3),
  clip(6, "The funder view", "Reading the day 30, 90 and 180 follow-ups.", "On a computer", "1:36", 385.7),
];

export const clipById = (id: string) => CLIPS.find((c) => c.id === id.toLowerCase());
