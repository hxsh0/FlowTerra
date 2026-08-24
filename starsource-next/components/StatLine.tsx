"use client";
import { STAT_LINE } from "@/lib/data";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

function Stat({ s }: { s: (typeof STAT_LINE)[number] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const val = useCountUp(s.value, inView, { dec: s.dec, prefix: s.prefix, suffix: s.suffix });
  return (
    <div className="s reveal in" ref={ref}>
      <div className="v tnum">{val}</div>
      <div className="k">{s.label}</div>
    </div>
  );
}

export function StatLine() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap-wide">
        <div className="statline">
          {STAT_LINE.map((s, i) => (
            <Stat key={i} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
