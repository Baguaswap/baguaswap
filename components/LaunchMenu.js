"use client";

import { BountyIcon, BroadcastIcon, CoinIcon, CloseIcon } from "@/components/icons";

const MENU_ITEMS = [
  { label: "Post bounty", icon: BountyIcon },
  { label: "Go live", icon: BroadcastIcon },
  { label: "Create coin", icon: CoinIcon },
];

export default function LaunchMenu({ open, onClose, onSelect }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <button
        aria-label="Close launch menu overlay"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative mb-24 w-[88%] max-w-xs overflow-hidden rounded-2xl bg-bg-panel card-border shadow-glow">
        <div className="flex items-center justify-between border-b border-bg-border px-4 py-3">
          <span className="font-display text-sm font-bold text-white">Launchpad</span>
          <button
            onClick={onClose}
            aria-label="Close launch menu"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white"
          >
            <CloseIcon width="16" height="16" />
          </button>
        </div>

        <div className="p-2">
          {MENU_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => onSelect?.(label)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-white/90 hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
                <Icon width="20" height="20" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
