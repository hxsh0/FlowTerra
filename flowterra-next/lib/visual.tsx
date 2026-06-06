"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { VisualSettings } from "./types";

const STORAGE_KEY = "flowterra:visual";

const DEFAULTS: VisualSettings = {
  style: "signal",
  accent: "#f97316",
  density: "regular",
  motion: true,
};

export const ACCENTS = ["#f97316", "#eab308", "#38bdf8", "#34d399", "#a78bfa"];

type VisualContextValue = VisualSettings & {
  set: (patch: Partial<VisualSettings>) => void;
};

const VisualContext = createContext<VisualContextValue | null>(null);

function applyToDocument(s: VisualSettings) {
  const root = document.documentElement;
  root.setAttribute("data-style", s.style);
  root.setAttribute("data-density", s.density);
  root.setAttribute("data-motion", s.motion ? "on" : "off");
  root.style.setProperty("--accent", s.accent);
}

export function VisualProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VisualSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as VisualSettings;
        setSettings(parsed);
        applyToDocument(parsed);
      } else {
        applyToDocument(DEFAULTS);
      }
    } catch {
      applyToDocument(DEFAULTS);
    }
  }, []);

  const set = useCallback((patch: Partial<VisualSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      applyToDocument(next);
      return next;
    });
  }, []);

  return (
    <VisualContext.Provider value={{ ...settings, set }}>{children}</VisualContext.Provider>
  );
}

export function useVisual() {
  const ctx = useContext(VisualContext);
  if (!ctx) throw new Error("useVisual must be used within VisualProvider");
  const { set, ...settings } = ctx;
  return { settings, set };
}

export function useMotion() {
  const ctx = useContext(VisualContext);
  return ctx?.motion ?? true;
}
