export function Hero() {
  return (
    <header className="hero">
      <div className="wrap">
        <span className="eyebrow" style={{ display: "inline-flex", justifyContent: "center" }}>
          Done-for-you client acquisition
        </span>
        <h1 style={{ marginTop: 22 }}>
          Stop cold-calling the dark.
          <br />
          <em className="accent-em">Navigate by signal.</em>
        </h1>
        <p className="lede" style={{ margin: "0 auto 32px" }}>
          StarSource watches your local market for live evidence of need — rebrands, hiring,
          review shifts — and books meetings on your calendar only when the signals say a
          business is worth your time.
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary" href="/scan">
            Get a free market scan
          </a>
          <a className="btn btn-ghost" href="#how-it-works">
            See how it works
          </a>
        </div>
        <p className="hero-note">See the signals filling in your area right now. No commitment.</p>
      </div>
    </header>
  );
}
