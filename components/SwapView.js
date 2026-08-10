"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcProvider, formatUnits, parseEther, parseUnits } from "ethers";
import { useWallet } from "@/lib/WalletProvider";
import { AMMS_ABI, AMMS_ADDRESS, CHAIN_NAME, ERC20_ABI, RPC_URL, TOKEN_ADDRESS } from "@/lib/config";
import {
  ArrowDownIcon,
  ChevronDownIcon,
  ClockIcon,
  DiamondIcon,
  EditIcon,
  FlameIcon,
  SettingsIcon,
} from "@/components/icons";

const PERCENTAGES = [25, 50, 75];

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "0.0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0.0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function SwapView({ onComingSoon }) {
  const { address, balance, connect, isOnGiwaChain, switchToGiwaChain } = useWallet();

  const [direction, setDirection] = useState("buy");
  const [amount, setAmount] = useState("");
  const [slippage] = useState(0.5);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState("BAGUA");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [submitting, setSubmitting] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const readProvider = useMemo(() => new JsonRpcProvider(RPC_URL), []);

  const loadTokenInfo = useCallback(async () => {
    try {
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, readProvider);
      const [symbol, decimals] = await Promise.all([
        token.symbol().catch(() => "BAGUA"),
        token.decimals().catch(() => 18),
      ]);
      setTokenSymbol(symbol);
      setTokenDecimals(Number(decimals));
      if (address) {
        const raw = await token.balanceOf(address);
        setTokenBalance(formatUnits(raw, Number(decimals)));
      } else {
        setTokenBalance(null);
      }
    } catch {
    }
  }, [address, readProvider]);

  useEffect(() => {
    loadTokenInfo();
  }, [loadTokenInfo]);

  const fromLabel = direction === "buy" ? "ETH" : tokenSymbol;
  const toLabel = direction === "buy" ? tokenSymbol : "ETH";
  const fromBalance = direction === "buy" ? balance : tokenBalance;
  const toBalance = direction === "buy" ? tokenBalance : balance;

  const applyPercentage = (pct) => {
    if (!fromBalance) return;
    const value = (parseFloat(fromBalance) * pct) / 100;
    setAmount(value > 0 ? value.toFixed(6) : "");
  };

  const applyMax = () => {
    if (!fromBalance) return;
    setAmount(fromBalance);
  };

  const flipDirection = () => {
    setDirection((d) => (d === "buy" ? "sell" : "buy"));
    setAmount("");
    setTxError(null);
    setTxHash(null);
  };

  const handleSwap = async () => {
    setTxError(null);
    setTxHash(null);

    if (!amount || Number(amount) <= 0) {
      setTxError("Enter an amount first.");
      return;
    }

    setSubmitting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const amms = new Contract(AMMS_ADDRESS, AMMS_ABI, signer);

      let tx;
      if (direction === "buy") {
        tx = await amms.buyToken(TOKEN_ADDRESS, { value: parseEther(amount) });
      } else {
        const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
        const amountWei = parseUnits(amount, tokenDecimals);
        const allowance = await token.allowance(address, AMMS_ADDRESS);
        if (allowance < amountWei) {
          const approveTx = await token.approve(AMMS_ADDRESS, amountWei);
          await approveTx.wait();
        }
        tx = await amms.sellToken(TOKEN_ADDRESS, amountWei);
      }

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setAmount("");
      loadTokenInfo();
    } catch (err) {
      setTxError(err?.shortMessage || err?.reason || err?.message || "Swap failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryButton = () => {
    if (!address) return connect();
    if (!isOnGiwaChain) return switchToGiwaChain();
    return handleSwap();
  };

  const primaryLabel = !address
    ? "Connect Wallet"
    : !isOnGiwaChain
    ? `Switch to ${CHAIN_NAME}`
    : submitting
    ? "Swapping..."
    : "Swap";

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Swap</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/50">
            Trade tokens in an instant
            <FlameIcon width="14" height="14" className="text-accent-gold" />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onComingSoon("Swap Settings")}
            aria-label="Swap settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-card card-border text-white/70"
          >
            <SettingsIcon width="18" height="18" />
          </button>
          <button
            onClick={() => onComingSoon("Swap History")}
            aria-label="Swap history"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-card card-border text-white/70"
          >
            <ClockIcon width="18" height="18" />
          </button>
        </div>
      </div>

      {/* From */}
      <div className="mt-4 rounded-2xl bg-bg-panel card-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">From</span>
          <span className="text-white/50">
            Balance: {formatAmount(fromBalance)} {fromLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-card card-border px-3 py-2 text-white">
            <DiamondIcon className="text-accent-violet" />
            <span className="font-semibold">{fromLabel}</span>
          </div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            className="w-full bg-transparent text-right text-2xl font-semibold text-white placeholder-white/30 outline-none"
          />
        </div>

        <div className="mt-3 flex gap-2">
          {PERCENTAGES.map((pct) => (
            <button
              key={pct}
              onClick={() => applyPercentage(pct)}
              className="flex-1 rounded-lg bg-bg-card card-border py-1.5 text-xs font-medium text-white/70 hover:text-white"
            >
              {pct}%
            </button>
          ))}
          <button
            onClick={applyMax}
            className="flex-1 rounded-lg bg-accent-purple/15 py-1.5 text-xs font-semibold text-accent-purple"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Direction toggle */}
      <div className="relative z-10 -my-3 flex justify-center">
        <button
          onClick={flipDirection}
          aria-label="Reverse swap direction"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-panel card-border text-accent-purple"
        >
          <ArrowDownIcon />
        </button>
      </div>

      {/* To */}
      <div className="rounded-2xl bg-bg-panel card-border p-4 pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">To (estimated)</span>
          <span className="text-white/50">
            Balance: {formatAmount(toBalance)} {toLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-card card-border px-3 py-2 text-white">
            <DiamondIcon className="text-accent-violet" />
            <span className="font-semibold">{toLabel}</span>
          </div>
          <span className="text-2xl font-semibold text-white/30">—</span>
        </div>
      </div>

      {/* Price info */}
      <div className="mt-3 space-y-2 rounded-2xl bg-bg-panel card-border p-4 text-sm">
        <div className="flex items-center justify-between text-white/50">
          <span>Price</span>
          <span className="text-white/70">Set by the bonding curve on-chain</span>
        </div>
        <div className="flex items-center justify-between text-white/50">
          <span>Slippage Tolerance</span>
          <span className="flex items-center gap-1 text-accent-purple">
            {slippage}%
            <button onClick={() => onComingSoon("Custom Slippage")} aria-label="Edit slippage">
              <EditIcon />
            </button>
          </span>
        </div>
        <div className="flex items-center justify-between text-white/50">
          <span>Minimum Received</span>
          <span className="text-white/70">Determined at execution</span>
        </div>
      </div>

      {txError && (
        <p className="mt-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">
          {txError}
        </p>
      )}
      {txHash && (
        <p className="mt-3 rounded-xl border border-accent-green/30 bg-accent-green/10 px-4 py-2.5 text-sm text-accent-green">
          Swap submitted: {txHash.slice(0, 10)}...{txHash.slice(-6)}
        </p>
      )}

      <button
        onClick={handlePrimaryButton}
        disabled={submitting}
        className="mt-4 w-full rounded-xl bg-accent-purple py-3.5 text-center font-semibold text-white disabled:opacity-60"
      >
        {primaryLabel}
      </button>

      <button
        onClick={() => onComingSoon("Get $BAGUA")}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-bg-card card-border py-3 text-sm font-medium text-white/80"
      >
        <FlameIcon width="16" height="16" className="text-accent-gold" />
        Get ${tokenSymbol}
      </button>

      <button
        onClick={() => onComingSoon("Burn Mechanism")}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-bg-panel card-border p-4 text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-purple/15">
          <FlameIcon className="text-accent-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Every Swap, Burns ${tokenSymbol}</p>
          <p className="mt-0.5 text-xs text-white/50">
            A portion of every transaction permanently burns ${tokenSymbol}.
          </p>
        </div>
        <ChevronDownIcon className="-rotate-90 text-white/40" />
      </button>
    </section>
  );
}
