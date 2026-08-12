"use client";

import { useState } from "react";
import { MenuIcon, BellIcon, ChevronDownIcon, WalletIcon, CloseIcon } from "@/components/icons";
import { useWallet } from "@/lib/WalletProvider";
import { formatBalance, formatUsd } from "@/lib/format";
import WalletConnectModal from "@/components/WalletConnectModal";
import WalletPanelModal from "@/components/WalletPanelModal";
import SendReceiveModal from "@/components/SendReceiveModal";

export default function Header({ onOpenMenu, onComingSoon }) {
  const [walletConnectModalOpen, setWalletConnectModalOpen] = useState(false);
  const [walletPanelOpen, setWalletPanelOpen] = useState(false);
  const [sendReceiveOpen, setSendReceiveOpen] = useState(false);
  const [sendReceiveTab, setSendReceiveTab] = useState("Send");
  const {
    address,
    balance,
    usdBalance,
    showUsd,
    walletTierIconUrl,
    connecting,
    error,
    connect,
    clearError,
    selectedNetwork,
  } = useWallet();

  const handleSelectWallet = () => {
    setWalletConnectModalOpen(false);
    connect();
  };

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-white/80 hover:text-white"
          >
            <MenuIcon />
          </button>
          <img src="/logo.png" alt="Bagua Swap logo" className="h-9 w-9 shrink-0 rounded-lg" />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full border border-accent-gold/40 bg-accent-gold/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
            Testnet
          </span>

          {address ? (
            <button
              onClick={() => setWalletPanelOpen(true)}
              className="flex items-center gap-1 rounded-full bg-bg-card card-border pl-1 pr-2 py-1 text-xs font-semibold text-white/90"
            >
              <img src={walletTierIconUrl} alt="" className="h-[18px] w-[18px] rounded-full" />
              {showUsd ? formatUsd(usdBalance) : `${formatBalance(balance)} ${selectedNetwork.nativeCurrency?.symbol}`}
              <ChevronDownIcon width="12" height="12" />
            </button>
          ) : (
            <button
              onClick={() => setWalletConnectModalOpen(true)}
              disabled={connecting}
              className="flex items-center gap-1 rounded-full bg-accent-purple px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              <WalletIcon width="14" height="14" />
              {connecting ? "Connecting..." : "Connect"}
            </button>
          )}

          <button
            onClick={() => onComingSoon?.("Notifications")}
            aria-label="Notifications"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-card card-border text-white/80"
          >
            <BellIcon />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-purple text-[10px] font-semibold text-white">
              1
            </span>
          </button>
        </div>

        <WalletConnectModal
          open={walletConnectModalOpen}
          onClose={() => setWalletConnectModalOpen(false)}
          onSelectWallet={handleSelectWallet}
        />

        <WalletPanelModal
          open={walletPanelOpen}
          onClose={() => setWalletPanelOpen(false)}
          onAction={(action) => {
            setWalletPanelOpen(false);
            if (action === "Deposit") {
              setSendReceiveTab("Receive");
              setSendReceiveOpen(true);
            } else if (action === "Withdraw") {
              setSendReceiveTab("Send");
              setSendReceiveOpen(true);
            } else {
              onComingSoon?.(action);
            }
          }}
        />

        <SendReceiveModal
          open={sendReceiveOpen}
          initialTab={sendReceiveTab}
          onClose={() => setSendReceiveOpen(false)}
        />
      </header>

      {error && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">
          <span className="flex-1">{error}</span>
          <button onClick={clearError} aria-label="Dismiss error" className="shrink-0 text-red-200/70 hover:text-red-100">
            <CloseIcon width="14" height="14" />
          </button>
        </div>
      )}
    </>
  );
}
