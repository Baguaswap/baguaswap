"use client";

import { useState } from "react";
import { useWallet } from "@/lib/WalletProvider";
import { EXPLORER_URL } from "@/lib/config";
import { formatBalance, formatUsd } from "@/lib/format";
import {
  CloseIcon,
  CopyIcon,
  ShareIcon,
  EyeIcon,
  SwapIcon,
  ClockIcon,
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  LogoutIcon,
} from "@/components/icons";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletPanelModal({ open, onClose, onAction }) {
  const {
    address,
    balance,
    usdBalance,
    showUsd,
    toggleShowUsd,
    walletTierIconUrl,
    selectedNetwork,
    disconnect,
  } = useWallet();
  const [hidden, setHidden] = useState(false);

  if (!open || !address) return null;

  const handleCopy = () => navigator.clipboard.writeText(address);

  const nativeText = `${formatBalance(balance)} ${selectedNetwork.nativeCurrency?.symbol}`;
  const usdText = formatUsd(usdBalance);
  const primaryText = showUsd ? usdText : nativeText;
  const secondaryText = showUsd ? nativeText : usdText;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close popup overlay"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative w-full rounded-t-2xl bg-bg-panel card-border p-5 shadow-glow sm:max-w-sm sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={walletTierIconUrl} alt="" className="h-[30px] w-[30px] shrink-0 rounded-full" />
            <div>
              <p className="text-sm font-semibold text-white">{truncateAddress(address)}</p>
              <p className="text-[11px] text-white/40">{selectedNetwork.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              aria-label="Copy address"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:text-white"
            >
              <ShareIcon />
            </button>
            <button
              onClick={onClose}
              aria-label="Close popup"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:text-white"
            >
              <CloseIcon width="16" height="16" />
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-bg-card card-border px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Your Balance</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHidden((v) => !v)}
                aria-label="Toggle balance visibility"
                className="text-white/40 hover:text-white"
              >
                <EyeIcon />
              </button>
              <button
                onClick={toggleShowUsd}
                aria-label="Switch between native token and USD value"
                className="text-white/40 hover:text-white"
              >
                <SwapIcon width="16" height="16" />
              </button>
            </div>
          </div>
          <p className="mt-1 font-display text-3xl font-bold text-white">{hidden ? "••••" : primaryText}</p>
          <p className="mt-0.5 text-xs text-white/40">{hidden ? "Available" : `${secondaryText} · Available`}</p>

          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
          >
            {truncateAddress(address)}
            <CopyIcon width="13" height="13" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => onAction?.("Deposit")}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-card card-border px-2 py-3 text-center hover:bg-white/5"
          >
            <ArrowDownToLineIcon className="text-accent-green" />
            <span className="text-xs font-semibold text-white">Deposit</span>
            <span className="text-[10px] text-white/40">Crypto transfer</span>
          </button>
          <button
            onClick={() => onAction?.("Withdraw")}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-card card-border px-2 py-3 text-center hover:bg-white/5"
          >
            <ArrowUpFromLineIcon className="text-accent-purple" />
            <span className="text-xs font-semibold text-white">Withdraw</span>
            <span className="text-[10px] text-white/40">Send to wallet</span>
          </button>
          <a
            href={`${EXPLORER_URL}/address/${address}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-card card-border px-2 py-3 text-center hover:bg-white/5"
          >
            <ClockIcon className="text-accent-gold" />
            <span className="text-xs font-semibold text-white">History</span>
            <span className="text-[10px] text-white/40">All activity</span>
          </a>
        </div>

        <button
          onClick={() => {
            disconnect();
            onClose();
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-accent-red/30 px-3 py-2.5 text-sm text-accent-red hover:bg-accent-red/10"
        >
          <LogoutIcon width="16" height="16" />
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
}
