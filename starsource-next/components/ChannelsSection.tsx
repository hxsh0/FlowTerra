import { Reveal } from "@/components/Reveal";

export function ChannelsSection() {
  return (
    <section className="section" id="channels">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Two lead channels, one pipeline</span>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Meetings from two directions. Both land on your calendar.
          </h2>
        </div>
        <div className="channel-grid">
          <Reveal className="channel-card">
            <h3>Direct prospects</h3>
            <p>
              Businesses showing evidence they need your service right now — approached with
              that evidence in the first message, not a generic script.
            </p>
          </Reveal>
          <Reveal className="channel-card">
            <h3>Referral partners</h3>
            <p>
              Complementary local businesses whose customers are actively in-market for you —
              matched by real signal strength and approached as partners, not prospects.
              Relationships that compound instead of one-off leads.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
