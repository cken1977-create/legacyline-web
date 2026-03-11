import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="border-b-4 border-[#C8A84B] bg-[#1A3A5C] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-4">
          <Image src="/logo-shield.png" alt="Legacyline" width={52} height={52} className="h-12 w-12 object-contain" />
          <div className="text-3xl font-semibold tracking-wide">LEGACYLINE</div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-[#C8A84B] transition">HOME</Link>
          <Link href="/about" className="hover:text-[#C8A84B] transition">ABOUT</Link>
          <Link href="/solutions" className="hover:text-[#C8A84B] transition">SOLUTIONS</Link>
          <Link href="/certification" className="hover:text-[#C8A84B] transition">CERTIFICATION</Link>
        </nav>

        <Link href="/intake" className="rounded-2xl bg-[#C8A84B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
          LOGIN
        </Link>
      </div>
    </header>
  );
}
