"use client";
import { useInView } from "@/hooks/useInView";

const ROWS = [
  { lbl: "Sourced→Eng", pct: 67 },
  { lbl: "Eng→Reply", pct: 48 },
  { lbl: "Reply→Mtg", pct: 56 },
  { lbl: "Mtg→Won", pct: 34 },
];

/** Horizontal stage-conversion bars that fill in on view. */
export function ConversionBars() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  return (
    <div className="bars" ref={ref}>
      {ROWS.map((r) => (
        <div className="bar-row" key={r.lbl}>
          <span className="lbl">{r.lbl}</span>
          <span className="bar-track">
            <i
              style={{
                width: inView ? `${r.pct}%` : 0,
                transition: "width 1s cubic-bezier(.2,.7,.3,1)",
              }}
            />
          </span>
          <span className="pct">{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}
