"use client";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#console", label: "Console" },
  { href: "#agents", label: "Agents" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#system", label: "System" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} id="nav">
      <div className="wrap-wide">
        <a className="brand" href="#top">
          <span className="mark" /> FlowTerra
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <span className="nav-ver">v2.4 · build 1180</span>
          <a className="btn btn-ghost btn-sm" href="#">
            Sign in
          </a>
          <a className="btn btn-primary btn-sm" href="#">
            Launch console{" "}
            <span className="kbd" style={{ borderColor: "rgba(0,0,0,.25)", color: "#3a2a18" }}>
              ⌘K
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
}
