"use client";

import { useRouter } from "next/navigation";
import { FlameIcon, TrendingUpIcon } from "@/components/icons";
import { HOT_LAUNCHPAD_TOKENS } from "@/lib/mockLaunchpadTokens";

function TokenAvatar({ label, color }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-bg"
      style={{ backgroundColor: color }}
    >
      {label.slice(0, 2)}
    </div>
  );
}

function PriceChange({ change }) {
  const isPositive = !change.startsWith("-");
  return (
    <span
      className={`flex items-center gap-0.5 text-[11px] font-semibold ${
        isPositive ? "text-accent-green" : "text-accent-red"
      }`}
    >
      <TrendingUpIcon width="11" height="11" className={isPositive ? "" : "rotate-180"} />
      {change}
    </span>
  );
}

function BondingProgress({ value }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] text-white/50">
        <span>Bonding Curve</span>
        <span className="font-medium text-white/80">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-gold to-accent-purple"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function HotLaunchpad() {
  const router = useRouter();

  return (
    <section className="mx-4 mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
            <FlameIcon className="text-accent-gold" />
            Hot Launchpad
          </h2>
          <p className="text-xs text-white/50">Newest meme coins on Bagua Swap</p>
        </div>
        <a href="#" className="text-sm font-medium text-accent-purple">
          View All
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HOT_LAUNCHPAD_TOKENS.map((token) => (
          <button
            key={token.symbol}
            onClick={() => router.push(`/coin/launchpad/${token.contractAddress}`)}
            className="rounded-xl bg-bg-card card-border p-4 text-left"
          >
            <div className="mb-2 flex items-start justify-between">
              <TokenAvatar label={token.symbol} color={token.avatarColor} />
              <span className="rounded-md bg-accent-gold/15 px-2 py-0.5 text-[10px] font-medium text-accent-gold">
                Hot
              </span>
            </div>
            <p className="font-display text-sm font-bold text-white">{token.name}</p>
            <p className="text-xs text-white/40">{token.symbol}</p>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{token.price}</span>
              <PriceChange change={token.change} />
            </div>

            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Market Cap</span>
                <span className="text-white/80">{token.marketCap}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Liquidity</span>
                <span className="text-white/80">{token.liquidity}</span>
              </div>
            </div>

            <BondingProgress value={token.bondingProgress} />

            <span className="mt-3 block w-full rounded-lg bg-accent-purple/15 py-2 text-center text-xs font-semibold text-accent-violet">
              Trade Now
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
