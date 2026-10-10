import { BRAND } from "../../lib/brand";
import Link from "next/link";
import Navbar from "../_components/Navbar";
export default function Page() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] text-[#f4efe6]">
      <section className="relative min-h-[78vh] overflow-hidden">
        <img src="/photos/room.jpg" alt="A quiet room looking onto the desert" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-36">
          <p className="text-[11px] tracking-[0.32em] text-[#C8A84B]">THE HOUSE</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">Made by Yakini.<br /><span className="italic text-[#C8A84B]">Used by operators.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Yakini builds the infrastructure. {BRAND.name} is the record; FRARI is the engine. Vizionz Sankofa is the first desk. The standard underneath is BRSA, and it stays quiet until someone is paying to be certified.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/solutions" className="bg-[#C8A84B] px-5 py-3 text-[11px] tracking-[0.2em] text-black">See the engine</Link></div>
        </div>
      </section>
    </main>
  );
}
