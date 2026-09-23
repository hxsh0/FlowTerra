import { Reveal } from "@/components/Reveal";

export function GuaranteeSection() {
  return (
    <section className="section" id="guarantee">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">The guarantee</span>
          <h2 className="h2" style={{ marginTop: 18 }}>
            A guarantee that doesn&rsquo;t push us back to volume.
          </h2>
          <p className="lede">
            Most services guarantee a raw appointment count — which quietly rewards booking
            anything with a pulse. Ours splits by what you&rsquo;re actually buying.
          </p>
        </div>
        <div className="guarantee-grid">
          <Reveal className="guarantee-card">
            <span className="guarantee-mode">Volume mode · Spark</span>
            <p>Booked appointments in your first 30 days — or it&rsquo;s free.</p>
          </Reveal>
          <Reveal className="guarantee-card guarantee-card--accent">
            <span className="guarantee-mode">Curated mode · Constellation &amp; Galaxy</span>
            <p>
              Every meeting comes with the evidence behind it. A booked meeting that arrives
              without a documented signal doesn&rsquo;t count toward your plan — and a monthly
              floor of evidence-backed matches means &ldquo;curated&rdquo; never becomes an
              excuse for low delivery.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
