import { PRICING } from "../../lib/pricing";

export const metadata = { title: "Pricing · Kamili" };

export default function Pricing() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px" }}>
      <p style={{ letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", opacity: 0.6 }}>Kamili · Pricing</p>
      {PRICING.map((p) => (
        <section key={p.id} style={{ marginTop: 32, border: "1px solid #0002", borderRadius: 16, padding: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700 }}>{p.name}</h1>
          <p style={{ fontSize: 28, marginTop: 12 }}>{p.price}</p>
          <p style={{ fontSize: 13, opacity: 0.6 }}>{p.note}</p>
          <ul style={{ marginTop: 20 }}>{p.features.map((f) => <li key={f}>· {f}</li>)}</ul>
          {p.checkoutUrl
            ? <a href={p.checkoutUrl} style={{ display: "block", marginTop: 24, padding: 12, textAlign: "center", background: "#111", color: "#fff", borderRadius: 8 }}>Start your program</a>
            : <button disabled style={{ width: "100%", marginTop: 24, padding: 12, background: "#1116", color: "#fff", borderRadius: 8 }}>Checkout coming soon</button>}
          <a href="/review/demo" style={{ display: "block", marginTop: 12, textAlign: "center" }}>See the demo program →</a>
        </section>
      ))}
    </main>
  );
}
