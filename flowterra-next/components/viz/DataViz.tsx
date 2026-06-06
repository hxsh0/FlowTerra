import { Reveal } from "@/components/Reveal";
import { LiveAreaChart } from "./LiveAreaChart";
import { Gauge } from "./Gauge";
import { ConversionBars } from "./ConversionBars";

export function DataViz() {
  return (
    <section className="section" id="pipeline">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Mission control</span>
          <h2 className="h2" style={{ marginTop: 18 }}>
            See revenue happen, frame by frame.
          </h2>
          <p className="lede">
            Every signal, send, and reply is metered in real time. No weekly rollups — the forecast
            updates the instant an agent moves a deal.
          </p>
        </div>
        <div className="viz-grid">
          <Reveal className="card">
            <div className="pane-head">
              <h4>Pipeline velocity · trailing 46 cycles</h4>
              <span className="meta accent">▲ live</span>
            </div>
            <LiveAreaChart n={46} strokeWidth={2.4} live vh={240} style={{ width: "100%", height: 240 }} />
            <div className="chart-legend">
              <span>
                <i style={{ background: "var(--accent)" }} />
                Qualified pipeline ($)
              </span>
              <span>
                <i style={{ background: "var(--text-3)" }} />
                Forecast band
              </span>
            </div>
          </Reveal>
          <div className="viz-side">
            <Reveal className="card">
              <div className="pane-head">
                <h4>Win rate</h4>
                <span className="meta">90d</span>
              </div>
              <div className="gauge-wrap">
                <Gauge value={0.34} />
                <div>
                  <div className="gauge-num">
                    34%<small>+6.2 pts vs. human baseline</small>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal className="card">
              <div className="pane-head">
                <h4>Stage conversion</h4>
                <span className="meta">this cycle</span>
              </div>
              <ConversionBars />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
