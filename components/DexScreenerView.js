"use client";

import { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  FlameIcon,
  StarIcon,
  DiamondIcon,
} from "@/components/icons";

const STATS = [
  { label: "24H Volume", value: "$15.62M", change: "+18.24%", points: [10, 18, 14, 22, 18, 26, 22, 30, 26, 34] },
  { label: "24H Txns", value: "45,231", change: "+12.51%", points: [16, 20, 18, 24, 20, 26, 22, 28, 24, 30] },
  { label: "Liquidity", value: "$8.71M", change: "+7.35%", points: [22, 20, 24, 22, 26, 24, 28, 26, 30, 28] },
  { label: "New Pairs", value: "1,243", change: "+23.18%", points: [8, 14, 12, 20, 16, 24, 20, 28, 24, 32] },
];

const RANGES = ["5M", "1H", "6H", "24H"];

const TRENDING = [
  { symbol: "DOGE BAGUA", change: "+23.45%", color: "#F5B324" },
  { symbol: "PEIPEI", change: "+18.12%", color: "#22C55E" },
  { symbol: "MIAO", change: "+15.32%", color: "#EF4444" },
  { symbol: "WAGMI", change: "+12.10%", color: "#F5B324" },
  { symbol: "PINKY", change: "+9.87%", color: "#EC4899" },
];

const SUB_TABS = ["Tokens", "New Pairs", "Gainers", "Losers", "Watchlist"];

const TOKENS = [
  { name: "DOGE BAGUA", symbol: "WETH", address: "0x12...AbCd", price: "$0.0001245", priceEth: "0.0 18 45 WETH", change: "+23.45%", liquidity: "$842K", volume: "$1.32M", txns: "2,456", color: "#F5B324" },
  { name: "PEIPEI", symbol: "WETH", address: "0x34...dEf1", price: "$0.0000872", priceEth: "0.0 12 31 WETH", change: "+18.12%", liquidity: "$623K", volume: "$923K", txns: "1,842", color: "#22C55E" },
  { name: "MIAO", symbol: "WETH", address: "0x56...Gh12", price: "$0.0000678", priceEth: "0.0 9 81 WETH", change: "+15.32%", liquidity: "$512K", volume: "$812K", txns: "1,532", color: "#EF4444" },
  { name: "WAGMI", symbol: "WETH", address: "0x78...Ij34", price: "$0.0000541", priceEth: "0.0 7 82 WETH", change: "+12.10%", liquidity: "$421K", volume: "$651K", txns: "1,201", color: "#F5B324" },
  { name: "PINKY", symbol: "WETH", address: "0x9A...kL56", price: "$0.0000398", priceEth: "0.0 5 67 WETH", change: "+9.87%", liquidity: "$362K", volume: "$512K", txns: "982", color: "#EC4899" },
  { name: "BOOST", symbol: "WETH", address: "0xAb...Mn78", price: "$0.0000312", priceEth: "0.0 4 45 WETH", change: "+6.64%", liquidity: "$298K", volume: "$421K", txns: "745", color: "#22C55E" },
];

function MiniSparkline({ points }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 120;
  const h = 32;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / (max - min || 1)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-8 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="#A78BFA" strokeWidth="2" />
    </svg>
  );
}

function Avatar({ label, color, rank, size = "h-12 w-12" }) {
  return (
    <div className="relative shrink-0">
      {rank && (
        <span className="absolute -left-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-bg-panel text-[9px] font-bold text-white card-border">
          {rank}
        </span>
      )}
      <div
        className={`flex ${size} items-center justify-center rounded-full text-xs font-bold text-bg`}
        style={{ backgroundColor: color }}
      >
        {label.slice(0, 2)}
      </div>
      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-bg-panel text-accent-violet card-border">
        <DiamondIcon width="9" height="9" />
      </span>
    </div>
  );
}

export default function DexScreenerView({ onComingSoon }) {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("5M");
  const [subTab, setSubTab] = useState("Tokens");
  const [watchlist, setWatchlist] = useState({});

  const toggleWatch = (address) => {
    setWatchlist((prev) => ({ ...prev, [address]: !prev[address] }));
  };

  const handleSubTab = (tab) => {
    if (tab === "Tokens") {
      setSubTab(tab);
    } else {
      onComingSoon?.(tab);
    }
  };

  const filteredTokens = TOKENS.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q) || t.address.toLowerCase().includes(q);
  });

  return (
    <section className="mx-4 mt-4 pb-6">
      <h1 className="font-display text-2xl font-bold text-white">DEX Screener</h1>
      <p className="mt-1 text-sm text-white/60">Discover new tokens and track market data in real-time.</p>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-bg-card card-border px-3 py-2.5">
          <SearchIcon width="16" height="16" className="shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search token, pair, contract..."
            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
        </div>
        <button
          onClick={() => onComingSoon?.("Filters")}
          className="flex items-center gap-1.5 rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white/80"
        >
          <FilterIcon width="15" height="15" />
          Filters
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ label, value, change, points }) => (
          <div key={label} className="rounded-xl bg-bg-card card-border p-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
            <p className="mt-1 font-display text-lg font-bold text-white">{value}</p>
            <span className="text-xs font-medium text-accent-green">{change}</span>
            <MiniSparkline points={points} />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-bg-card card-border p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-white">
            <FlameIcon className="text-accent-gold" width="16" height="16" />
            Trending
          </h2>
          <div className="flex items-center gap-1 rounded-lg bg-bg-panel p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                  range === r ? "bg-accent-purple/20 text-accent-purple" : "text-white/40"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar">
          {TRENDING.map((t, i) => (
            <div key={t.symbol} className="flex shrink-0 flex-col items-center gap-1.5">
              <Avatar label={t.symbol} color={t.color} rank={i + 1} />
              <p className="max-w-[64px] truncate text-[11px] font-semibold text-white">{t.symbol}</p>
              <p className="text-[10px] font-medium text-accent-green">{t.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto border-b border-bg-border no-scrollbar">
        {SUB_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleSubTab(tab)}
            className={`shrink-0 whitespace-nowrap pb-2.5 text-sm font-medium ${
              subTab === tab ? "border-b-2 border-accent-purple text-accent-purple" : "text-white/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-[1.7fr_1fr_0.8fr_0.9fr_0.9fr] gap-1 px-1 pb-2 text-[9px] uppercase tracking-wide text-white/40">
        <span>Pair / Token</span>
        <span className="text-right">Price</span>
        <span className="text-right">24H %</span>
        <span className="text-right">Liquidity</span>
        <span className="text-right">Volume</span>
      </div>

      <div className="divide-y divide-bg-border">
        {filteredTokens.map((t) => (
          <div key={t.address} className="grid grid-cols-[1.7fr_1fr_0.8fr_0.9fr_0.9fr] items-center gap-1 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <button
                onClick={() => toggleWatch(t.address)}
                aria-label="Toggle watchlist"
                className="shrink-0"
              >
                <StarIcon
                  width="14"
                  height="14"
                  className={watchlist[t.address] ? "text-accent-gold" : "text-white/30"}
                  fill={watchlist[t.address] ? "currentColor" : "none"}
                />
              </button>
              <Avatar label={t.name} color={t.color} size="h-8 w-8" />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-white">{t.name}</p>
                <p className="truncate text-[10px] text-white/40">/ {t.symbol}</p>
                <p className="truncate text-[9px] text-white/30">Token {t.address}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-semibold text-white">{t.price}</p>
              <p className="text-[9px] text-white/30">{t.priceEth}</p>
            </div>
            <div className="text-right text-[11px] font-medium text-accent-green">{t.change}</div>
            <div className="text-right text-[11px] text-white/80">{t.liquidity}</div>
            <div className="text-right">
              <p className="text-[11px] text-white/80">{t.volume}</p>
              <p className="text-[9px] text-white/30">Txns {t.txns}</p>
            </div>
          </div>
        ))}

        {filteredTokens.length === 0 && (
          <p className="py-6 text-center text-sm text-white/40">No tokens match your search.</p>
        )}
      </div>
    </section>
  );
}
