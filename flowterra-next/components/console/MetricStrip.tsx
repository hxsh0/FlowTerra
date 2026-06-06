"use client";
import { useEffect, useState } from "react";
import { LiveAreaChart } from "@/components/viz/LiveAreaChart";
import { Sparkline } from "@/components/viz/Sparkline";

export function MetricStrip({ revenue }: { revenue: number }) {
  const rev = "$" + (revenue / 1e6).toFixed(2) + "M";
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const id = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(id);
  }, [revenue]);

  return (
    <div className="cons-metrics">
      <div className="metric">
        <div className="k">Revenue won · today</div>
        <div className="v">
          <span style={{ color: flash ? "var(--accent)" : undefined, transition: "color .4s" }}>
            {rev}
          </span>
        </div>
      </div>
      <div className="metric">
        <div className="k">Pipeline velocity</div>
        <div className="v">
          +12.4% <small>▲ wk</small>
        </div>
        <Sparkline className="spark" />
      </div>
      <div className="metric">
        <div className="k">Reply rate</div>
        <div className="v">
          11.4% <small>▲ 2.1</small>
        </div>
      </div>
      <div className="metric">
        <div className="k">Throughput · live</div>
        <div className="v">
          <LiveAreaChart n={34} strokeWidth={1.8} live vh={120} style={{ width: "100%", height: 34 }} />
        </div>
      </div>
    </div>
  );
}
