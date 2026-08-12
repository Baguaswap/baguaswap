"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlameIcon, TrendingUpIcon } from "@/components/icons";
import CoinDetailModal from "@/components/CoinDetailModal";

const TOKENS = [
  {
    symbol: "DBAGUA", name: "DOGE BAGUA", price: "$0.0₄8214", change: "+42.6%",
    bondingProgress: 78, marketCap: "$128,450", liquidity: "$65,430", color: "#F5B324",
    contractAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    creator: "0x9f0eA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8",
    website: "https://baguaswap.example", twitter: "https://x.com/dogebagua", createdAgo: "12m ago",
  },
  {
    symbol: "PEIPEI", name: "PEIPEI", price: "$0.0₄6120", change: "+18.9%",
    bondingProgress: 61, marketCap: "$97,220", liquidity: "$48,210", color: "#22C55E",
    contractAddress: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    creator: "0x8e9fA0b1C2d3E4f5A6b7C8d9E0f1A2b3C4d5E6f7",
    website: "https://baguaswap.example", twitter: "https://x.com/peipei", createdAgo: "34m ago",
  },
  {
    symbol: "WAGMI", name: "WAGMI", price: "$0.0₅9884", change: "-4.3%",
    bondingProgress: 44, marketCap: "$76,890", liquidity: "$36,540", color: "#F5B324",
    contractAddress: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    creator: "0x7d8eA9b0C1d2E3f4A5b6C7d8E9f0A1b2C3d4E5f6",
    twitter: "https://x.com/wagmi", createdAgo: "1h ago",
  },
  {
    symbol: "MIAO", name: "MIAO", price: "$0.0₅5031", change: "-11.7%",
    bondingProgress: 22, marketCap: "$55,670", liquidity: "$28,120", color: "#EF4444",
    contractAddress: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    creator: "0x6c7dA8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f5",
    website: "https://baguaswap.example", createdAgo: "2h ago",
  },
];

// Maps a TOKENS entry (which uses `color` for the avatar) to the token
// shape CoinDetailModal expects (`avatarColor`).
function toCoinDetailToken(token) {
  return {
    name: token.name,
    symbol: token.symbol,
    avatarColor: token.color,
    chain: "Giwa Chain",
    creator: token.creator,
    contractAddress: token.contractAddress,
    website: token.website,
    twitter: token.twitter,
    marketCap: token.marketCap,
    change: token.change,
    createdAgo: token.createdAgo,
  };
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
  const [selectedToken, setSelectedToken] = useState(null);

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
        {TOKENS.map((token) => (
          <button
            key={token.symbol}
            onClick={() => setSelectedToken(toCoinDetailToken(token))}
            className="rounded-xl bg-bg-card card-border p-4 text-left"
          >
            <div className="mb-2 flex items-start justify-between">
              <TokenAvatar label={token.symbol} color={token.color} />
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

      <CoinDetailModal
        token={selectedToken}
        onClose={() => setSelectedToken(null)}
        onTrade={() => {
          setSelectedToken(null);
          router.push("/launchpad");
        }}
      />
    </section>
  );
}
