"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { useWallet } from "@/lib/WalletProvider";
import { CHAIN_NAME, ERC20_ABI, TOKEN_ADDRESS } from "@/lib/config";
import { getReadProvider, getAmmPriceInEth, discoverLaunchpadHoldings } from "@/lib/pricing";
import { formatBalance, formatUsd } from "@/lib/format";
import SendReceiveModal from "@/components/SendReceiveModal";
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
  WalletIcon,
} from "@/components/icons";

const SUB_TABS = ["Tokens", "NFTs", "DeFi Positions", "History"];

const ACTIONS = [
  { label: "Send", icon: SendIcon, key: "Send" },
  { label: "Receive", icon: ReceiveIcon, key: "Receive" },
  { label: "Swap", icon: SwapIcon, key: "Swap" },
  { label: "Bridge", icon: BridgeIcon, key: "Bridge" },
];

function formatPct(pct) {
  if (pct == null || Number.isNaN(Number(pct))) return "—";
  const num = Number(pct);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

function pctClass(pct) {
  if (pct == null) return "text-white/30";
  return Number(pct) >= 0 ? "text-accent-green" : "text-accent-red";
}

function TokenAvatar({ token }) {
  if (token.kind === "logo") {
    return <img src="/logo.png" alt={token.symbol} className="h-9 w-9 shrink-0 rounded-full" />;
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `${token.color}25` }}
    >
      <DiamondIcon width="17" height="17" style={{ color: token.color }} />
    </span>
  );
}

export default function WalletView({ onComingSoon, onSwap, onBridge }) {
  const {
    address,
    balance,
    connecting,
    connect,
    selectedNetwork,
    usdPrice,
    usdChangePct,
    usdBalance,
    portfolioChangePct,
    recordPortfolioSnapshot,
    isOnGiwaChain,
    switchToGiwaChain,
  } = useWallet();

  const [hideBalance, setHideBalance] = useState(false);
  const [subTab, setSubTab] = useState("Tokens");
  const [query, setQuery] = useState("");
  const [sendReceiveOpen, setSendReceiveOpen] = useState(false);
  const [sendReceiveTab, setSendReceiveTab] = useState("Send");

  // Default already matches the on-chain symbol (BAG) so there's no
  // flash from a placeholder name while the contract call resolves.
  const [bagBalance, setBagBalance] = useState(null);
  const [bagSymbol, setBagSymbol] = useState("BAG");
  const [bagPriceInEth, setBagPriceInEth] = useState(null);

  const [launchpadHoldings, setLaunchpadHoldings] = useState([]);
  const [launchpadLoading, setLaunchpadLoading] = useState(false);
  const [launchpadScan, setLaunchpadScan] = useState({ total: 0, scanned: 0, skipped: false });

  const readProvider = useMemo(() => getReadProvider(), []);

  const loadBagToken = useCallback(async () => {
    if (!TOKEN_ADDRESS) {
      setBagBalance(null);
      setBagPriceInEth(null);
      return;
    }
    try {
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, readProvider);
      const [symbol, decimals] = await Promise.all([
        token.symbol().catch(() => "BAG"),
        token.decimals().catch(() => 18),
      ]);
      setBagSymbol(symbol);

      if (address) {
        const raw = await token.balanceOf(address);
        setBagBalance(formatUnits(raw, Number(decimals)));
      } else {
        setBagBalance(null);
      }

      const price = await getAmmPriceInEth(readProvider, TOKEN_ADDRESS, Number(decimals));
      setBagPriceInEth(price);
    } catch {
      setBagBalance(null);
      setBagPriceInEth(null);
    }
  }, [address, readProvider]);

  useEffect(() => {
    loadBagToken();
  }, [loadBagToken]);

  const loadLaunchpadHoldings = useCallback(async () => {
    if (!address) {
      setLaunchpadHoldings([]);
      return;
    }
    setLaunchpadLoading(true);
    try {
      const { holdings, total, scanned, skipped } = await discoverLaunchpadHoldings(readProvider, address);
      setLaunchpadHoldings(holdings);
      setLaunchpadScan({ total, scanned, skipped });
    } catch {
      setLaunchpadHoldings([]);
    } finally {
      setLaunchpadLoading(false);
    }
  }, [address, readProvider]);

  useEffect(() => {
    loadLaunchpadHoldings();
  }, [loadLaunchpadHoldings]);

  const handleAction = (key) => {
    if (key === "Swap") {
      onSwap?.();
    } else if (key === "Bridge") {
      onBridge?.();
    } else if (key === "Send" || key === "Receive") {
      setSendReceiveTab(key);
      setSendReceiveOpen(true);
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

  const bagUsdPrice = bagPriceInEth != null && usdPrice != null ? bagPriceInEth * usdPrice : null;
  const bagUsdValue = bagUsdPrice != null && bagBalance != null ? Number(bagBalance) * bagUsdPrice : null;

  const launchpadTokens = useMemo(
    () =>
      launchpadHoldings.map((h) => {
        const priceUsd = h.priceInEth != null && usdPrice != null ? h.priceInEth * usdPrice : null;
        return {
          symbol: h.symbol,
          name: `Bagua Launchpad · ${h.graduated ? "Graduated" : "Bonding Curve"}`,
          amount: h.balance,
          usdValue: priceUsd != null ? Number(h.balance) * priceUsd : null,
          hasPrice: priceUsd != null,
          changePct: null,
          kind: "diamond",
          color: "#22C55E",
        };
      }),
    [launchpadHoldings, usdPrice]
  );

  const tokens = useMemo(
    () => [
      {
        symbol: selectedNetwork?.nativeCurrency?.symbol || "ETH",
        name: `${selectedNetwork?.name || CHAIN_NAME} · Native`,
        amount: balance,
        usdValue: usdBalance,
        hasPrice: usdPrice != null,
        changePct: usdChangePct,
        kind: "native",
        color: "#8B5CF6",
      },
      {
        symbol: bagSymbol,
        name: "Bagua Ecosystem",
        amount: bagBalance,
        usdValue: bagUsdValue,
        hasPrice: bagUsdValue != null,
        changePct: null,
        kind: "logo",
        color: "#F5B324",
      },
      ...launchpadTokens,
    ],
    [selectedNetwork, balance, usdBalance, usdPrice, usdChangePct, bagSymbol, bagBalance, bagUsdValue, launchpadTokens]
  );

  const filteredTokens = tokens.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
  });

  // Total portfolio value = every token above that actually has a price.
  // This is what the 24H change is measured against — not just ETH's own
  // price movement.
  const totalUsdValue = useMemo(() => {
    if (usdPrice == null) return null;
    return tokens.reduce((sum, t) => sum + (t.usdValue || 0), 0);
  }, [tokens, usdPrice]);

  useEffect(() => {
    if (address && totalUsdValue != null) {
      recordPortfolioSnapshot(address, totalUsdValue);
    }
  }, [address, totalUsdValue, recordPortfolioSnapshot]);

  const totalAssetsDisplay = !address ? "—" : totalUsdValue == null ? "Loading…" : formatUsd(totalUsdValue);
  const change24hDisplay = !address || portfolioChangePct == null ? "—" : formatPct(portfolioChangePct);
  const holdingsDisplay = !address ? "—" : `${tokens.length} Tokens`;

  return (
    <section className="mx-4 mt-4 pb-6">
      {/* Wallet Overview banner — hitam pekat + corak emas mewah di sudut */}
      <div className="relative overflow-hidden rounded-2xl border border-accent-gold/25 bg-black p-5">
        <span aria-hidden className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-accent-gold/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent-gold/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-accent-gold/10 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-accent-gold/10 blur-3xl" />

        <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-2 border-t-2 border-accent-gold/60" />
        <span aria-hidden className="pointer-events-none absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-2 border-t-2 border-accent-gold/60" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-2 border-l-2 border-accent-gold/60" />
        <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-2 border-r-2 border-accent-gold/60" />

        <span aria-hidden className="pointer-events-none absolute left-2.5 top-2.5 h-1.5 w-1.5 rotate-45 bg-accent-gold" />
        <span aria-hidden className="pointer-events-none absolute right-2.5 top-2.5 h-1.5 w-1.5 rotate-45 bg-accent-gold" />
        <span aria-hidden className="pointer-events-none absolute bottom-2.5 left-2.5 h-1.5 w-1.5 rotate-45 bg-accent-gold" />
        <span aria-hidden className="pointer-events-none absolute bottom-2.5 right-2.5 h-1.5 w-1.5 rotate-45 bg-accent-gold" />

        <div className="relative">
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            Wallet Overview
            {address && (
              <button
                onClick={() => setHideBalance((v) => !v)}
                aria-label="Toggle balance visibility"
                className="text-white/40 hover:text-white"
              >
                {hideBalance ? <EyeOffIcon width="14" height="14" /> : <EyeIcon width="14" height="14" />}
              </button>
            )}
          </div>

          {address ? (
            <>
              <p className="mt-1 font-display text-3xl font-bold text-white">
                {hideBalance ? "••••••" : totalAssetsDisplay}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-sm">
                <span className={`font-medium ${pctClass(portfolioChangePct)}`}>
                  {hideBalance ? "••••" : change24hDisplay}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">24H</span>
              </div>
              {address && portfolioChangePct == null && (
                <p className="mt-1 text-[11px] text-white/30">
                  24H change needs a bit more history — check back after a day of use.
                </p>
              )}
              {!isOnGiwaChain && (
                <button
                  onClick={switchToGiwaChain}
                  className="mt-3 flex items-center gap-1.5 rounded-lg border border-accent-gold/40 bg-accent-gold/10 px-3 py-1.5 text-xs font-medium text-accent-gold"
                >
                  Wrong network — Switch to {CHAIN_NAME}
                </button>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 font-display text-2xl font-bold text-white">Connect your wallet</p>
              <p className="mt-1.5 text-sm text-white/50">
                Connect to see your real balances and bridge assets to {CHAIN_NAME}.
              </p>
              <button
                onClick={connect}
                disabled={connecting}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-gold px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
              >
                <WalletIcon width="16" height="16" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </>
          )}
        </div>
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
            <p className="text-sm text-white/60">My {bagSymbol} Balance</p>
            <p className="font-display text-xl font-bold text-white">
              {!address ? "—" : hideBalance ? "••••••" : formatBalance(bagBalance)}{" "}
              <span className="text-accent-purple">{bagSymbol}</span>
            </p>
            <p className="text-xs text-white/50">
              {!address
                ? "Connect wallet to view"
                : hideBalance
                ? "••••"
                : bagUsdPrice != null
                ? formatUsd(bagUsdValue)
                : "Not priced yet"}
            </p>
          </div>
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
          onClick={onBridge}
          className="flex items-center gap-1.5 rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white/80 hover:text-accent-gold"
        >
          <BridgeIcon width="16" height="16" className="text-accent-gold" />
          Bridge
        </button>
        <button
          onClick={() => onComingSoon?.("Filters")}
          aria-label="Filters"
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-bg-card card-border text-white/70"
        >
          <FilterIcon width="16" height="16" />
        </button>
      </div>

      {!address ? (
        <div className="mt-2 rounded-xl bg-bg-card card-border py-10 text-center">
          <WalletIcon className="mx-auto text-white/20" width="28" height="28" />
          <p className="mt-3 text-sm text-white/50">Connect your wallet to see your tokens.</p>
          <button
            onClick={connect}
            disabled={connecting}
            className="mt-3 rounded-xl bg-accent-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      ) : (
        <div className="mt-2 divide-y divide-bg-border">
          {filteredTokens.map((t) => (
            <div key={`${t.symbol}-${t.name}`} className="grid grid-cols-[1.8fr_1.1fr_0.7fr_0.2fr] items-center gap-2 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <TokenAvatar token={t} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white">{t.symbol}</p>
                  <p className="truncate text-[11px] text-white/40">{t.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-white">
                  {hideBalance ? "••••" : formatBalance(t.amount)}
                </p>
                <p className="text-[11px] text-white/40">
                  {hideBalance ? "••••" : t.hasPrice ? formatUsd(t.usdValue) : "Not priced yet"}
                </p>
              </div>
              <div className={`text-right text-[12px] font-medium ${pctClass(t.changePct)}`}>
                {t.changePct == null ? "—" : formatPct(t.changePct)}
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

          {launchpadLoading && (
            <p className="py-3 text-center text-xs text-white/30">Scanning your launchpad tokens…</p>
          )}
          {!launchpadLoading && launchpadScan.skipped && (
            <p className="py-3 text-center text-xs text-white/30">
              Only checked the newest {launchpadScan.scanned} of {launchpadScan.total} launchpad tokens.
            </p>
          )}
        </div>
      )}

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
            <p className="text-sm font-semibold text-white">{totalAssetsDisplay}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">24H Change</p>
            <p className={`text-sm font-semibold ${pctClass(portfolioChangePct)}`}>{change24hDisplay}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/50">Network</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  !address ? "bg-white/20" : isOnGiwaChain ? "bg-accent-green" : "bg-accent-gold"
                }`}
              />
              {selectedNetwork?.name || CHAIN_NAME}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/50">Holdings</p>
              <p className="text-sm font-semibold text-white">{holdingsDisplay}</p>
            </div>
            <PieChartIcon className="text-accent-purple" width="20" height="20" />
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-snug text-white/35">
          24H Change reflects your wallet&apos;s total value 24 hours ago vs. now — it&apos;s built from
          snapshots taken on this device, so it takes a day of use before it&apos;s available. Prices come
          straight from Bagua&apos;s own on-chain pools; a token shows &quot;Not priced yet&quot; if it has no
          pool or bonding-curve liquidity yet, and is excluded from Total Assets until then.
        </p>
      </div>

      <SendReceiveModal
        open={sendReceiveOpen}
        initialTab={sendReceiveTab}
        onClose={() => setSendReceiveOpen(false)}
      />
    </section>
  );
}
