import Link from "next/link";
import Navbar from "../_components/Navbar";
export default function Page() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] text-[#f4efe6]">
      <section className="relative min-h-[78vh] overflow-hidden">
        <img src="https://cdn.midjourney.com/9c6d01a7-4c8d-4b12-8f7f-ff4ad317d644/0_1.png" alt="Desert mountains in evening light" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-36">
          <p className="text-[11px] tracking-[0.32em] text-[#C8A84B]">THE STANDARD</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">Judged against<br /><span className="italic text-[#C8A84B]">a standard.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">BRSA is the standard the score is judged against. Certification is not a second product. It opens when agencies are already on the engine.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/about" className="border border-white/30 px-5 py-3 text-[11px] tracking-[0.2em]">The house</Link></div>
        </div>
      </section>
    </main>
  );
}
