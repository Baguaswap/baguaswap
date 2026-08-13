"use client";

import { useRouter } from "next/navigation";
import { FlameIcon, TrendingUpIcon } from "@/components/icons";
import { useHotLaunchpadTokens } from "@/lib/hotLaunchpad";
import { formatCompactNumber, formatTxCount, formatTinyPrice } from "@/lib/format";

// If two tokens' 24h volumes sit within this fraction of each other
// (default 5%), treat them as "mepet" (too close to call on volume alone)
// and let 24h transaction count (buy+sell) decide instead. This keeps a
// coin that's being traded by lots of wallets from losing its spot just
// because another coin got one big whale buy.
const VOLUME_TIE_THRESHOLD = 0.05;

// Only the top N coins after sorting get the "Hot" badge.
const HOT_BADGE_COUNT = 2;

function getTxCount24h(token) {
  return (token.buyCount24h ?? 0) + (token.sellCount24h ?? 0);
}

// Sort by 24h volume (desc). When two tokens' volumes are within
// VOLUME_TIE_THRESHOLD of each other, break the tie with 24h tx count
// (desc) instead.
function sortByVolumeThenActivity(tokens) {
  return [...tokens].sort((a, b) => {
    const volA = a.volume24h ?? 0;
    const volB = b.volume24h ?? 0;
    const maxVol = Math.max(volA, volB) || 1;
    const relDiff = Math.abs(volA - volB) / maxVol;

    if (relDiff <= VOLUME_TIE_THRESHOLD) {
      const txDiff = getTxCount24h(b) - getTxCount24h(a);
      if (txDiff !== 0) return txDiff;
    }

    return volB - volA;
  });
}

// Deterministic avatar color per contract address, so real on-chain tokens
// (which don't carry a hand-picked avatarColor like the old mock data did)
// still get a stable, distinct-looking color instead of all matching.
function colorFromAddress(address) {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

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
  if (change == null) {
    return <span className="text-[11px] font-semibold text-white/40">New</span>;
  }
  const isPositive = change >= 0;
  const label = `${isPositive ? "+" : ""}${change.toFixed(1)}%`;
  return (
    <span
      className={`flex items-center gap-0.5 text-[11px] font-semibold ${
        isPositive ? "text-accent-green" : "text-accent-red"
      }`}
    >
      <TrendingUpIcon width="11" height="11" className={isPositive ? "" : "rotate-180"} />
      {label}
    </span>
  );
}

function BondingProgress({ value }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] text-white/50">
        <span>Bonding Curve</span>
        <span className="font-medium text-white/80">{value.toFixed(0)}%</span>
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

function HotLaunchpadSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-xl bg-bg-card card-border" />
      ))}
    </div>
  );
}

export default function HotLaunchpad() {
  const router = useRouter();
  const { data, loading } = useHotLaunchpadTokens();
  const sortedTokens = sortByVolumeThenActivity(data.tokens);

  return (
    <section className="mx-4 mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
            <FlameIcon className="text-accent-gold" />
            Hot Launchpad
          </h2>
          <p className="text-xs text-white/50">Ranked by 24h volume &amp; trading activity</p>
        </div>
        <a href="#" className="text-sm font-medium text-accent-purple">
          View All
        </a>
      </div>

      {loading ? (
        <HotLaunchpadSkeleton />
      ) : !data.configured ? (
        <div className="rounded-xl bg-bg-card card-border p-4 text-center text-sm text-white/50">
          Launchpad contracts aren&apos;t configured yet.
        </div>
      ) : sortedTokens.length === 0 ? (
        <div className="rounded-xl bg-bg-card card-border p-4 text-center text-sm text-white/50">
          No tokens have been launched yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sortedTokens.map((token, index) => (
            <button
              key={token.contractAddress}
              onClick={() => router.push(`/coin/launchpad/${token.contractAddress}`)}
              className="rounded-xl bg-bg-card card-border p-4 text-left"
            >
              <div className="mb-2 flex items-start justify-between">
                <TokenAvatar label={token.symbol} color={colorFromAddress(token.contractAddress)} />
                {index < HOT_BADGE_COUNT && (
                  <span className="rounded-md bg-accent-gold/15 px-2 py-0.5 text-[10px] font-medium text-accent-gold">
                    Hot
                  </span>
                )}
              </div>
              <p className="font-display text-sm font-bold text-white">{token.name}</p>
              <p className="text-xs text-white/40">{token.symbol}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {token.priceUsd != null ? formatTinyPrice(token.priceUsd) : "—"}
                </span>
                <PriceChange change={token.change} />
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-white/50">
                  <span>24h Vol</span>
                  <span className="text-white/80">
                    ${formatCompactNumber(token.volume24h)}{" "}
                    <span className="text-white/40">· {formatTxCount(getTxCount24h(token))} txns</span>
                  </span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Market Cap</span>
                  <span className="text-white/80">
                    {token.marketCapUsd != null ? `$${formatCompactNumber(token.marketCapUsd)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Liquidity</span>
                  <span className="text-white/80">
                    {token.liquidityUsd != null ? `$${formatCompactNumber(token.liquidityUsd)}` : "—"}
                  </span>
                </div>
              </div>
              <BondingProgress value={token.bondingProgress} />
              <span className="mt-3 block w-full rounded-lg bg-accent-purple/15 py-2 text-center text-xs font-semibold text-accent-violet">
                Trade Now
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
