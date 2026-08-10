"use client";

import { useState } from "react";

let rippleId = 0;

export default function RippleButton({ onClick, className, children }) {
  const [ripples, setRipples] = useState([]);

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const id = rippleId++;
    const ripple = {
      id,
      size,
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
    };
    setRipples((prev) => [...prev, ripple]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
    onClick?.(e);
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="hero-btn-ripple"
          style={{ width: r.size, height: r.size, left: r.x, top: r.y }}
        />
      ))}
    </button>
  );
}
