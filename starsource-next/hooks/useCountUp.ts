"use client";
import { useEffect, useState } from "react";

interface CountUpOptions {
  dec?: number;
  prefix?: string;
  suffix?: string;
  dur?: number;
}

/** Eases a number from 0 → target (once `active` is true) and returns it formatted. */
export function useCountUp(target: number, active: boolean, opts: CountUpOptions = {}) {
  const { dec = 0, prefix = "", suffix = "", dur = 1400 } = opts;
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setVal(target * eased);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, dur]);

  return (
    prefix +
    val.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) +
    suffix
  );
}
