import { Reveal } from "@/components/Reveal";

export function CTA() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="cta">
          <h2 className="h2">
            See what&rsquo;s moving in <em className="accent-em">your market</em> tonight.
          </h2>
          <p className="lede">
            A free market scan shows you the live signals in your area — before you spend a
            dollar.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="/scan">
              Get a free market scan
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
