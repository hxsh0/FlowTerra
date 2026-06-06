"use client";
import { useEffect, useId, useRef, type CSSProperties } from "react";
import { useMotion } from "@/lib/visual";

interface Props {
  /** number of points in the window */
  n?: number;
  strokeWidth?: number;
  fill?: boolean;
  /** self-advance the series on an interval */
  live?: boolean;
  tickMs?: number;
  vw?: number;
  vh?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Smoothed live area chart. The series is a gentle random walk; when `live`
 * it shifts a new point in every `tickMs` and tweens to it with rAF — giving
 * the "live monitor" feel without a charting dependency.
 */
export function LiveAreaChart({
  n = 40,
  strokeWidth = 2,
  fill = true,
  live = false,
  tickMs = 1300,
  vw = 600,
  vh = 220,
  className,
  style,
}: Props) {
  const gid = "grad-" + useId().replace(/:/g, "");
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const dataRef = useRef<number[]>([]);
  const dispRef = useRef<number[]>([]);
  const motion = useMotion();
  const motionRef = useRef(motion);
  motionRef.current = motion;

  // seed once
  if (dataRef.current.length === 0) {
    let v = 0.35;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      v = Math.min(0.95, Math.max(0.12, v + (Math.random() - 0.42) * 0.12));
      arr.push(v);
    }
    dataRef.current = arr;
    dispRef.current = arr.slice();
  }

  const pad = 6;
  const toPts = (arr: number[]): [number, number][] =>
    arr.map((val, i) => [
      pad + (i / (arr.length - 1)) * (vw - pad * 2),
      pad + (1 - val) * (vh - pad * 2),
    ]);
  const buildPath = (p: [number, number][]) => {
    if (!p.length) return "";
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1];
      const b = p[i];
      const cx = (a[0] + b[0]) / 2;
      d += ` C ${cx} ${a[1]} ${cx} ${b[1]} ${b[0]} ${b[1]}`;
    }
    return d;
  };
  const render = (arr: number[]) => {
    const p = toPts(arr);
    const d = buildPath(p);
    lineRef.current?.setAttribute("d", d);
    if (fill && areaRef.current) {
      areaRef.current.setAttribute("d", `${d} L ${p[p.length - 1][0]} ${vh} L ${p[0][0]} ${vh} Z`);
    }
    const last = p[p.length - 1];
    if (dotRef.current) {
      dotRef.current.setAttribute("cx", String(last[0]));
      dotRef.current.setAttribute("cy", String(last[1]));
    }
  };

  useEffect(() => {
    render(dispRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tween = (to: number[]) => {
      const from = dispRef.current.slice();
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 600);
        const e = 1 - Math.pow(1 - k, 3);
        dispRef.current = from.map((v, i) => v + (to[i] - v) * e);
        render(dispRef.current);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const tick = () => {
      if (motionRef.current) {
        const last = dataRef.current[dataRef.current.length - 1];
        const nv = Math.min(0.97, Math.max(0.08, last + (Math.random() - 0.4) * 0.16));
        dataRef.current = [...dataRef.current.slice(1), nv];
        tween(dataRef.current.slice());
      }
      timer = setTimeout(tick, tickMs);
    };
    timer = setTimeout(tick, tickMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [live, tickMs]);

  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path ref={areaRef} fill={`url(#${gid})`} />}
      <path
        ref={lineRef}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle ref={dotRef} r={3.4} fill="var(--accent)" />
    </svg>
  );
}
