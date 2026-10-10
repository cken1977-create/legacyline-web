import Link from "next/link";
export default function LoginChooserPage() {
  return (
    <main className="relative min-h-screen text-[#f4efe6]">
      <img src="/photos/records.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-20">
        <p className="text-[11px] tracking-[0.32em] text-[#C8A84B]">YAKINI · VIMAA</p>
        <h1 className="mt-3 font-serif text-5xl">Choose the door.</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="border border-white/15 bg-black/50 p-8">
            <h2 className="font-serif text-3xl">The person</h2>
            <p className="mt-2 text-white/70">Your record, your evidence, your next step.</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/app/signup" className="bg-[#C8A84B] px-4 py-3 text-center text-[11px] tracking-[0.18em] text-black">Create the record</Link>
              <Link href="/app/login" className="border border-white/20 px-4 py-3 text-center text-[11px] tracking-[0.18em]">Sign in</Link>
            </div>
          </section>
          <section className="border border-white/15 bg-black/50 p-8">
            <h2 className="font-serif text-3xl">The operator</h2>
            <p className="mt-2 text-white/70">Participants, evaluations, and the packet.</p>
            <Link href="/login/organization" className="mt-6 block border border-white/20 px-4 py-3 text-center text-[11px] tracking-[0.18em]">Enter the desk</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
