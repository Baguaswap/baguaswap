"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CompassIcon,
  RocketIcon,
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ZapIcon,
  FilterIcon,
  StarIcon,
  CopyIcon,
} from "@/components/icons";
import {
  RECENTLY_LAUNCHED_TOKENS,
  TOP_GAINERS_TOKENS,
  NEW_THIS_WEEK_TOKENS,
} from "@/lib/mockLaunchpadTokens";

const FILTERS = ["Latest", "Hot", "Top Gainers", "Most Visited", "Following"];

function LaunchCard({ item, onClick }) {
  return (
    <button onClick={onClick} className="w-40 shrink-0 overflow-hidden rounded-xl bg-bg-card card-border text-left">
      <div
        className="relative flex h-28 items-center justify-center text-2xl font-bold text-bg"
        style={{ backgroundColor: item.avatarColor }}
      >
        <span className="absolute left-2 top-2 rounded-md bg-accent-green/90 px-1.5 py-0.5 text-[9px] font-bold text-bg">
          NEW
        </span>
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/40 px-1.5 py-0.5 text-[9px] text-white">
          <ClockIcon width="10" height="10" />
          {item.minutes}
        </span>
        {item.name.slice(0, 2)}
      </div>
      <div className="p-2.5">
        <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
        <p className="truncate text-[11px] text-white/40">{item.sub}</p>
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <span className="text-white/80">{item.price}</span>
          <span className="font-medium text-accent-green">{item.change}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
          <span>MC {item.mc}</span>
          <span>TXNS {item.txns}</span>
        </div>
      </div>
    </button>
  );
}

export default function DiscoverView({ onComingSoon }) {
  const router = useRouter();
  const [filter, setFilter] = useState("Latest");
  const [watchlist, setWatchlist] = useState({});
  const [copied, setCopied] = useState(null);

  const handleFilter = (label) => {
    if (label === "Latest") {
      setFilter(label);
    } else {
      onComingSoon?.(label);
    }
  };

  const toggleWatch = (address) => {
    setWatchlist((prev) => ({ ...prev, [address]: !prev[address] }));
  };

  const handleCopy = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard not available — ignore silently.
    }
  };

  const goToCoin = (contractAddress) => {
    router.push(`/coin/launchpad/${contractAddress}`);
  };

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="hero-glow relative overflow-hidden rounded-2xl bg-bg-panel card-border p-5">
        <h1 className="font-display text-2xl font-bold text-white">Discover</h1>
        <p className="mt-1 max-w-[70%] text-sm text-white/60">
          Discover the newest meme coins launched on <span className="text-accent-purple">Bagua Launchpad</span>
        </p>
        <span className="absolute right-6 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
          <CompassIcon width="32" height="32" />
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((label) => (
          <button
            key={label}
            onClick={() => handleFilter(label)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium ${
              filter === label ? "bg-accent-purple text-white" : "bg-bg-card card-border text-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onComingSoon?.("All Chains")}
          className="flex flex-1 items-center gap-2 rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white/80"
        >
          <ZapIcon width="15" height="15" className="text-accent-purple" />
          All Chains
          <ChevronDownIcon width="14" height="14" className="ml-auto" />
        </button>
        <button
          onClick={() => onComingSoon?.("Time Range")}
          className="flex flex-1 items-center gap-2 rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white/80"
        >
          <CalendarIcon width="15" height="15" className="text-accent-purple" />
          24H
          <ChevronDownIcon width="14" height="14" className="ml-auto" />
        </button>
        <button
          onClick={() => onComingSoon?.("Filters")}
          aria-label="Filters"
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-bg-card card-border text-white/70"
        >
          <FilterIcon width="16" height="16" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RocketIcon width="16" height="16" className="text-accent-purple" />
          <h2 className="text-sm font-bold text-white">Recently Launched</h2>
        </div>
        <button onClick={() => onComingSoon?.("Recently Launched")} className="text-xs font-medium text-accent-purple">
          View All →
        </button>
      </div>
      <p className="mt-0.5 text-xs text-white/40">New coins launched on Bagua Launchpad</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {RECENTLY_LAUNCHED_TOKENS.map((item) => (
          <LaunchCard key={item.name} item={item} onClick={() => goToCoin(item.contractAddress)} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUpIcon width="16" height="16" className="text-accent-green" />
          <h2 className="text-sm font-bold text-white">Top Gainers (24H)</h2>
        </div>
        <button onClick={() => onComingSoon?.("Top Gainers")} className="text-xs font-medium text-accent-purple">
          View All →
        </button>
      </div>
      <div className="mt-2 divide-y divide-bg-border">
        {TOP_GAINERS_TOKENS.map((t) => (
          <div
            key={t.address}
            role="button"
            tabIndex={0}
            onClick={() => goToCoin(t.contractAddress)}
            onKeyDown={(e) => e.key === "Enter" && goToCoin(t.contractAddress)}
            className="grid cursor-pointer grid-cols-[0.25fr_1.6fr_1fr_1fr_0.3fr] items-center gap-2 py-3"
          >
            <span className="text-sm font-bold text-white/40">{t.rank}</span>
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-bg"
                style={{ backgroundColor: t.avatarColor }}
              >
                {t.name.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <span className="flex items-center gap-1">
                  <p className="truncate text-[13px] font-semibold text-white">{t.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(t.address);
                    }}
                    aria-label="Copy contract address"
                    className="shrink-0 text-white/30 hover:text-white"
                  >
                    <CopyIcon width="12" height="12" />
                  </button>
                </span>
                <p className="truncate text-[11px] text-white/40">
                  {copied === t.address ? "Copied!" : t.sub}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-white">{t.price}</p>
              <p className="text-[11px] font-medium text-accent-green">{t.change}</p>
            </div>
            <div className="text-right text-[11px] text-white/50">
              <p>MC {t.mc}</p>
              <p>TXNS {t.txns}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatch(t.address);
              }}
              aria-label="Toggle watchlist"
              className="flex justify-end"
            >
              <StarIcon
                width="16"
                height="16"
                className={watchlist[t.address] ? "text-accent-gold" : "text-white/30"}
                fill={watchlist[t.address] ? "currentColor" : "none"}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarIcon width="16" height="16" className="text-accent-violet" />
          <h2 className="text-sm font-bold text-white">New This Week</h2>
        </div>
        <button onClick={() => onComingSoon?.("New This Week")} className="text-xs font-medium text-accent-purple">
          View All →
        </button>
      </div>
      <p className="mt-0.5 text-xs text-white/40">Hand-picked new gems from this week</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {NEW_THIS_WEEK_TOKENS.map((item) => (
          <button
            key={item.name}
            onClick={() => goToCoin(item.contractAddress)}
            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-bg"
            style={{ backgroundColor: item.avatarColor }}
          >
            <span className="absolute left-1.5 top-1.5 rounded-md bg-accent-green/90 px-1 py-0.5 text-[8px] font-bold text-bg">
              NEW
            </span>
            <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-black/40 px-1 py-0.5 text-[8px] text-white">
              <ClockIcon width="8" height="8" />
              {item.hours}
            </span>
            {item.name.slice(0, 2)}
          </button>
        ))}
      </div>
    </section>
  );
}
