"use client";

import { FlameIcon, ZapIcon, TrendingUpIcon, ShieldCheckIcon } from "@/components/icons";
import { useBurnStats } from "@/lib/burnStats";
import { formatCompactNumber } from "@/lib/format";

// "Gas Sponsored", "Volume", and "Assets Protected" stay "Soon" — there's no
// paymaster/sponsorship contract, no swap-volume indexer, and no defined
// on-chain meaning for "assets protected" anywhere in the deployed contracts
// yet, so there's no real number to show for them. "Burned" below is wired
// to the live BaguaBuybackBurn burn log instead of a placeholder.
const OTHER_STATS = [
  { id: "gas", label: "Gas Sponsored", value: "Soon", icon: ZapIcon, live: false, tint: "text-accent-violet border-accent-purple/40" },
  { id: "volume", label: "Volume", value: "Soon", icon: TrendingUpIcon, live: false, tint: "text-white/70 border-white/25" },
  { id: "assets", label: "Assets Protected", value: "Soon", icon: ShieldCheckIcon, live: false, tint: "text-accent-violet border-accent-purple/40" },
];

export default function HeroStats() {
  const { data, loading } = useBurnStats();
  const burnedValue = !data.configured ? "Soon" : loading ? "..." : formatCompactNumber(data.totalBurned);

  const HERO_STATS = [
    {
      id: "burned",
      label: "Burned",
      value: burnedValue,
      icon: FlameIcon,
      live: data.configured && !loading,
      tint: "text-accent-gold border-accent-gold/40",
    },
    ...OTHER_STATS,
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
      {HERO_STATS.map(({ id, icon: Icon, label, value, live, tint }) => (
        <div
          key={id}
          className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-1 py-2.5 text-center transition-colors duration-200 hover:border-white/20 sm:gap-1.5 sm:py-3"
        >
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${tint} sm:h-7 sm:w-7`}>
            <Icon width="11" height="11" />
          </div>
          <p className="text-[9px] leading-tight text-white/50 sm:text-[10px]">{label}</p>
          <p
            className={`font-display text-[11px] font-bold leading-none sm:text-xs ${
              live ? "text-white" : "text-accent-gold"
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

