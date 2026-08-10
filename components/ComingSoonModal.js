"use client";

import { ConstructionIcon, CloseIcon } from "@/components/icons";

export default function ComingSoonModal({ feature, onClose }) {
  if (!feature) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <button
        aria-label="Close popup overlay"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-xs rounded-2xl bg-bg-panel card-border p-6 text-center shadow-glow">
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white"
        >
          <CloseIcon width="16" height="16" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
          <ConstructionIcon />
        </div>

        <h3 className="font-display text-lg font-bold text-white">{feature}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          This feature is still under development and will be available soon.
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
