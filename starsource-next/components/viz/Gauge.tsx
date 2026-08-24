"use client";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

/** Radial progress gauge. `value` is 0..1. Fills when scrolled into view. */
export function Gauge({ value }: { value: number }) {
  const { ref, inView } = useInView<SVGSVGElement>({ threshold: 0.3 });
  const sz = 120;
  const r = 50;
  const cx = sz / 2;
  const cy = sz / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    if (inView) setOffset(circ * (1 - value));
  }, [inView, value, circ]);

  return (
    <svg ref={ref} viewBox={`0 0 ${sz} ${sz}`} style={{ width: 120, height: 120, flex: "none" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth="9" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="9"
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{
          strokeDasharray: circ,
          strokeDashoffset: offset,
          transition: "stroke-dashoffset 1.4s cubic-bezier(.2,.7,.3,1)",
        }}
      />
    </svg>
  );
}
