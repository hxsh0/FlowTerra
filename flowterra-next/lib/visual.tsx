"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SETTINGS = {
  style: "signal" as const,
  accent: "#f97316",
  density: "regular" as const,
  motion: true,
};

type VisualCtx = typeof SETTINGS;

const VisualContext = createContext<VisualCtx>(SETTINGS);

export function VisualProvider({ children }: { children: React.ReactNode }) {
  return (
    <VisualContext.Provider value={SETTINGS}>{children}</VisualContext.Provider>
  );
}

export function useVisual() {
  return useContext(VisualContext);
}

export function useMotion() {
  const { motion } = useVisual();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return motion && !reduced;
}
