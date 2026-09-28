import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-white/10 bg-[#0c0c0c] text-[#f4efe6]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="block">
          <div className="text-[11px] tracking-[0.32em] text-[#C8A84B]">YAKINI</div>
          <div className="font-serif text-2xl leading-none tracking-wide">Vimaa</div>
        </Link>
        <nav className="hidden items-center gap-8 text-[11px] tracking-[0.22em] md:flex">
          <Link href="/about" className="hover:text-[#C8A84B]">About</Link>
          <Link href="/solutions" className="hover:text-[#C8A84B]">Engine</Link>
          <Link href="/certification" className="hover:text-[#C8A84B]">Standard</Link>
        </nav>
        <Link href="/login" className="border border-[#C8A84B] px-4 py-2 text-[11px] tracking-[0.2em] text-[#C8A84B]">
          Enter
        </Link>
      </div>
    </header>
  );
}
