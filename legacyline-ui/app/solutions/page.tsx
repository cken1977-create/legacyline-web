import Link from "next/link";
import Navbar from "../_components/Navbar";
export default function Page() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] text-[#f4efe6]">
      <section className="relative min-h-[78vh] overflow-hidden">
        <img src="/photos/packet.jpg" alt="Hands passing a folder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-36">
          <p className="text-[11px] tracking-[0.32em] text-[#C8A84B]">THE ENGINE</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">Request. Subject.<br /><span className="italic text-[#C8A84B]">Packet.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">An operator logs the request. Promote creates a subject. The person walks consent, evidence, and the questionnaire. The funder reads the packet. The web app does not invent the score.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/login" className="bg-[#C8A84B] px-5 py-3 text-[11px] tracking-[0.2em] text-black">Enter</Link><Link href="/lifecycle" className="border border-white/30 px-5 py-3 text-[11px] tracking-[0.2em]">The path</Link></div>
        </div>
      </section>
    </main>
  );
}
