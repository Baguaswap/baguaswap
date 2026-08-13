"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseEther } from "ethers";
import { useWallet } from "@/lib/WalletProvider";
import {
  BRIDGE_L2_MIN_GAS_LIMIT,
  CHAIN_NAME,
  EXPLORER_URL,
  GIWA_L1_STANDARD_BRIDGE_ABI,
  GIWA_L1_STANDARD_BRIDGE_ADDRESS,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_EXPLORER_URL,
  SEPOLIA_NETWORK,
  SEPOLIA_RPC_URL,
} from "@/lib/config";
import { getReadProvider } from "@/lib/pricing";
import { formatBalance, formatUsd } from "@/lib/format";
import {
  ArrowDownIcon,
  BridgeIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  EthIcon,
  ExternalLinkIcon,
  InfoIcon,
  WalletIcon,
} from "@/components/icons";

const GAS_BUFFER = 0.0015;
const POLL_INTERVAL_MS = 15000;
const POLL_MAX_ATTEMPTS = 12; // ~3 minutes

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function truncateHash(hash) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export default function BridgeView({ onComingSoon }) {
  const { address, chainId, connecting, connect, switchToNetwork, usdPrice } = useWallet();

  const [amount, setAmount] = useState("");
  const [sepoliaBalance, setSepoliaBalance] = useState(null);
  const [giwaBalance, setGiwaBalance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingHash, setPendingHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [history, setHistory] = useState([]);

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;

  const sepoliaReadProvider = useMemo(() => new JsonRpcProvider(SEPOLIA_RPC_URL), []);
  const giwaReadProvider = useMemo(() => getReadProvider(), []);

  const loadSepoliaBalance = useCallback(async () => {
    if (!address) {
      setSepoliaBalance(null);
      return;
    }
    try {
      const raw = await sepoliaReadProvider.getBalance(address);
      setSepoliaBalance(formatEther(raw));
    } catch {
      setSepoliaBalance(null);
    }
  }, [address, sepoliaReadProvider]);

  const loadGiwaBalance = useCallback(async () => {
    if (!address) {
      setGiwaBalance(null);
      return;
    }
    try {
      const raw = await giwaReadProvider.getBalance(address);
      setGiwaBalance(formatEther(raw));
    } catch {
      setGiwaBalance(null);
    }
  }, [address, giwaReadProvider]);

  useEffect(() => {
    loadSepoliaBalance();
    loadGiwaBalance();
  }, [loadSepoliaBalance, loadGiwaBalance]);

  // After a confirmed deposit, keep polling the Giwa balance for a few
  // minutes so the credited amount shows up without a manual refresh.
  useEffect(() => {
    if (!txHash) return;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      loadGiwaBalance();
      if (attempts >= POLL_MAX_ATTEMPTS) clearInterval(interval);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [txHash, loadGiwaBalance]);

  const applyMax = () => {
    if (sepoliaBalance == null) return;
    const max = Math.max(Number(sepoliaBalance) - GAS_BUFFER, 0);
    setAmount(max > 0 ? max.toFixed(6) : "");
  };

  const usdEstimate = usdPrice != null && amount ? Number(amount) * usdPrice : null;

  const handleBridge = async () => {
    setTxError(null);
    setTxHash(null);
    setPendingHash(null);

    if (!amount || Number(amount) <= 0) {
      setTxError("Enter an amount first.");
      return;
    }
    if (sepoliaBalance != null && Number(amount) > Number(sepoliaBalance)) {
      setTxError("Amount exceeds your Ethereum Sepolia balance.");
      return;
    }

    setSubmitting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const bridge = new Contract(GIWA_L1_STANDARD_BRIDGE_ADDRESS, GIWA_L1_STANDARD_BRIDGE_ABI, signer);

      const tx = await bridge.depositETHTo(address, BRIDGE_L2_MIN_GAS_LIMIT, "0x", {
        value: parseEther(amount),
      });
      setPendingHash(tx.hash);

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setHistory((h) => [{ hash: receipt.hash, amount, time: Date.now() }, ...h]);
      setAmount("");
      loadSepoliaBalance();
    } catch (err) {
      setTxError(err?.shortMessage || err?.reason || err?.message || "Bridge transaction failed. Please try again.");
    } finally {
      setSubmitting(false);
      setPendingHash(null);
    }
  };

  const handlePrimaryButton = () => {
    if (!address) return connect();
    if (!isOnSepolia) return switchToNetwork(SEPOLIA_NETWORK);
    return handleBridge();
  };

  const primaryLabel = !address
    ? "Connect Wallet"
    : !isOnSepolia
    ? "Switch to Ethereum Sepolia"
    : submitting
    ? "Bridging..."
    : "Bridge to " + CHAIN_NAME;

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Bridge</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/50">
            Ethereum Sepolia
            <ArrowDownIcon width="12" height="12" className="-rotate-90 text-white/30" />
            {CHAIN_NAME}
          </p>
        </div>
        <button
          onClick={() => onComingSoon?.("Bridge History")}
          aria-label="Bridge history"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-card card-border text-white/70"
        >
          <ClockIcon width="18" height="18" />
        </button>
      </div>

      {/* From */}
      <div className="mt-4 rounded-2xl bg-bg-panel card-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">From</span>
          <span className="text-white/50">
            Balance: {address ? formatBalance(sepoliaBalance) : "—"} ETH
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-card card-border px-3 py-2 text-white">
            <EthIcon width="16" height="16" className="text-accent-violet" />
            <span className="font-semibold">Sepolia</span>
          </div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            className="w-full bg-transparent text-right text-2xl font-semibold text-white placeholder-white/30 outline-none"
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[11px] text-white/35">Testnet ETH — no real monetary value</span>
          <span className="text-[11px] text-white/35">{usdEstimate != null ? `≈ ${formatUsd(usdEstimate)}` : ""}</span>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={applyMax}
            className="rounded-lg bg-accent-gold/15 px-3 py-1.5 text-xs font-semibold text-accent-gold"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Direction (one-way: deposit only) */}
      <div className="relative z-10 -my-3 flex justify-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-panel card-border text-accent-gold">
          <ArrowDownIcon />
        </span>
      </div>

      {/* To */}
      <div className="rounded-2xl bg-bg-panel card-border p-4 pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">To</span>
          <span className="text-white/50">
            Balance: {address ? formatBalance(giwaBalance) : "—"} ETH
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-bg-card card-border px-3 py-2 text-white">
            <BridgeIcon width="16" height="16" className="text-accent-gold" />
            <span className="font-semibold">{CHAIN_NAME}</span>
          </div>
          <span className="text-2xl font-semibold text-white/30">
            {amount ? `≈ ${amount}` : "0.0"}
          </span>
        </div>
      </div>

      {/* Recipient */}
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-bg-panel card-border p-4 text-sm">
        <div className="flex items-center gap-2 text-white/50">
          <WalletIcon width="14" height="14" />
          Recipient (this wallet)
        </div>
        <span className="flex items-center gap-1.5 font-medium text-white">
          {address ? truncateAddress(address) : "—"}
        </span>
      </div>

      {/* Route info */}
      <div className="mt-3 space-y-2 rounded-2xl bg-bg-panel card-border p-4 text-sm">
        <div className="flex items-center justify-between text-white/50">
          <span>Route</span>
          <span className="text-white/70">Official Giwa L1StandardBridge</span>
        </div>
        <div className="flex items-center justify-between text-white/50">
          <span>Estimated time</span>
          <span className="text-white/70">~1–3 minutes</span>
        </div>
        <div className="flex items-center justify-between text-white/50">
          <span>Network fee</span>
          <span className="text-white/70">Paid in Sepolia ETH (gas)</span>
        </div>
        <a
          href={`${SEPOLIA_EXPLORER_URL}/address/${GIWA_L1_STANDARD_BRIDGE_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between pt-1 text-white/40 hover:text-accent-gold"
        >
          <span className="flex items-center gap-1.5 text-xs">
            <InfoIcon width="13" height="13" />
            Bridge contract on Sepolia Etherscan
          </span>
          <ExternalLinkIcon width="12" height="12" />
        </a>
        <p className="pt-1 text-[11px] leading-snug text-white/35">
          This bridge only supports deposits from Ethereum Sepolia to {CHAIN_NAME} right now. Withdrawing
          back to Sepolia isn&apos;t available in this view yet.
        </p>
      </div>

      {txError && (
        <p className="mt-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">
          {txError}
        </p>
      )}
      {pendingHash && !txHash && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-accent-gold/30 bg-accent-gold/10 px-4 py-2.5 text-sm text-accent-gold">
          <ClockIcon width="14" height="14" />
          Waiting for confirmation on Sepolia — {truncateHash(pendingHash)}
        </p>
      )}
      {txHash && (
        <div className="mt-3 rounded-xl border border-accent-green/30 bg-accent-green/10 px-4 py-2.5 text-sm text-accent-green">
          <p className="flex items-center gap-2">
            <CheckCircleIcon width="14" height="14" />
            Deposit confirmed on Sepolia — {truncateHash(txHash)}
          </p>
          <p className="mt-1 text-xs text-accent-green/80">
            Watching your {CHAIN_NAME} balance — it usually updates within 1–3 minutes.
          </p>
        </div>
      )}

      <button
        onClick={handlePrimaryButton}
        disabled={submitting || connecting}
        className="mt-4 w-full rounded-xl bg-accent-gold py-3.5 text-center font-semibold text-black disabled:opacity-60"
      >
        {primaryLabel}
      </button>

      {history.length > 0 && (
        <div className="mt-4 rounded-2xl bg-bg-panel card-border p-4">
          <h3 className="font-display text-sm font-bold text-white">Recent Bridge Activity</h3>
          <div className="mt-2 divide-y divide-bg-border">
            {history.map((h) => (
              <div key={h.hash} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-white">{formatBalance(h.amount)} ETH</p>
                  <p className="text-[11px] text-white/40">{new Date(h.time).toLocaleTimeString()}</p>
                </div>
                <a
                  href={`${SEPOLIA_EXPLORER_URL}/tx/${h.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-accent-gold hover:underline"
                >
                  View tx
                  <ExternalLinkIcon width="11" height="11" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => window.open(`${EXPLORER_URL}/address/${address || ""}`, "_blank")}
        disabled={!address}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-3 text-sm font-medium text-white/80 disabled:opacity-40"
      >
        <CopyIcon width="14" height="14" />
        View wallet on {CHAIN_NAME} Explorer
      </button>
    </section>
  );
}
