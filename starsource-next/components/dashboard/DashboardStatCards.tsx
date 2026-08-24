"use client";
import { useEffect, useRef, useState } from "react";
import { DASHBOARD_STATS } from "@/lib/data";
import { useInView } from "@/hooks/useInView";

function StatCard({
  value,
  prefix,
  suffix,
  dec,
  label,
  animate,
}: {
  value: number;
  prefix: string;
  suffix: string;
  dec: number;
  label: string;
  animate: boolean;
}) {
  const [display, setDisplay] = useState(value);
  const raf = useRef(0);

  useEffect(() => {
    if (!animate) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const from = 0;
    const dur = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [animate, value]);

  const formatted =
    dec > 0 ? display.toFixed(dec) : Math.round(display).toLocaleString();

  return (
    <div className="dash-stat">
      <div className="dash-stat-v">
        {prefix}
        <span className="accent">{formatted}</span>
        {suffix}
      </div>
      <div className="dash-stat-k">{label}</div>
    </div>
  );
}

export function DashboardStatCards() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div className="dash-stat-grid" ref={ref}>
      {DASHBOARD_STATS.map((s) => (
        <StatCard key={s.label} {...s} animate={inView} />
      ))}
    </div>
  );
}
