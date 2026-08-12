"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatUnits, isAddress, parseUnits, ZeroAddress } from "ethers";
import { useWallet } from "@/lib/WalletProvider";
import { getReadProvider, getWethAddress } from "@/lib/pricing";
import { formatUsd } from "@/lib/format";
import {
  AMM_FACTORY_ABI,
  AMM_FACTORY_ADDRESS,
  AMMS_ABI,
  AMMS_ADDRESS,
  CHAIN_NAME,
  ERC20_ABI,
  LIQUIDITY_REMOVAL_FEE_BPS,
  PAIR_ABI,
  ROUTER_ABI,
  ROUTER_ADDRESS,
  TOKEN_ADDRESS,
} from "@/lib/config";
import {
  DropletIcon,
  CoinIcon,
  TrendingUpIcon,
  UsersIcon,
  DiamondIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  InfoIcon,
  LockIcon,
} from "@/components/icons";

const STATS_STATIC = [
  { label: "24H Volume", value: "$3.24M", change: "+8.56%", icon: CoinIcon },
  { label: "Fees (24H)", value: "$9,657.21", change: "+5.21%", icon: TrendingUpIcon },
  { label: "Liquidity Providers", value: "2,842", change: "+3.12%", icon: UsersIcon },
];

const PERCENTAGES = [25, 50, 75];
const DEADLINE_SECONDS = 20 * 60; // 20 minutes, matches SwapView-style safety margin
const REMOVAL_FEE_PCT = (LIQUIDITY_REMOVAL_FEE_BPS / 100).toFixed(2);

function formatAmount(value, maxFractionDigits = 4) {
  if (value === null || value === undefined || value === "") return "0.0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0.0";
  return num.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
}

function safeParseUnits(value, decimals) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || Number.isNaN(Number(trimmed)) || Number(trimmed) <= 0) return null;
  try {
    return parseUnits(trimmed, decimals);
  } catch {
    return null;
  }
}

function applySlippage(amount, slippagePct) {
  if (amount == null) return 0n;
  const bps = BigInt(Math.max(0, Math.round(Number(slippagePct) * 100)));
  return (amount * (10000n - bps)) / 10000n;
}

export default function LiquidityView({ onComingSoon }) {
  const { address, balance, connect, isOnGiwaChain, switchToGiwaChain, usdPrice } = useWallet();

  const [mode, setMode] = useState("add"); // "add" | "remove"
  const [amountEth, setAmountEth] = useState("");
  const [amountToken, setAmountToken] = useState("");
  const [removePct, setRemovePct] = useState(0);
  const [slippage, setSlippage] = useState(0.5);

  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState("");
  const [tokenAddress, setTokenAddress] = useState(TOKEN_ADDRESS);

  const [tokenInfo, setTokenInfo] = useState({ symbol: "BAGUA", decimals: 18, balance: null });
  const [pairState, setPairState] = useState({
    loading: true,
    pairAddress: null,
    reserveEth: 0n,
    reserveToken: 0n,
    isLaunchpadToken: false,
    launchpadLocked: false,
    graduated: false,
    lpBalance: 0n,
    lpTotalSupply: 0n,
  });

  const [submitting, setSubmitting] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const readProvider = useMemo(() => getReadProvider(), []);
  const contractsConfigured = Boolean(ROUTER_ADDRESS && AMM_FACTORY_ADDRESS);

  // ── Load token + pair + LP position from chain ──────────────────────────
  const loadPairData = useCallback(async () => {
    setPairState((s) => ({ ...s, loading: true }));
    try {
      const token = new Contract(tokenAddress, ERC20_ABI, readProvider);
      const [symbol, decimals] = await Promise.all([
        token.symbol().catch(() => "TOKEN"),
        token.decimals().catch(() => 18),
      ]);
      const dec = Number(decimals);
      let userTokenBalance = null;
      if (address) {
        userTokenBalance = formatUnits(await token.balanceOf(address).catch(() => 0n), dec);
      }
      setTokenInfo({ symbol, decimals: dec, balance: userTokenBalance });

      if (!contractsConfigured) {
        setPairState((s) => ({ ...s, loading: false }));
        return;
      }

      const factory = new Contract(AMM_FACTORY_ADDRESS, AMM_FACTORY_ABI, readProvider);
      const weth = await getWethAddress(readProvider);

      const [isLaunchpadToken, pairAddress] = await Promise.all([
        factory.isLaunchpadToken(tokenAddress).catch(() => false),
        weth ? factory.getPair(tokenAddress, weth).catch(() => ZeroAddress) : Promise.resolve(ZeroAddress),
      ]);

      let graduated = false;
      if (isLaunchpadToken && AMMS_ADDRESS) {
        const curve = new Contract(AMMS_ADDRESS, AMMS_ABI, readProvider);
        graduated = await curve.isGraduated(tokenAddress).catch(() => false);
      }

      let reserveEth = 0n;
      let reserveToken = 0n;
      let launchpadLocked = isLaunchpadToken && !graduated; // safe default until pair confirms
      let lpBalance = 0n;
      let lpTotalSupply = 0n;
      const hasPair = pairAddress && pairAddress !== ZeroAddress;

      if (hasPair) {
        const pair = new Contract(pairAddress, PAIR_ABI, readProvider);
        const [reserves, token0, locked, totalSupply] = await Promise.all([
          pair.getReserves(),
          pair.token0(),
          pair.launchpadLocked().catch(() => false),
          pair.totalSupply().catch(() => 0n),
        ]);
        const isToken0 = token0.toLowerCase() === tokenAddress.toLowerCase();
        reserveToken = isToken0 ? reserves[0] : reserves[1];
        reserveEth = isToken0 ? reserves[1] : reserves[0];
        launchpadLocked = locked;
        lpTotalSupply = totalSupply;
        if (address) {
          lpBalance = await pair.balanceOf(address).catch(() => 0n);
        }
      }

      setPairState({
        loading: false,
        pairAddress: hasPair ? pairAddress : null,
        reserveEth,
        reserveToken,
        isLaunchpadToken,
        launchpadLocked,
        graduated,
        lpBalance,
        lpTotalSupply,
      });
    } catch {
      setPairState((s) => ({ ...s, loading: false }));
    }
  }, [tokenAddress, address, readProvider, contractsConfigured]);

  useEffect(() => {
    loadPairData();
  }, [loadPairData]);

  const poolExists = pairState.reserveEth > 0n && pairState.reserveToken > 0n;
  const blockedByLaunchpad = pairState.isLaunchpadToken && pairState.launchpadLocked;

  const poolShareDisplay = useMemo(() => {
    if (!pairState.lpTotalSupply || pairState.lpTotalSupply === 0n) return null;
    const pct = (Number(pairState.lpBalance) / Number(pairState.lpTotalSupply)) * 100;
    if (!Number.isFinite(pct)) return null;
    return pct;
  }, [pairState.lpBalance, pairState.lpTotalSupply]);

  const totalLiquidityUsd = useMemo(() => {
    if (!poolExists || usdPrice == null) return null;
    const ethReserveNum = Number(formatUnits(pairState.reserveEth, 18));
    return ethReserveNum * 2 * usdPrice;
  }, [poolExists, pairState.reserveEth, usdPrice]);

  const priceRatio = useMemo(() => {
    if (!poolExists) return null;
    const ethNum = Number(formatUnits(pairState.reserveEth, 18));
    const tokenNum = Number(formatUnits(pairState.reserveToken, tokenInfo.decimals));
    if (!ethNum || !tokenNum) return null;
    return { tokenPerEth: tokenNum / ethNum, ethPerToken: ethNum / tokenNum };
  }, [poolExists, pairState.reserveEth, pairState.reserveToken, tokenInfo.decimals]);

  // ── Add-liquidity input syncing (auto-quote against live reserves) ──────
  const handleAmountEthChange = (val) => {
    setAmountEth(val);
    if (poolExists && priceRatio && val && !Number.isNaN(Number(val))) {
      const quoted = Number(val) * priceRatio.tokenPerEth;
      setAmountToken(Number.isFinite(quoted) ? String(quoted) : "");
    }
  };

  const handleAmountTokenChange = (val) => {
    setAmountToken(val);
    if (poolExists && priceRatio && val && !Number.isNaN(Number(val))) {
      const quoted = Number(val) * priceRatio.ethPerToken;
      setAmountEth(Number.isFinite(quoted) ? String(quoted) : "");
    }
  };

  const ethBalanceDisplay = address ? formatAmount(balance) : "0.0";
  const tokenBalanceDisplay = address ? formatAmount(tokenInfo.balance) : "0.0";
  const lpBalanceDisplay = formatAmount(formatUnits(pairState.lpBalance, 18), 6);

  const resetTxState = () => {
    setTxError(null);
    setTxHash(null);
  };

  // ── Token selection ──────────────────────────────────────────────────
  const selectDefaultToken = () => {
    setTokenAddress(TOKEN_ADDRESS);
    setCustomAddressInput("");
    setShowTokenPicker(false);
    resetTxState();
  };

  const applyCustomToken = () => {
    const val = customAddressInput.trim();
    if (!isAddress(val)) {
      setTxError("Enter a valid token address.");
      return;
    }
    setTokenAddress(val);
    setShowTokenPicker(false);
    resetTxState();
  };

  // ── Add liquidity ────────────────────────────────────────────────────
  const handleAddLiquidity = async () => {
    resetTxState();
    if (!contractsConfigured) {
      setTxError("Liquidity contracts aren't configured for this network yet.");
      return;
    }
    if (blockedByLaunchpad) {
      setTxError("This token hasn't migrated off the launchpad bonding curve yet — liquidity is locked until then.");
      return;
    }
    const ethAmountWei = safeParseUnits(amountEth, 18);
    const tokenAmountWei = safeParseUnits(amountToken, tokenInfo.decimals);
    if (!ethAmountWei || !tokenAmountWei) {
      setTxError("Enter both amounts first.");
      return;
    }

    setSubmitting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      const token = new Contract(tokenAddress, ERC20_ABI, signer);

      const allowance = await token.allowance(address, ROUTER_ADDRESS);
      if (allowance < tokenAmountWei) {
        const approveTx = await token.approve(ROUTER_ADDRESS, tokenAmountWei);
        await approveTx.wait();
      }

      const minToken = poolExists ? applySlippage(tokenAmountWei, slippage) : 0n;
      const minEth = poolExists ? applySlippage(ethAmountWei, slippage) : 0n;
      const deadline = Math.floor(Date.now() / 1000) + DEADLINE_SECONDS;

      const tx = await router.addLiquidityETH(tokenAddress, tokenAmountWei, minToken, minEth, address, deadline, {
        value: ethAmountWei,
      });
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setAmountEth("");
      setAmountToken("");
      loadPairData();
    } catch (err) {
      setTxError(err?.shortMessage || err?.reason || err?.message || "Add liquidity failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Remove liquidity ─────────────────────────────────────────────────
  const removeLiquidityAmount = useMemo(() => {
    if (!removePct || pairState.lpBalance === 0n) return 0n;
    return (pairState.lpBalance * BigInt(removePct)) / 100n;
  }, [removePct, pairState.lpBalance]);

  const handleRemoveLiquidity = async () => {
    resetTxState();
    if (!contractsConfigured) {
      setTxError("Liquidity contracts aren't configured for this network yet.");
      return;
    }
    if (!pairState.pairAddress || removeLiquidityAmount === 0n) {
      setTxError("Select how much liquidity to remove first.");
      return;
    }

    setSubmitting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      const pair = new Contract(pairState.pairAddress, PAIR_ABI, signer);

      const allowance = await pair.allowance(address, ROUTER_ADDRESS);
      if (allowance < removeLiquidityAmount) {
        const approveTx = await pair.approve(ROUTER_ADDRESS, removeLiquidityAmount);
        await approveTx.wait();
      }

      const deadline = Math.floor(Date.now() / 1000) + DEADLINE_SECONDS;
      // amountMin left at 0 here: the 1% removal fee is a fixed protocol
      // fee (not front-runnable slippage), and the Router still enforces
      // the pool's real K invariant on the way out.
      const tx = await router.removeLiquidityETH(tokenAddress, removeLiquidityAmount, 0, 0, address, deadline);
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setRemovePct(0);
      loadPairData();
    } catch (err) {
      setTxError(err?.shortMessage || err?.reason || err?.message || "Remove liquidity failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryButton = () => {
    if (!address) return connect();
    if (!isOnGiwaChain) return switchToGiwaChain();
    if (mode === "add") return handleAddLiquidity();
    return handleRemoveLiquidity();
  };

  const primaryDisabled =
    submitting || (address && isOnGiwaChain && contractsConfigured && mode === "add" && blockedByLaunchpad);

  const primaryLabel = !address
    ? "Connect Wallet"
    : !isOnGiwaChain
    ? `Switch to ${CHAIN_NAME}`
    : submitting
    ? mode === "add"
      ? "Adding Liquidity..."
      : "Removing Liquidity..."
    : mode === "add"
    ? blockedByLaunchpad
      ? "Locked Until Migration"
      : "Add Liquidity"
    : "Remove Liquidity";

  const totalLiquidityDisplay = totalLiquidityUsd != null ? formatUsd(totalLiquidityUsd) : "—";
  const hasPosition = pairState.lpBalance > 0n;

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="hero-glow relative overflow-hidden rounded-2xl bg-bg-panel card-border p-5">
        <h1 className="font-display text-2xl font-bold text-white">Liquidity</h1>
        <p className="mt-1 max-w-[65%] text-sm text-white/60">Add liquidity and earn fees from every swap.</p>
        <p className="mt-1 max-w-[65%] text-xs text-white/40">
          Provide liquidity to any graduated token pair and start earning trading fees.
        </p>
        <div className="absolute right-8 top-1/2 flex -translate-y-1/2 items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-violet/20 text-accent-violet">
            <DiamondIcon width="26" height="26" />
          </span>
          <img src="/logo.png" alt="Bagua Swap logo" className="-ml-4 h-14 w-14 rounded-full card-border" />
        </div>
      </div>

      {/* Non-negotiable protocol rule — surfaced up front, not buried */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent-gold/30 bg-accent-gold/10 p-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-gold/20 text-accent-gold">
          <LockIcon width="13" height="13" />
        </span>
        <p className="text-[11px] leading-snug text-white/70">
          <span className="font-semibold text-accent-gold">Catatan / Anti-rug protection:</span> Sistem ini
          memblokir segala tindakan yang mencoba secara paksa mengisi liquidity DEX di token-token launchpad
          tanpa melalui migrasi. Sebuah pair token launchpad terkunci di on-chain (
          <code className="text-white/50">launchpadLocked</code>) sampai token itu graduate dan{" "}
          <code className="text-white/50">BaguaMigrator</code> membuka kuncinya — tidak ada wallet manapun,
          termasuk deployer, yang bisa menambah liquidity sebelum itu terjadi.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-bg-card card-border p-3">
          <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
            <DropletIcon width="16" height="16" />
          </span>
          <p className="text-[10px] text-white/40">Total Liquidity ({tokenInfo.symbol}/ETH)</p>
          <p className="font-display text-base font-bold text-white">{totalLiquidityDisplay}</p>
          <span className="text-xs font-medium text-white/40">
            {poolExists ? "Live from pool reserves" : "Pool not seeded yet"}
          </span>
        </div>
        {STATS_STATIC.map(({ label, value, change, icon: Icon }) => (
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
          <div className="flex gap-1 rounded-lg bg-black/20 p-0.5">
            {["add", "remove"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  resetTxState();
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mode === m ? "bg-accent-purple text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {m === "add" ? "Add" : "Remove"}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            Your Liquidity
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-purple/20 text-xs font-semibold text-accent-purple">
              {hasPosition ? 1 : 0}
            </span>
          </span>
        </div>

        {blockedByLaunchpad && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-accent-red/30 bg-accent-red/10 p-3">
            <LockIcon width="15" height="15" className="mt-0.5 shrink-0 text-accent-red" />
            <p className="text-xs leading-snug text-accent-red">
              ${tokenInfo.symbol} is still on the launchpad bonding curve and its DEX pair is locked. Liquidity
              can only be added after this token graduates and BaguaMigrator unlocks the pair — this is enforced
              on-chain, not just in this UI.
            </p>
          </div>
        )}

        {mode === "add" ? (
          <>
            <div className="mt-4 rounded-xl bg-bg-card card-border p-3">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>ETH Amount</span>
                <span>
                  Balance: {ethBalanceDisplay} ETH{" "}
                  <button
                    onClick={() => handleAmountEthChange(address ? balance || "0" : "0")}
                    className="font-semibold text-accent-purple"
                  >
                    MAX
                  </button>
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-panel card-border px-3 py-2 text-white">
                  <DiamondIcon className="text-accent-violet" />
                  <span className="font-semibold">ETH</span>
                </span>
                <input
                  value={amountEth}
                  onChange={(e) => handleAmountEthChange(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.0"
                  disabled={blockedByLaunchpad}
                  className="w-full bg-transparent text-right text-xl font-semibold text-white placeholder-white/30 outline-none disabled:opacity-50"
                />
              </div>
              <p className="mt-1 text-right text-xs text-white/40">
                {amountEth && usdPrice != null ? `~ ${formatUsd(Number(amountEth) * usdPrice)}` : ""}
              </p>
            </div>

            <div className="relative z-10 -my-3 flex justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-panel text-accent-purple card-border">
                <PlusCircleIcon width="18" height="18" />
              </span>
            </div>

            <div className="rounded-xl bg-bg-card card-border p-3 pt-5">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Token Amount</span>
                <span>
                  Balance: {tokenBalanceDisplay} {tokenInfo.symbol}{" "}
                  <button
                    onClick={() => handleAmountTokenChange(address ? tokenInfo.balance || "0" : "0")}
                    className="font-semibold text-accent-purple"
                  >
                    MAX
                  </button>
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowTokenPicker((v) => !v)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-panel card-border px-3 py-2 text-white"
                >
                  <img src="/logo.png" alt={tokenInfo.symbol} className="h-5 w-5 rounded-full" />
                  <span className="font-semibold">${tokenInfo.symbol}</span>
                  <ChevronDownIcon width="14" height="14" className={showTokenPicker ? "rotate-180" : ""} />
                </button>
                <input
                  value={amountToken}
                  onChange={(e) => handleAmountTokenChange(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.0"
                  disabled={blockedByLaunchpad}
                  className="w-full bg-transparent text-right text-xl font-semibold text-white placeholder-white/30 outline-none disabled:opacity-50"
                />
              </div>

              {showTokenPicker && (
                <div className="mt-3 rounded-lg bg-bg-panel card-border p-3">
                  <button
                    onClick={selectDefaultToken}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-white hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <img src="/logo.png" alt="BAGUA" className="h-5 w-5 rounded-full" />
                      $BAGUA (default)
                    </span>
                    {tokenAddress === TOKEN_ADDRESS && <span className="text-accent-purple">✓</span>}
                  </button>
                  <p className="mt-2 px-2 text-[10px] uppercase tracking-wide text-white/30">
                    Or paste a token address
                  </p>
                  <div className="mt-1 flex gap-2 px-2">
                    <input
                      value={customAddressInput}
                      onChange={(e) => setCustomAddressInput(e.target.value)}
                      placeholder="0x..."
                      className="min-w-0 flex-1 rounded-md bg-bg-card card-border px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none"
                    />
                    <button
                      onClick={applyCustomToken}
                      className="shrink-0 rounded-md bg-accent-purple px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Use
                    </button>
                  </div>
                  <p className="mt-2 px-2 text-[10px] leading-snug text-white/40">
                    Any token pastes in fine, but launchpad tokens stay locked (per the notice above) until they
                    graduate — the app checks this on-chain before letting you add liquidity.
                  </p>
                </div>
              )}
            </div>

            {poolExists && priceRatio && (
              <div className="mt-3 rounded-xl bg-bg-card card-border p-3">
                <p className="mb-2 text-center text-[11px] text-white/50">Prices and Pool Share</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatAmount(priceRatio.tokenPerEth)}</p>
                    <p className="text-[10px] text-white/40">${tokenInfo.symbol} per ETH</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{priceRatio.ethPerToken.toFixed(10)}</p>
                    <p className="text-[10px] text-white/40">ETH per ${tokenInfo.symbol}</p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1 text-sm font-semibold text-white">
                      {poolShareDisplay != null ? `${poolShareDisplay.toFixed(4)}%` : "0%"}
                      <InfoIcon className="text-white/30" />
                    </p>
                    <p className="text-[10px] text-white/40">Share of Pool</p>
                  </div>
                </div>
              </div>
            )}

            {!poolExists && !blockedByLaunchpad && !pairState.loading && (
              <p className="mt-3 rounded-xl border border-accent-purple/30 bg-accent-purple/10 px-3 py-2 text-[11px] text-white/60">
                No pool exists yet for this pair — you&apos;ll be the first liquidity provider, and the ratio you
                enter here sets the starting price.
              </p>
            )}

            <div className="mt-3 flex items-center justify-between rounded-xl bg-bg-card card-border p-3 text-xs">
              <span className="text-white/50">Slippage Tolerance</span>
              <span className="flex items-center gap-1">
                <input
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  className="w-12 rounded-md bg-bg-panel card-border px-1.5 py-0.5 text-right text-accent-purple outline-none"
                />
                <span className="text-accent-purple">%</span>
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 rounded-xl bg-bg-card card-border p-4">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Your LP Balance</span>
                <span>
                  {lpBalanceDisplay} {tokenInfo.symbol}-ETH LP
                </span>
              </div>
              <p className="mt-3 text-center font-display text-3xl font-bold text-white">{removePct}%</p>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={removePct}
                onChange={(e) => setRemovePct(Number(e.target.value))}
                disabled={!hasPosition}
                className="mt-3 w-full accent-accent-purple disabled:opacity-40"
              />
              <div className="mt-3 flex gap-2">
                {[...PERCENTAGES, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRemovePct(pct)}
                    disabled={!hasPosition}
                    className="flex-1 rounded-lg bg-bg-panel card-border py-1.5 text-xs font-medium text-white/70 hover:text-white disabled:opacity-40"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-snug text-white/50">
              A {REMOVAL_FEE_PCT}% liquidity-removal fee is charged by the pool contract on every withdrawal and
              routed to the treasury — this is a fixed on-chain fee, not something this app adds.
            </p>

            {!hasPosition && !pairState.loading && (
              <p className="mt-3 text-center text-xs text-white/40">
                You don&apos;t have a liquidity position in this pair yet.
              </p>
            )}
          </>
        )}

        {txError && (
          <p className="mt-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">
            {txError}
          </p>
        )}
        {txHash && (
          <p className="mt-3 rounded-xl border border-accent-green/30 bg-accent-green/10 px-4 py-2.5 text-sm text-accent-green">
            {mode === "add" ? "Liquidity added" : "Liquidity removed"}: {txHash.slice(0, 10)}...{txHash.slice(-6)}
          </p>
        )}

        <button
          onClick={handlePrimaryButton}
          disabled={primaryDisabled}
          className="mt-4 w-full rounded-xl bg-accent-purple py-3.5 text-center font-semibold text-white disabled:opacity-60"
        >
          {primaryLabel}
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Your Liquidity Positions</h2>
      </div>

      <div className="mt-2 space-y-2">
        {hasPosition ? (
          <div className="flex w-full items-center justify-between rounded-xl bg-bg-card card-border p-3.5 text-left">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-violet/20 text-accent-violet">
                  <DiamondIcon width="16" height="16" />
                </span>
                <img src="/logo.png" alt={tokenInfo.symbol} className="-ml-3 h-9 w-9 rounded-full card-border" />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  ETH / ${tokenInfo.symbol}
                  <span className="rounded-full bg-accent-purple/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-purple">
                    V2
                  </span>
                </p>
                <p className="text-xs text-white/40">
                  LP Tokens <span className="text-white/70">{lpBalanceDisplay}</span>
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="text-white/50">Share of Pool</p>
              <p className="font-semibold text-white">
                {poolShareDisplay != null ? `${poolShareDisplay.toFixed(4)}%` : "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-card card-border p-4 text-center text-xs text-white/40">
            No liquidity positions yet. Add liquidity above to start earning fees.
          </div>
        )}
      </div>
    </section>
  );
}
