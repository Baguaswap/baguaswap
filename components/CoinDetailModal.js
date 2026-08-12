"use client";

import { useState } from "react";
import {
  CloseIcon,
  CopyIcon,
  ShareIcon,
  GlobeIcon,
  XSocialIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/icons";

// This modal is the shared "coin detail" surface for every Launchpad coin
// card (Hot Launchpad on Home, Recently Launched / Top Gainers / New This
// Week on Discover). It only renders the basic, always-available info a
// pump.fun-style coin page shows before you dig into a full chart/trade
// page — avatar, name/ticker, chain, creator, share, contract address,
// socials, and market cap. Per the current design stage, the DEX-side coin
// tab is intentionally NOT wired to this component yet — it will get its
// own, different layout later.

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function CopyRow({ label, value, displayValue }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available — ignore silently.
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex w-full items-center justify-between rounded-xl bg-bg-card card-border px-3.5 py-2.5 text-left"
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="truncate font-mono text-[13px] text-white/90">
          {copied ? "Copied!" : displayValue || truncateAddress(value)}
        </p>
      </div>
      {copied ? (
        <CheckCircleIcon width="16" height="16" className="shrink-0 text-accent-green" />
      ) : (
        <CopyIcon width="16" height="16" className="shrink-0 text-white/40" />
      )}
    </button>
  );
}

// Deterministic little sparkline so the same coin always renders the same
// "shape" without needing a real price-history feed yet.
function Sparkline({ seed, positive }) {
  const points = generateSparklinePoints(seed);
  const width = 100;
  const height = 100;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * width} ${height - p * height}`)
    .join(" ");
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const color = positive ? "#22C55E" : "#EF4444";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-24 w-full">
      <path d={areaPath} fill={color} fillOpacity="0.12" stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function generateSparklinePoints(seed) {
  // Small seeded pseudo-random walk, normalized to 0..1.
  let s = Array.from(String(seed)).reduce((acc, ch) => acc + ch.charCodeAt(0), 7);
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const raw = [0.5];
  for (let i = 1; i < 24; i++) {
    const prev = raw[i - 1];
    raw.push(Math.min(1, Math.max(0, prev + (next() - 0.45) * 0.35)));
  }
  return raw;
}

export default function CoinDetailModal({ token, onClose, onTrade }) {
  if (!token) return null;

  const {
    name,
    symbol,
    avatarColor = "#8B5CF6",
    avatarImage,
    chain = "Giwa Chain",
    creator,
    contractAddress,
    website,
    twitter,
    marketCap,
    change,
    createdAgo,
  } = token;

  const isPositive = !String(change || "").startsWith("-");

  const handleShare = async () => {
    const shareData = {
      title: `${name} (${symbol})`,
      text: `Check out ${name} (${symbol}) on Bagua Launchpad`,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch {
      // User cancelled share or clipboard unavailable — ignore silently.
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close popup overlay"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-bg-panel card-border p-5 shadow-glow sm:max-w-sm sm:rounded-2xl">
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-bg-card text-white/50 hover:text-white"
        >
          <CloseIcon width="16" height="16" />
        </button>

        {/* Identity */}
        <div className="flex items-start gap-3 pr-8">
          {avatarImage ? (
            <img src={avatarImage} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-bg"
              style={{ backgroundColor: avatarColor }}
            >
              {symbol?.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0 pt-0.5">
            <p className="truncate font-display text-lg font-bold text-white">{name}</p>
            <p className="text-sm text-white/40">${symbol}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-md bg-bg-card px-2 py-0.5 text-[10px] font-medium text-white/60">
                <img src="/giwa-chain-icon.png" alt="" className="h-3 w-3 rounded-full" />
                {chain}
              </span>
              {createdAgo && (
                <span className="flex items-center gap-1 rounded-md bg-bg-card px-2 py-0.5 text-[10px] text-white/40">
                  <ClockIcon width="10" height="10" />
                  {createdAgo}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Share + creator */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-xs font-semibold text-white/80"
          >
            <ShareIcon width="14" height="14" />
            Share
          </button>
          {creator && (
            <div className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-bg-card card-border py-2.5 text-xs text-white/60">
              <span className="text-white/40">By</span>
              <span className="font-mono">{truncateAddress(creator)}</span>
            </div>
          )}
        </div>

        {/* Contract address */}
        {contractAddress && (
          <div className="mt-2">
            <CopyRow label="Contract Address" value={contractAddress} />
          </div>
        )}

        {/* Socials */}
        {(website || twitter) && (
          <div className="mt-2 flex items-center gap-2">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-xs font-medium text-white/70"
              >
                <GlobeIcon width="14" height="14" />
                Website
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-xs font-medium text-white/70"
              >
                <XSocialIcon width="12" height="12" />
                X
              </a>
            )}
          </div>
        )}

        {/* Market cap + chart */}
        <div className="mt-4 rounded-xl bg-bg-card card-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/40">Market Cap</p>
              <p className="font-display text-xl font-bold text-white">{marketCap || "—"}</p>
            </div>
            {change && (
              <span
                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                  isPositive ? "bg-accent-green/15 text-accent-green" : "bg-accent-red/15 text-accent-red"
                }`}
              >
                {change}
              </span>
            )}
          </div>
          <div className="mt-3">
            <Sparkline seed={contractAddress || symbol || name} positive={isPositive} />
          </div>
        </div>

        <button
          onClick={() => onTrade?.(token)}
          className="mt-4 w-full rounded-xl bg-accent-purple py-3 text-sm font-semibold text-white"
        >
          Trade Now
        </button>
      </div>
    </div>
  );
}
