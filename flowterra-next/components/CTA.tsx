import { Reveal } from "@/components/Reveal";

export function CTA() {
  return (
    <section className="section" id="pricing" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="cta">
          <div className="cta-grid-bg" />
          <span className="eyebrow" style={{ display: "flex", justifyContent: "center" }}>
            Deploy the fleet
          </span>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Put your pipeline on autopilot.
          </h2>
          <p className="lede">
            Onboard in a day. Watch the first agents start working your accounts before you finish
            your coffee.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#">
              Request access
            </a>
            <a className="btn btn-ghost" href="#">
              Talk to engineering
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
