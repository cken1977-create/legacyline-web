import Link from "next/link";
export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 text-[#f4efe6]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/">
          <div className="text-[11px] tracking-[0.32em] text-[#C8A84B]">YAKINI</div>
          <div className="font-serif text-2xl leading-none">Kamili</div>
        </Link>
        <nav className="hidden gap-8 text-[11px] tracking-[0.22em] md:flex">
          <Link href="/about">About</Link>
          <Link href="/solutions">Engine</Link>
          <Link href="/certification">Standard</Link>
          <Link href="/lifecycle">Path</Link>
        </nav>
        <Link href="/login" className="border border-[#C8A84B] px-4 py-2 text-[11px] tracking-[0.2em] text-[#C8A84B]">Enter</Link>
      </div>
    </header>
  );
}
