"use client";

import { useEffect } from "react";

export default function useHeroParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarsePointer || reduceMotion) return;

    let raf = null;

    function handlePointerMove(e) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.style.setProperty("--px", (x / rect.width - 0.5).toFixed(3));
        el.style.setProperty("--py", (y / rect.height - 0.5).toFixed(3));
        raf = null;
      });
    }

    function handlePointerLeave() {
      el.style.setProperty("--px", 0);
      el.style.setProperty("--py", 0);
    }

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}
