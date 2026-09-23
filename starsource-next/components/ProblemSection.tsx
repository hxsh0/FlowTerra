import { Reveal } from "@/components/Reveal";

export function ProblemSection() {
  return (
    <section className="section" id="how-it-works">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">The problem with volume</span>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Anyone can fill a calendar. Filling it with the right meetings is the hard part.
          </h2>
        </div>
        <div className="compare-grid">
          <Reveal className="compare-card">
            <span className="compare-label">How incumbents target</span>
            <h3>Category + location + a working phone number.</h3>
            <p>
              No fit signal. No timing signal. The system can&rsquo;t tell a business that
              urgently needs the problem solved today from one that solved it years ago.
            </p>
            <blockquote>
              &ldquo;I wasn&rsquo;t getting connected with the right clients. It started to
              become a waste of time.&rdquo;
              <cite>— a business owner, on a volume-based incumbent</cite>
            </blockquote>
          </Reveal>
          <Reveal className="compare-card compare-card--accent">
            <span className="compare-label">How StarSource targets</span>
            <h3>Fits the category — and shows current evidence of need.</h3>
            <p>
              We only reach out when a real signal fires: a rebrand, a hiring push, a shift in
              reviews. Fewer contacts, higher hit rate, no wasted meetings — and every booked
              meeting arrives with the evidence that earned it.
            </p>
            <div className="tag-row">
              <span className="tag">Rebrand signals</span>
              <span className="tag">Hiring signals</span>
              <span className="tag">Review-pattern shifts</span>
              <span className="tag">New-business signals</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
