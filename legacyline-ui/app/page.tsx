import Link from "next/link";
import Navbar from "./_components/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] text-[#f4efe6]">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-[1.2fr_0.8fr] md:py-28">
        <div>
          <p className="text-[11px] tracking-[0.32em] text-[#C8A84B]">A YAKINI SYSTEM</p>
          <h1 className="mt-6 font-serif text-6xl leading-[0.92] md:text-8xl">
            A person.<br />A record.<br />
            <span className="italic text-[#C8A84B]">A packet.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">
            Vimaa is the readiness engine. A program takes someone from a request to a decision packet. The score stays in the engine. Made by Yakini.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/app" className="bg-[#C8A84B] px-5 py-3 text-[11px] tracking-[0.2em] text-[#0c0c0c]">Open the record</Link>
            <Link href="/solutions" className="border border-white/20 px-5 py-3 text-[11px] tracking-[0.2em]">How it works</Link>
          </div>
        </div>
        <aside className="border border-white/10 p-8">
          <p className="text-[11px] tracking-[0.28em] text-[#C8A84B]">ON THE RECORD</p>
          <ul className="mt-8 space-y-5 font-serif text-3xl">
            <li>Consent</li>
            <li>Evidence</li>
            <li>Housing, work, stability</li>
            <li className="italic text-[#C8A84B]">The packet</li>
          </ul>
          <p className="mt-10 text-[11px] tracking-[0.22em] text-white/40">NO FAKE SCORE. NO STOCK FACE.</p>
        </aside>
      </section>
      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-[#C8A84B]">01</p>
            <h2 className="mt-3 font-serif text-3xl">The desk</h2>
            <p className="mt-3 text-white/65">An operator logs the request. Vizionz is the first desk.</p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.22em] text-[#C8A84B]">02</p>
            <h2 className="mt-3 font-serif text-3xl">The person</h2>
            <p className="mt-3 text-white/65">Promote creates a subject. They walk the journey in the app.</p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.22em] text-[#C8A84B]">03</p>
            <h2 className="mt-3 font-serif text-3xl">The packet</h2>
            <p className="mt-3 text-white/65">A funder reads what was done. The engine keeps the score.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
