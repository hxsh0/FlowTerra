"use client";
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
}

/** A quiet, fixed field of stars. Twinkles subtly; freezes for reduced motion. */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let raf = 0;

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const count = Math.round((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.3,
        base: Math.random() * 0.5 + 0.25,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const twinkle = reduceMotion ? 0 : Math.sin(t / 1800 + s.phase) * 0.22;
        ctx.globalAlpha = Math.max(0, s.base + twinkle);
        ctx.fillStyle = "#f2ede1";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
