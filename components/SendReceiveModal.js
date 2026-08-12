"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatUnits, isAddress, parseEther, parseUnits } from "ethers";
import { useWallet } from "@/lib/WalletProvider";
import { CHAIN_NAME, ERC20_ABI, EXPLORER_URL, TOKEN_ADDRESS } from "@/lib/config";
import { getReadProvider } from "@/lib/pricing";
import { formatBalance, formatUsd } from "@/lib/format";
import {
  CloseIcon,
  CopyIcon,
  ShareIcon,
  SendIcon,
  ReceiveIcon,
  ClockIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  WalletIcon,
} from "@/components/icons";

// Native-token gas buffer, mirrors BridgeView's MAX behavior so a MAX send
// never leaves the user unable to pay gas for the transfer itself.
const GAS_BUFFER = 0.0015;

function truncateHash(hash) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export default function SendReceiveModal({ open, initialTab = "Send", onClose }) {
  const {
    address,
    balance,
    usdPrice,
    selectedNetwork,
    connecting,
    connect,
    isOnGiwaChain,
    switchToGiwaChain,
    refreshBalance,
  } = useWallet();

  const [tab, setTab] = useState(initialTab);

  const [assetKey, setAssetKey] = useState("native"); // "native" | "bag" | "custom"
  const [bagMeta, setBagMeta] = useState(null); // { symbol, decimals, balance }
  const [customAddress, setCustomAddress] = useState("");
  const [customMeta, setCustomMeta] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState(null);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingHash, setPendingHash] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);

  const [copied, setCopied] = useState(false);

  const readProvider = useMemo(() => getReadProvider(), []);
  const nativeSymbol = selectedNetwork?.nativeCurrency?.symbol || "ETH";

  // Fresh state every time the sheet is opened, so a previous Send doesn't
  // linger into the next visit.
  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setAssetKey("native");
    setCustomAddress("");
    setCustomMeta(null);
    setCustomError(null);
    setRecipient("");
    setAmount("");
    setSubmitting(false);
    setPendingHash(null);
    setTxHash(null);
    setTxError(null);
    setCopied(false);
  }, [open, initialTab]);

  const loadBagMeta = useCallback(async () => {
    if (!TOKEN_ADDRESS || !address) {
      setBagMeta(null);
      return;
    }
    try {
      const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, readProvider);
      const [symbol, decimals, raw] = await Promise.all([
        token.symbol().catch(() => "BAG"),
        token.decimals().catch(() => 18),
        token.balanceOf(address).catch(() => 0n),
      ]);
      setBagMeta({ symbol, decimals: Number(decimals), balance: formatUnits(raw, Number(decimals)) });
    } catch {
      setBagMeta(null);
    }
  }, [address, readProvider]);

  useEffect(() => {
    if (open && tab === "Send") loadBagMeta();
  }, [open, tab, loadBagMeta]);

  // Look up any pasted ERC-20 contract address: symbol, decimals, balance.
  useEffect(() => {
    if (assetKey !== "custom" || !customAddress) {
      setCustomMeta(null);
      setCustomError(null);
      setCustomLoading(false);
      return;
    }
    if (!isAddress(customAddress)) {
      setCustomMeta(null);
      setCustomError("Enter a valid token contract address.");
      return;
    }
    let cancelled = false;
    setCustomLoading(true);
    setCustomError(null);
    const timer = setTimeout(async () => {
      try {
        const token = new Contract(customAddress, ERC20_ABI, readProvider);
        const [symbol, decimals, raw] = await Promise.all([
          token.symbol(),
          token.decimals(),
          address ? token.balanceOf(address) : Promise.resolve(0n),
        ]);
        if (cancelled) return;
        setCustomMeta({ symbol, decimals: Number(decimals), balance: formatUnits(raw, Number(decimals)) });
      } catch {
        if (!cancelled) {
          setCustomMeta(null);
          setCustomError("Couldn't read this token — check the contract address.");
        }
      } finally {
        if (!cancelled) setCustomLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [assetKey, customAddress, address, readProvider]);

  const selectedAsset = useMemo(() => {
    if (assetKey === "native") {
      return { type: "native", symbol: nativeSymbol, decimals: 18, address: null, balance };
    }
    if (assetKey === "bag" && bagMeta) {
      return { type: "erc20", symbol: bagMeta.symbol, decimals: bagMeta.decimals, address: TOKEN_ADDRESS, balance: bagMeta.balance };
    }
    if (assetKey === "custom" && customMeta) {
      return { type: "erc20", symbol: customMeta.symbol, decimals: customMeta.decimals, address: customAddress, balance: customMeta.balance };
    }
    return null;
  }, [assetKey, nativeSymbol, balance, bagMeta, customMeta, customAddress]);

  const applyMax = () => {
    if (!selectedAsset || selectedAsset.balance == null) return;
    if (selectedAsset.type === "native") {
      const max = Math.max(Number(selectedAsset.balance) - GAS_BUFFER, 0);
      setAmount(max > 0 ? max.toFixed(6) : "");
    } else {
      setAmount(selectedAsset.balance);
    }
  };

  const handleSend = async () => {
    setTxError(null);
    setTxHash(null);
    setPendingHash(null);

    if (!selectedAsset) {
      setTxError("Choose an asset to send.");
      return;
    }
    if (!recipient || !isAddress(recipient)) {
      setTxError("Enter a valid recipient address.");
      return;
    }
    if (recipient.toLowerCase() === address?.toLowerCase()) {
      setTxError("Recipient can't be your own address.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setTxError("Enter an amount.");
      return;
    }
    if (selectedAsset.balance != null && Number(amount) > Number(selectedAsset.balance)) {
      setTxError(`Amount exceeds your ${selectedAsset.symbol} balance.`);
      return;
    }

    setSubmitting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      let tx;
      if (selectedAsset.type === "native") {
        tx = await signer.sendTransaction({ to: recipient, value: parseEther(amount) });
      } else {
        const token = new Contract(selectedAsset.address, ERC20_ABI, signer);
        tx = await token.transfer(recipient, parseUnits(amount, selectedAsset.decimals));
      }
      setPendingHash(tx.hash);

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setAmount("");
      setRecipient("");
      refreshBalance?.(address);
      if (assetKey === "bag") loadBagMeta();
    } catch (err) {
      setTxError(err?.shortMessage || err?.reason || err?.message || "Transaction failed. Please try again.");
    } finally {
      setSubmitting(false);
      setPendingHash(null);
    }
  };

  const handlePrimary = () => {
    if (!address) return connect();
    if (!isOnGiwaChain) return switchToGiwaChain();
    return handleSend();
  };

  const primaryLabel = !address
    ? connecting
      ? "Connecting..."
      : "Connect Wallet"
    : !isOnGiwaChain
    ? `Switch to ${CHAIN_NAME}`
    : submitting
    ? "Sending..."
    : "Send";

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  const handleShare = async () => {
    if (!address) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My wallet address", text: address });
      } catch {
      }
    } else {
      handleCopy();
    }
  };

  const qrUrl = address
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(address)}`
    : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close popup overlay"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-bg-panel card-border p-5 shadow-glow sm:max-w-sm sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Wallet</h3>
          <button
            onClick={onClose}
            aria-label="Close popup"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:text-white"
          >
            <CloseIcon width="16" height="16" />
          </button>
        </div>

        <div className="mt-3 flex gap-1 rounded-xl bg-bg-card card-border p-1">
          <button
            onClick={() => setTab("Send")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === "Send" ? "bg-accent-purple text-white" : "text-white/50"
            }`}
          >
            <SendIcon width="15" height="15" />
            Send
          </button>
          <button
            onClick={() => setTab("Receive")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === "Receive" ? "bg-accent-purple text-white" : "text-white/50"
            }`}
          >
            <ReceiveIcon width="15" height="15" />
            Receive
          </button>
        </div>

        {!address ? (
          <div className="mt-5 rounded-xl bg-bg-card card-border py-8 text-center">
            <WalletIcon className="mx-auto text-white/20" width="26" height="26" />
            <p className="mt-3 text-sm text-white/50">
              Connect your wallet to {tab === "Send" ? "send" : "receive"} funds.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="mt-3 rounded-xl bg-accent-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : tab === "Send" ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-white/50">Asset</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAssetKey("native")}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold card-border ${
                    assetKey === "native" ? "border-accent-purple/50 bg-accent-purple/20 text-accent-purple" : "bg-bg-card text-white/70"
                  }`}
                >
                  {nativeSymbol}
                </button>
                {TOKEN_ADDRESS && (
                  <button
                    onClick={() => setAssetKey("bag")}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold card-border ${
                      assetKey === "bag" ? "border-accent-purple/50 bg-accent-purple/20 text-accent-purple" : "bg-bg-card text-white/70"
                    }`}
                  >
                    {bagMeta?.symbol || "BAG"}
                  </button>
                )}
                <button
                  onClick={() => setAssetKey("custom")}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold card-border ${
                    assetKey === "custom" ? "border-accent-purple/50 bg-accent-purple/20 text-accent-purple" : "bg-bg-card text-white/70"
                  }`}
                >
                  Other
                </button>
              </div>
            </div>

            {assetKey === "custom" && (
              <div>
                <input
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value.trim())}
                  placeholder="Token contract address (0x...)"
                  className="w-full rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                />
                {customLoading && <p className="mt-1 text-[11px] text-white/40">Looking up token…</p>}
                {customError && <p className="mt-1 text-[11px] text-accent-red">{customError}</p>}
                {customMeta && !customError && (
                  <p className="mt-1 text-[11px] text-white/40">
                    {customMeta.symbol} · Balance: {formatBalance(customMeta.balance)}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="mb-1.5 text-xs font-medium text-white/50">Recipient address</p>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value.trim())}
                placeholder="0x..."
                className="w-full rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
              />
            </div>

            <div className="rounded-xl bg-bg-card card-border p-3">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Amount</span>
                <span>
                  Balance: {selectedAsset?.balance != null ? formatBalance(selectedAsset.balance) : "—"}{" "}
                  {selectedAsset?.symbol || ""}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.0"
                  className="w-full bg-transparent text-xl font-semibold text-white placeholder-white/30 outline-none"
                />
                <button
                  onClick={applyMax}
                  className="shrink-0 rounded-lg bg-accent-gold/15 px-2.5 py-1 text-xs font-semibold text-accent-gold"
                >
                  MAX
                </button>
              </div>
              {assetKey === "native" && usdPrice != null && amount && (
                <p className="mt-1 text-[11px] text-white/35">≈ {formatUsd(Number(amount) * usdPrice)}</p>
              )}
            </div>

            {txError && (
              <p className="rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">
                {txError}
              </p>
            )}
            {pendingHash && !txHash && (
              <p className="flex items-center gap-2 rounded-xl border border-accent-gold/30 bg-accent-gold/10 px-4 py-2.5 text-sm text-accent-gold">
                <ClockIcon width="14" height="14" />
                Waiting for confirmation — {truncateHash(pendingHash)}
              </p>
            )}
            {txHash && (
              <div className="rounded-xl border border-accent-green/30 bg-accent-green/10 px-4 py-2.5 text-sm text-accent-green">
                <p className="flex items-center gap-2">
                  <CheckCircleIcon width="14" height="14" />
                  Sent — transaction confirmed
                </p>
                <a
                  href={`${EXPLORER_URL}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-accent-green/80 hover:underline"
                >
                  View on {CHAIN_NAME} Explorer
                  <ExternalLinkIcon width="11" height="11" />
                </a>
              </div>
            )}

            <button
              onClick={handlePrimary}
              disabled={submitting || connecting || (assetKey === "custom" && !customMeta)}
              className="w-full rounded-xl bg-accent-purple py-3.5 text-center font-semibold text-white disabled:opacity-60"
            >
              {primaryLabel}
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-center">
            <p className="text-sm text-white/50">
              Only send {selectedNetwork?.name || CHAIN_NAME} assets to this address. Sending from the wrong
              network may result in permanent loss.
            </p>

            <div className="mx-auto flex w-fit items-center justify-center rounded-2xl bg-white p-3">
              {qrUrl ? (
                <img src={qrUrl} alt="Wallet address QR code" width="200" height="200" className="h-[200px] w-[200px]" />
              ) : (
                <div className="flex h-[200px] w-[200px] items-center justify-center text-xs text-black/40">No address</div>
              )}
            </div>

            <div className="rounded-xl bg-bg-card card-border px-4 py-3">
              <p className="text-[11px] text-white/40">Your address on {selectedNetwork?.name || CHAIN_NAME}</p>
              <p className="mt-1 break-all font-mono text-sm text-white">{address}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5"
              >
                <CopyIcon width="14" height="14" />
                {copied ? "Copied!" : "Copy Address"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5"
              >
                <ShareIcon width="14" height="14" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
