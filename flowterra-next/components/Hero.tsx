export function Hero() {
  return (
    <header className="hero">
      <div className="wrap">
        <span className="badge">
          <span className="tag">LIVE</span> <b>5 agents</b>&nbsp;working <b>312</b>&nbsp;accounts now
        </span>
        <h1>
          The operating system
          <br />
          for autonomous revenue.
        </h1>
        <p className="lede">
          FlowTerra runs your entire outbound motion with a fleet of autonomous agents — sourcing,
          researching, engaging, and closing in one continuous loop. You set the strategy. The
          system runs the floor.
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary" href="#">
            Request access
          </a>
          <a className="btn btn-ghost" href="#console">
            See it run <span style={{ opacity: 0.6 }}>↓</span>
          </a>
        </div>
        <div className="hero-meta">
          <span>
            <i className="dot" /> All systems operational
          </span>
          <span>SOC 2 Type II</span>
          <span>99.98% uptime</span>
          <span>Deployed in 1,200+ pipelines</span>
        </div>
      </div>
    </header>
  );
}
