"use client";

import { useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  SendIcon,
  ReceiveIcon,
  SwapIcon,
  BridgeIcon,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
  DiamondIcon,
  PieChartIcon,
} from "@/components/icons";

const OVERVIEW = { value: "$24,560.78", change: "+$1,254.32", changePct: "+5.38%" };

const BAGUA_BALANCE = {
  amount: "12,450.25",
  usd: "$2,345.68",
  changePct: "+12.34%",
  points: [10, 14, 12, 18, 15, 22, 18, 26, 30, 26, 34, 30, 38, 34, 44],
};

const SUB_TABS = ["Tokens", "NFTs", "DeFi Positions", "History"];

const TOKENS = [
  { symbol: "ETH", name: "Ethereum", amount: "2.4567", usd: "$7,895.32", change: "+4.21%", positive: true, kind: "diamond", color: "#8B5CF6", points: [10, 14, 12, 16, 14, 18, 16, 20] },
  { symbol: "BAGUA", name: "Bagua Swap", amount: "12,450.25", usd: "$2,345.68", change: "+12.34%", positive: true, kind: "logo", points: [8, 16, 12, 20, 16, 26, 20, 30] },
  { symbol: "USDT", name: "Tether USD", amount: "4,250.12", usd: "$4,250.12", change: "+0.01%", positive: true, kind: "initials", color: "#22C55E", points: [16, 17, 16, 18, 16, 17, 16, 17] },
  { symbol: "USDC", name: "USD Coin", amount: "2,100.00", usd: "$2,100.00", change: "-0.02%", positive: false, kind: "initials", color: "#2563EB", points: [18, 15, 17, 14, 16, 13, 15, 12] },
  { symbol: "PEPE", name: "Pepe", amount: "15,231,000", usd: "$1,523.10", change: "+8.45%", positive: true, kind: "initials", color: "#22C55E", points: [10, 14, 11, 18, 14, 22, 17, 26] },
  { symbol: "WETH", name: "Wrapped ETH", amount: "0.5689", usd: "$1,820.56", change: "+3.31%", positive: true, kind: "initials", color: "#EC4899", points: [12, 15, 13, 17, 14, 19, 16, 21] },
];

const SUMMARY = { totalAssets: "$24,560.78", change24h: "+$1,254.32", unrealizedPnl: "+$2,345.68", holdings: "18 Tokens" };

const ACTIONS = [
  { label: "Send", icon: SendIcon, key: "Send" },
  { label: "Receive", icon: ReceiveIcon, key: "Receive" },
  { label: "Swap", icon: SwapIcon, key: "Swap" },
  { label: "Bridge", icon: BridgeIcon, key: "Bridge" },
];

function MiniSparkline({ points, color }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 60;
  const h = 24;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / (max - min || 1)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-14" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function TokenAvatar({ token }) {
  if (token.kind === "logo") {
    return <img src="/logo.png" alt={token.symbol} className="h-9 w-9 shrink-0 rounded-full" />;
  }
  if (token.kind === "diamond") {
    return (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${token.color}25` }}
      >
        <DiamondIcon width="17" height="17" style={{ color: token.color }} />
      </span>
    );
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-bg"
      style={{ backgroundColor: token.color }}
    >
      {token.symbol.slice(0, 2)}
    </span>
  );
}

export default function WalletView({ onComingSoon, onSwap }) {
  const [hideBalance, setHideBalance] = useState(false);
  const [subTab, setSubTab] = useState("Tokens");
  const [query, setQuery] = useState("");

  const handleAction = (key) => {
    if (key === "Swap") {
      onSwap?.();
    } else {
      onComingSoon?.(key);
    }
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
    return t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
  });

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="hero-glow relative overflow-hidden rounded-2xl bg-bg-panel card-border p-5">
        <div className="flex items-center gap-1.5 text-sm text-white/60">
          Wallet Overview
          <button
            onClick={() => setHideBalance((v) => !v)}
            aria-label="Toggle balance visibility"
            className="text-white/40 hover:text-white"
          >
            {hideBalance ? <EyeOffIcon width="14" height="14" /> : <EyeIcon width="14" height="14" />}
          </button>
        </div>
        <p className="mt-1 font-display text-3xl font-bold text-white">
          {hideBalance ? "••••••" : OVERVIEW.value}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-sm">
          <span className="font-medium text-accent-green">
            {hideBalance ? "••••" : `${OVERVIEW.change} (${OVERVIEW.changePct})`}
          </span>
          <span className="rounded-full bg-bg-card px-2 py-0.5 text-xs text-white/50">24H</span>
        </div>
        <img
          src="/logo.png"
          alt="Bagua Swap logo"
          className="absolute -right-3 -top-3 h-24 w-24 rounded-full opacity-90"
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {ACTIONS.map(({ label, icon: Icon, key }) => (
          <button
            key={key}
            onClick={() => handleAction(key)}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-card card-border py-3 text-xs font-medium text-white/80"
          >
            <Icon className="text-accent-purple" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-bg-card card-border p-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Bagua Swap logo" className="h-11 w-11 rounded-full" />
          <div>
            <p className="text-sm text-white/60">My BAGUA Balance</p>
            <p className="font-display text-xl font-bold text-white">
              {hideBalance ? "••••••" : BAGUA_BALANCE.amount}{" "}
              <span className="text-accent-purple">BAGUA</span>
            </p>
            <p className="text-xs text-white/50">
              ≈ {hideBalance ? "••••" : BAGUA_BALANCE.usd}{" "}
              <span className="font-medium text-accent-green">{BAGUA_BALANCE.changePct}</span>{" "}
              <span className="text-white/30">24H</span>
            </p>
          </div>
        </div>
        <MiniSparkline points={BAGUA_BALANCE.points} color="#A78BFA" />
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

      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-bg-card card-border px-3 py-2.5">
          <SearchIcon width="16" height="16" className="shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search token"
            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
        </div>
        <button
          onClick={() => onComingSoon?.("Networks")}
          className="flex items-center gap-1.5 rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white/80"
        >
          All Networks
          <ChevronDownIcon width="14" height="14" />
        </button>
        <button
          onClick={() => onComingSoon?.("Filters")}
          aria-label="Filters"
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-bg-card card-border text-white/70"
        >
          <FilterIcon width="16" height="16" />
        </button>
      </div>

      <div className="mt-2 divide-y divide-bg-border">
        {filteredTokens.map((t) => (
          <div key={t.symbol} className="grid grid-cols-[1.6fr_1fr_0.7fr_0.6fr_0.2fr] items-center gap-2 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <TokenAvatar token={t} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">{t.symbol}</p>
                <p className="truncate text-[11px] text-white/40">{t.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-white">
                {hideBalance ? "••••" : t.amount}
              </p>
              <p className="text-[11px] text-white/40">{hideBalance ? "••••" : t.usd}</p>
            </div>
            <div className={`text-right text-[12px] font-medium ${t.positive ? "text-accent-green" : "text-accent-red"}`}>
              {t.change}
            </div>
            <div className="flex justify-end">
              <MiniSparkline points={t.points} color={t.positive ? "#22C55E" : "#EF4444"} />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onComingSoon?.("Token options")}
                aria-label="Token options"
                className="text-white/40 hover:text-white"
              >
                <MoreVerticalIcon />
              </button>
            </div>
          </div>
        ))}

        {filteredTokens.length === 0 && (
          <p className="py-6 text-center text-sm text-white/40">No tokens match your search.</p>
        )}
      </div>

      <button
        onClick={() => onComingSoon?.("Manage Tokens")}
        className="mt-3 flex w-full items-center justify-between rounded-xl bg-bg-card card-border px-4 py-3 text-sm font-semibold text-accent-purple"
      >
        Manage Tokens
        <ChevronDownIcon width="16" height="16" className="-rotate-90" />
      </button>

      <div className="mt-4 rounded-xl bg-bg-card card-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-bold text-white">Wallet Summary</h3>
          <button
            onClick={() => onComingSoon?.("Wallet Summary")}
            aria-label="View wallet summary details"
            className="text-white/40 hover:text-white"
          >
            <ChevronDownIcon width="16" height="16" className="-rotate-90" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-white/50">Total Assets</p>
            <p className="text-sm font-semibold text-white">{SUMMARY.totalAssets}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">24H Change</p>
            <p className="text-sm font-semibold text-accent-green">{SUMMARY.change24h}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">Unrealized PNL</p>
            <p className="text-sm font-semibold text-accent-green">{SUMMARY.unrealizedPnl}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/50">Holdings</p>
              <p className="text-sm font-semibold text-white">{SUMMARY.holdings}</p>
            </div>
            <PieChartIcon className="text-accent-purple" width="20" height="20" />
          </div>
        </div>
      </div>
    </section>
  );
}
