"use client";
import { useInView } from "@/hooks/useInView";
import type { CSSProperties, ReactNode } from "react";

/** Fades + lifts its children into place once scrolled into view. */
export function Reveal({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}
