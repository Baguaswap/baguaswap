"use client";

import { useEffect, useState } from "react";
import { useLaunchpadPriceHistory, CHART_INTERVALS, pickDefaultIntervalKey } from "@/lib/launchpadChart";
import { formatCompactNumber, formatTinyPrice } from "@/lib/format";
import { SwapIcon } from "@/components/icons";
import CoinCandlestickChart from "@/components/CoinCandlestickChart";

// Market cap / price header (switchable), 24h change + ATH gauge, a
// timeframe switcher, and the candlestick chart, for the Launchpad coin
// detail page. No buy button here on purpose — this section is read-only
// market info.
export default function CoinMarketPanel({ address }) {
  const [viewMode, setViewMode] = useState("mcap"); // "mcap" | "price"

  // null until the token's actual age is known, so the very first render
  // doesn't flash a fixed default before snapping to the age-appropriate
  // one. Once set, it's fully user-controlled from the row below.
  const [interval, setIntervalState] = useState(null);
  const { data, loading } = useLaunchpadPriceHistory(address, interval ?? "15m");

  useEffect(() => {
    if (interval == null && data?.launchMs) {
      setIntervalState(pickDefaultIntervalKey(Date.now() - data.launchMs));
    }
  }, [interval, data?.launchMs]);

  if (loading && !data) {
    return (
      <div className="mt-3 rounded-2xl bg-bg-panel card-border p-5">
        <div className="h-6 w-32 animate-pulse rounded bg-bg-card" />
        <div className="mt-4 h-48 animate-pulse rounded-xl bg-bg-card" />
      </div>
    );
  }

  if (!data?.hasHistory) {
    return (
      <div className="mt-3 rounded-2xl bg-bg-panel card-border p-6 text-center">
        <p className="text-sm text-white/50">Belum ada histori trading untuk koin ini.</p>
      </div>
    );
  }

  const { candles, currentMarketCapUsd, currentPriceUsd, athMarketCapUsd, changePct24h, changeAbsUsd24h } = data;

  const isUp = (changePct24h ?? 0) >= 0;
  const athRatio = athMarketCapUsd ? Math.min(1, Math.max(0, currentMarketCapUsd / athMarketCapUsd)) : 0;

  return (
    <div className="mt-3 rounded-2xl bg-bg-panel card-border p-5">
      <button
        onClick={() => setViewMode((m) => (m === "mcap" ? "price" : "mcap"))}
        className="flex items-center gap-1.5 text-xs font-medium text-white/40"
      >
        {viewMode === "mcap" ? "Market Cap" : "Harga Coin"}
        <SwapIcon width="14" height="14" />
      </button>

      <p className="mt-1 font-display text-2xl font-bold text-white">
        {viewMode === "mcap" ? `$${formatCompactNumber(currentMarketCapUsd)}` : formatTinyPrice(currentPriceUsd)}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {changePct24h != null && (
          <span className={`shrink-0 text-xs font-semibold ${isUp ? "text-accent-green" : "text-accent-red"}`}>
            {isUp ? "+" : "-"}${formatCompactNumber(Math.abs(changeAbsUsd24h))} ({isUp ? "+" : ""}
            {changePct24h.toFixed(2)}%) 24j
          </span>
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-card">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-green/40 to-accent-green"
            style={{ width: `${athRatio * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-white/40">ATH ${formatCompactNumber(athMarketCapUsd)}</span>
      </div>

      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {CHART_INTERVALS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setIntervalState(key)}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              (interval ?? "15m") === key
                ? "bg-accent-green/15 text-accent-green"
                : "text-white/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        <CoinCandlestickChart data={candles} />
      </div>
    </div>
  );
}
