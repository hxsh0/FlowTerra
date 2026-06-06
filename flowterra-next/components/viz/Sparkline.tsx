"use client";
import { useEffect, useRef } from "react";

/** Tiny static sparkline that draws itself in on mount. */
export function Sparkline({ className, up = true }: { className?: string; up?: boolean }) {
  const ref = useRef<SVGPathElement>(null);
  const dRef = useRef<string>("");
  const w = 76;
  const h = 30;
  const n = 18;

  if (!dRef.current) {
    let v = 0.5;
    const data: number[] = [];
    for (let i = 0; i < n; i++) {
      v = Math.min(0.92, Math.max(0.1, v + (Math.random() - (up ? 0.38 : 0.5)) * 0.22));
      data.push(v);
    }
    const p = data.map((d, i) => [(i / (n - 1)) * w, (1 - d) * (h - 4) + 2]);
    let dd = `M ${p[0][0]} ${p[0][1]}`;
    p.slice(1).forEach((q) => (dd += ` L ${q[0]} ${q[1]}`));
    dRef.current = dd;
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.strokeDasharray = "240";
    el.style.strokeDashoffset = "240";
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.3s ease";
      el.style.strokeDashoffset = "0";
    });
  }, []);

  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path
        ref={ref}
        d={dRef.current}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
