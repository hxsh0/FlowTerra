"use client";
import { useState } from "react";
import { useVisual, ACCENTS } from "@/lib/visual";
import type { StyleName, Density } from "@/lib/types";

const STYLES: StyleName[] = ["signal", "mono", "editorial"];
const DENSITIES: Density[] = ["compact", "regular", "comfy"];

export function StyleSwitcher() {
  const { settings, set } = useVisual();
  const [open, setOpen] = useState(false);

  return (
    <div className="switcher">
      {open && (
        <div className="switcher-panel">
          <div className="sw-group">
            <div className="sw-label">Visual style</div>
            <div className="seg">
              {STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={settings.style === s ? "on" : ""}
                  onClick={() => set({ style: s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="sw-group">
            <div className="sw-label">Signal color</div>
            <div className="sw-colors">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  style={{ background: c }}
                  className={settings.accent === c ? "on" : ""}
                  onClick={() => set({ accent: c })}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div className="sw-group">
            <div className="sw-label">Density</div>
            <div className="seg">
              {DENSITIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={settings.density === d ? "on" : ""}
                  onClick={() => set({ density: d })}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="sw-group sw-toggle">
            <div className="sw-label">Live motion</div>
            <button
              type="button"
              className={`sw-switch ${settings.motion ? "on" : ""}`}
              onClick={() => set({ motion: !settings.motion })}
              aria-pressed={settings.motion}
            />
          </div>
        </div>
      )}
      <button type="button" className="switcher-toggle" onClick={() => setOpen(!open)}>
        <span className="gear" />
        Customize
      </button>
    </div>
  );
}
