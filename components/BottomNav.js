"use client";

import Link from "next/link";
import {
  HomeIcon,
  CompassIcon,
  DexScreenerIcon,
  SwapIcon,
  RocketIcon,
  DropletIcon,
  WalletIcon,
} from "@/components/icons";

const TABS = [
  { label: "Home", icon: HomeIcon, route: "/" },
  { label: "Discover", icon: CompassIcon, route: "/discover" },
  { label: "DEX Screener", icon: DexScreenerIcon, route: "/dex" },
  { label: "Launchpad", icon: RocketIcon, route: null },
  { label: "Swap", icon: SwapIcon, route: "/swap" },
  { label: "Liquidity", icon: DropletIcon, route: "/liquidity" },
  { label: "Wallet", icon: WalletIcon, route: "/wallet" },
];

export default function BottomNav({ active = "Home", onSelect }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-bg-border bg-bg-panel/95 px-1 py-2.5 backdrop-blur">
      {TABS.map(({ label, icon: Icon, route }) => {
        const isActive = label === active;
        const className = `flex flex-col items-center gap-1 px-1.5 py-1 text-[9.5px] ${
          isActive ? "text-accent-purple" : "text-white/50"
        }`;

        if (route) {
          return (
            <Link key={label} href={route} className={className}>
              <Icon width="19" height="19" />
              {label}
            </Link>
          );
        }

        return (
          <button key={label} onClick={() => onSelect?.(label)} className={className}>
            <Icon width="19" height="19" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
