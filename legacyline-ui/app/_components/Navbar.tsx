import Link from "next/link";
import { BRAND } from "../../lib/brand";
import { Mark } from "./assay";

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20" style={{ color: "var(--cream)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5 md:px-6">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
          <Mark tone="cream" size={28} />
          <span className="font-serif text-[24px] font-semibold leading-none tracking-[-0.01em]">{BRAND.name}</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 text-[14px] md:flex" style={{ color: "var(--cream-dim)" }}>
          <Link className="hover:text-[var(--cream)]" href="/certification">Standard</Link>
          <Link className="hover:text-[var(--cream)]" href="/#how">How it works</Link>
          <Link className="hover:text-[var(--cream)]" href="/verify">Verify</Link>
          <Link className="hover:text-[var(--cream)]" href="/about">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/app/login" className="ao-btn ao-btn-ghost-n ao-btn-sm hidden sm:inline-flex">Sign in</Link>
          <Link href="/app/signup" className="ao-btn ao-btn-gold ao-btn-sm">Start your record</Link>
        </div>
      </div>
    </header>
  );
}
