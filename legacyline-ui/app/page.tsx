export default function Home() {
  return (
    <main style={{
      background: "#0B0F1A",
      color: "#FFFFFF",
      minHeight: "100vh",
      fontFamily: "system-ui, sans-serif",
      padding: "60px 20px"
    }}>

      <div style={{maxWidth: 900, margin: "0 auto"}}>

        <h1 style={{fontSize: 48, marginBottom: 10}}>
          Legacyline
        </h1>

        <p style={{fontSize: 20, opacity: .8}}>
          Behavioral Readiness Engine
        </p>

        <div style={{marginTop: 40, lineHeight: 1.7, fontSize: 18}}>

          <p>
            Legacyline is the individual readiness engine implementing the
            Behavioral Readiness Standard (BRSA).
          </p>

          <p>
            The platform enables individuals to document progress across
            multiple life domains and demonstrate verified behavioral
            readiness over time.
          </p>

          <p>
            Legacyline does not issue credit scores, risk scores, or lending
            decisions. The system records behavioral indicators that reflect
            stability, participation, and forward progress.
          </p>

        </div>

        <div style={{marginTop: 50}}>

          <a
            href="/intake"
            style={{
              background: "#4F7EFF",
              padding: "14px 22px",
              borderRadius: 8,
              color: "white",
              textDecoration: "none",
              marginRight: 15
            }}
          >
            Begin Intake
          </a>

          <a
            href="/verify"
            style={{
              border: "1px solid #555",
              padding: "14px 22px",
              borderRadius: 8,
              color: "white",
              textDecoration: "none"
            }}
          >
            Verify Record
          </a>

        </div>

      </div>

    </main>
  );
}
