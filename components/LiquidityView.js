"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { useWallet } from "@/lib/WalletProvider";
import { CHAIN_NAME, ERC20_ABI, RPC_URL, TOKEN_ADDRESS } from "@/lib/config";
import {
  DropletIcon,
  CoinIcon,
  TrendingUpIcon,
  UsersIcon,
  DiamondIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  InfoIcon,
} from "@/components/icons";

const STATS = [
  { label: "Total Liquidity", value: "$18.45M", change: "+12.34%", icon: DropletIcon },
  { label: "24H Volume", value: "$3.24M", change: "+8.56%", icon: CoinIcon },
  { label: "Fees (24H)", value: "$9,657.21", change: "+5.21%", icon: TrendingUpIcon },
  { label: "Liquidity Providers", value: "2,842", change: "+3.12%", icon: UsersIcon },
];

const POSITIONS = [
  { pairA: "ETH", pairB: "BAGUA", version: "V2", fees: "$12.45", liquidity: "$1,234.56", share: "0.75%", initialsA: null, colorB: "#F5B324" },
  { pairA: "USDT", pairB: "BAGUA", version: "V2", fees: "$8.21", liquidity: "$856.32", share: "0.42%", initialsA: "T", colorA: "#22C55E", colorB: "#F5B324" },
];

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "0.0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0.0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function LiquidityView({ onComingSoon }) {
  const { address, balance, connect, isOnGiwaChain, switchToGiwaChain } = useWallet();

  const [amountA, setAmountA] = useState("1.0");
  const [amountB, setAmountB] = useState("12345678.9");
  const [tokenSymbol, setTokenSymbol] = useState("BAGUA");
  const [tokenBalance, setTokenBalance] = useState(null);

  const readProvider = useMemo(() => new JsonRpcProvider(RPC_URL), []);

  const loadTokenInfo = useCallback(async () => {
    try {
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, readProvider);
      const [symbol, decimals] = await Promise.all([
        token.symbol().catch(() => "BAGUA"),
        token.decimals().catch(() => 18),
      ]);
      setTokenSymbol(symbol);
      if (address) {
        const raw = await token.balanceOf(address);
        setTokenBalance(formatUnits(raw, Number(decimals)));
      } else {
        setTokenBalance(null);
      }
    } catch {
      // Token not reachable yet (e.g. wrong network) — keep the defaults.
    }
  }, [address, readProvider]);

  useEffect(() => {
    loadTokenInfo();
  }, [loadTokenInfo]);

  const ethBalanceDisplay = address ? formatAmount(balance) : "1.2456";
  const bagBalanceDisplay = address ? formatAmount(tokenBalance) : "12,345,678.9";

  const handlePrimaryButton = () => {
    if (!address) return connect();
    if (!isOnGiwaChain) return switchToGiwaChain();
    return onComingSoon?.("Add Liquidity");
  };

  const primaryLabel = !address
    ? "Connect Wallet"
    : !isOnGiwaChain
    ? `Switch to ${CHAIN_NAME}`
    : "Add Liquidity";

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="hero-glow relative overflow-hidden rounded-2xl bg-bg-panel card-border p-5">
        <h1 className="font-display text-2xl font-bold text-white">Liquidity</h1>
        <p className="mt-1 max-w-[65%] text-sm text-white/60">Add liquidity and earn fees from every swap.</p>
        <p className="mt-1 max-w-[65%] text-xs text-white/40">
          Provide liquidity to any token pair and start earning trading fees.
        </p>
        <div className="absolute right-8 top-1/2 flex -translate-y-1/2 items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-violet/20 text-accent-violet">
            <DiamondIcon width="26" height="26" />
          </span>
          <img src="/logo.png" alt="Bagua Swap logo" className="-ml-4 h-14 w-14 rounded-full card-border" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="rounded-xl bg-bg-card card-border p-3">
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
              <Icon width="16" height="16" />
            </span>
            <p className="text-[10px] text-white/40">{label}</p>
            <p className="font-display text-base font-bold text-white">{value}</p>
            <span className="text-xs font-medium text-accent-green">{change}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-bg-panel card-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Add Liquidity</h2>
          <button
            onClick={() => onComingSoon?.("Your Liquidity Positions")}
            className="flex items-center gap-1.5 text-sm text-white/60"
          >
            Your Liquidity
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-purple/20 text-xs font-semibold text-accent-purple">
              {POSITIONS.length}
            </span>
            <ChevronDownIcon width="14" height="14" className="-rotate-90" />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-bg-card card-border p-3">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Select Token</span>
            <span>
              Balance: {ethBalanceDisplay} ETH{" "}
              <button
                onClick={() => setAmountA(address ? balance || "0" : "1.2456")}
                className="font-semibold text-accent-purple"
              >
                MAX
              </button>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => onComingSoon?.("Select Token")}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-panel card-border px-3 py-2 text-white"
            >
              <DiamondIcon className="text-accent-violet" />
              <span className="font-semibold">ETH</span>
              <ChevronDownIcon width="14" height="14" />
            </button>
            <input
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full bg-transparent text-right text-xl font-semibold text-white placeholder-white/30 outline-none"
            />
          </div>
          <p className="mt-1 text-right text-xs text-white/40">~ $ 2,450.25</p>
        </div>

        <div className="relative z-10 -my-3 flex justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-panel text-accent-purple card-border">
            <PlusCircleIcon width="18" height="18" />
          </span>
        </div>

        <div className="rounded-xl bg-bg-card card-border p-3 pt-5">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Select Token</span>
            <span>
              Balance: {bagBalanceDisplay} {tokenSymbol}{" "}
              <button
                onClick={() => setAmountB(address ? tokenBalance || "0" : "12345678.9")}
                className="font-semibold text-accent-purple"
              >
                MAX
              </button>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => onComingSoon?.("Select Token")}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-panel card-border px-3 py-2 text-white"
            >
              <img src="/logo.png" alt={tokenSymbol} className="h-5 w-5 rounded-full" />
              <span className="font-semibold">${tokenSymbol}</span>
              <ChevronDownIcon width="14" height="14" />
            </button>
            <input
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full bg-transparent text-right text-xl font-semibold text-white placeholder-white/30 outline-none"
            />
          </div>
          <p className="mt-1 text-right text-xs text-white/40">~ $ 2,398.42</p>
        </div>

        <div className="mt-3 rounded-xl bg-bg-card card-border p-3">
          <p className="mb-2 text-center text-[11px] text-white/50">Prices and Pool Share</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-sm font-semibold text-white">12,345,678.9</p>
              <p className="text-[10px] text-white/40">${tokenSymbol} per ETH</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">0.000000081</p>
              <p className="text-[10px] text-white/40">ETH per ${tokenSymbol}</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-sm font-semibold text-white">
                0.75%
                <InfoIcon className="text-white/30" />
              </p>
              <p className="text-[10px] text-white/40">Share of Pool</p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrimaryButton}
          className="mt-4 w-full rounded-xl bg-accent-purple py-3.5 text-center font-semibold text-white"
        >
          {primaryLabel}
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Your Liquidity Positions</h2>
        <button onClick={() => onComingSoon?.("Your Liquidity Positions")} className="text-sm font-medium text-accent-purple">
          View All
        </button>
      </div>

      <div className="mt-2 space-y-2">
        {POSITIONS.map((p) => (
          <button
            key={`${p.pairA}-${p.pairB}`}
            onClick={() => onComingSoon?.("Liquidity Position Details")}
            className="flex w-full items-center justify-between rounded-xl bg-bg-card card-border p-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {p.initialsA ? (
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-bg"
                    style={{ backgroundColor: p.colorA }}
                  >
                    {p.initialsA}
                  </span>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-violet/20 text-accent-violet">
                    <DiamondIcon width="16" height="16" />
                  </span>
                )}
                <img src="/logo.png" alt={p.pairB} className="-ml-3 h-9 w-9 rounded-full card-border" />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  {p.pairA} / ${p.pairB}
                  <span className="rounded-full bg-accent-purple/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-purple">
                    {p.version}
                  </span>
                </p>
                <p className="text-xs text-white/40">
                  Earned Fees (24H) <span className="text-accent-green">{p.fees}</span>
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="text-white/50">Your Liquidity</p>
              <p className="font-semibold text-white">{p.liquidity}</p>
              <p className="mt-0.5 text-white/50">
                Share of Pool <span className="text-accent-violet">{p.share}</span>
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
