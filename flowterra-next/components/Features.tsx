import { Reveal } from "@/components/Reveal";

const FEATURES = [
  {
    ico: "◎",
    title: "Autonomous sourcing",
    body: "Scout continuously mines intent, firmographics, and timing signals to surface net-new accounts that match your ICP — and scores every one.",
    tag: "agent.scout · always-on",
  },
  {
    ico: "⊞",
    title: "Deep enrichment",
    body: "Probe builds a live dossier per account — org charts, recent filings, tech stack, triggers — so every message lands with real context.",
    tag: "agent.probe · 40+ sources",
  },
  {
    ico: "↗",
    title: "Adaptive outreach",
    body: "Relay writes, sequences, and times every touch, then rewrites itself from what's converting. No two prospects get the same playbook.",
    tag: "agent.relay · self-optimizing",
  },
  {
    ico: "⤸",
    title: "Reply intelligence",
    body: "Echo reads every response, handles objections, and books the meeting — escalating to a human only when the deal calls for it.",
    tag: "agent.echo · human-in-loop",
  },
  {
    ico: "▣",
    title: "Forecast & attribution",
    body: "Ledger ties every dollar of pipeline to the touch that created it and predicts close with a confidence band, updated live.",
    tag: "agent.ledger · real-time",
  },
  {
    ico: "⛉",
    title: "Guardrails & control",
    body: "Set send limits, tone, exclusion lists, and approval gates. Every agent action is logged, replayable, and reversible.",
    tag: "policy engine · SOC 2",
  },
];

export function Features() {
  return (
    <section className="section" id="system">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow">The system</span>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Engineered for operators, not chatbots.
          </h2>
          <p className="lede">
            FlowTerra is infrastructure. Deterministic where it counts, autonomous where it pays
            off, observable everywhere.
          </p>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <Reveal className="feat" key={f.title}>
              <div className="ico">{f.ico}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <div className="tagline">{f.tag}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
