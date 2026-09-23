"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#channels", label: "Channels" },
  { href: "#guarantee", label: "Guarantee" },
  { href: "#faq", label: "FAQ" },
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
          <span className="mark" /> StarSource
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <Link className="btn btn-ghost btn-sm" href="/login">
            Sign in
          </Link>
          <Link className="btn btn-primary btn-sm" href="/scan">
            Get a free market scan
          </Link>
        </div>
      </div>
    </nav>
  );
}
