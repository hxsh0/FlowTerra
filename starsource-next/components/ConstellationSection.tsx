import { Reveal } from "@/components/Reveal";

export function ConstellationSection() {
  return (
    <section className="section">
      <div className="wrap-narrow">
        <Reveal>
          <span className="eyebrow">The constellation engine</span>
          <h2 className="h2" style={{ marginTop: 18 }}>
            One signal is just a star. We connect them into <em className="accent-em">a picture</em>.
          </h2>
          <p className="lede" style={{ marginTop: 20 }}>
            A single data point about a business means little on its own. Our engine connects
            individual signals into a constellation — a recognizable picture that says: this
            business, right now, is worth talking to.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
