const COLS = [
  { h: "Product", links: ["Console", "Agent fleet", "Pipeline", "Guardrails"] },
  { h: "Company", links: ["Manifesto", "Careers", "Security", "Changelog"] },
  { h: "Resources", links: ["Docs", "API", "Status", "Contact"] },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap-wide">
        <div className="foot-grid">
          <div className="foot-col">
            <a className="brand" href="#top" style={{ marginBottom: 14 }}>
              <span className="mark" /> FlowTerra
            </a>
            <p style={{ color: "var(--text-2)", fontSize: 13.5, maxWidth: "34ch", margin: 0 }}>
              The autonomous revenue operating system. Mission control for high-performing sales
              teams.
            </p>
          </div>
          {COLS.map((c) => (
            <div className="foot-col" key={c.h}>
              <h5>{c.h}</h5>
              {c.links.map((l) => (
                <a href="#" key={l}>
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© 2026 FlowTerra Systems, Inc.</span>
          <span>SOC 2 Type II · ISO 27001 · GDPR</span>
          <span>v2.4 · build 1180 · all systems operational</span>
        </div>
      </div>
    </footer>
  );
}
