"use client";
import { useEffect, useState } from "react";
import { useMotion } from "@/lib/visual";

const NODES = [
  { ico: "◎", t: "Scout · sourcing", s: "finds & scores net-new accounts", stat: "128/hr" },
  { ico: "⊞", t: "Probe · research", s: "enriches contacts & org context", stat: "86/hr" },
  { ico: "↗", t: "Relay · outreach", s: "writes & sequences personalized sends", stat: "41/hr" },
  { ico: "⤸", t: "Echo · replies", s: "triages responses, books meetings", stat: "23/hr" },
  { ico: "▣", t: "Ledger · forecast", s: "attributes pipeline & predicts close", stat: "live" },
];

export function AgentsWorkflow() {
  const motion = useMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (motion) setActive((a) => (a + 1) % NODES.length);
    }, 1500);
    return () => clearInterval(id);
  }, [motion]);

  return (
    <section className="section" id="agents">
      <div className="wrap">
        <div className="split">
          <div>
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">The fleet</span>
              <h2 className="h2" style={{ marginTop: 18 }}>
                Five agents.
                <br />
                One autonomous loop.
              </h2>
              <p className="lede" style={{ marginTop: 20 }}>
                Each agent owns a stage of the funnel and hands off to the next — continuously, in
                parallel, without a human in the path. You supervise the loop, set guardrails, and
                step in only where judgment matters.
              </p>
            </div>
          </div>
          <div className="flowmap">
            {NODES.map((nd, i) => (
              <div key={i}>
                {i > 0 && (
                  <div
                    className={`flow-conn ${active === i ? "lit" : ""}`}
                    style={{ position: "static", height: 30, width: 2, margin: "0 0 0 32px" }}
                  />
                )}
                <div className={`flow-node ${active === i ? "active" : ""}`}>
                  <div className="fn-ico">{nd.ico}</div>
                  <div>
                    <div className="fn-t">{nd.t}</div>
                    <div className="fn-s">{nd.s}</div>
                  </div>
                  <div className="fn-stat">{nd.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
