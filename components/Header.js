"use client";

import { useState } from "react";
import { MenuIcon, BellIcon, ChevronDownIcon, WalletIcon, EthIcon, CHAIN_ICON_MAP, CloseIcon } from "@/components/icons";
import { useWallet } from "@/lib/WalletProvider";
import { formatBalance, formatUsd } from "@/lib/format";
import NetworkSelectModal from "@/components/NetworkSelectModal";
import WalletConnectModal from "@/components/WalletConnectModal";
import WalletPanelModal from "@/components/WalletPanelModal";

export default function Header({ onOpenMenu, onComingSoon }) {
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [walletConnectModalOpen, setWalletConnectModalOpen] = useState(false);
  const [walletPanelOpen, setWalletPanelOpen] = useState(false);
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

  const handleSelectNetwork = (network) => {
    setNetworkModalOpen(false);
    connect(network);
  };

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
          <button
            onClick={() => setNetworkModalOpen(true)}
            className="flex items-center gap-1 rounded-full bg-bg-card card-border px-2.5 py-1.5 text-xs text-white/90"
          >
            {selectedNetwork.iconUrl ? (
              <img src={selectedNetwork.iconUrl} alt="" className="h-3.5 w-3.5 rounded-full" />
            ) : (
              (() => {
                const ChainIcon = CHAIN_ICON_MAP[selectedNetwork.icon] || EthIcon;
                return <ChainIcon width="14" height="14" />;
              })()
            )}
            {selectedNetwork.name}
            <ChevronDownIcon width="14" height="14" />
          </button>

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

        <NetworkSelectModal
          open={networkModalOpen}
          onClose={() => setNetworkModalOpen(false)}
          onSelect={handleSelectNetwork}
          selectedNetworkId={selectedNetwork.id}
        />

        <WalletPanelModal
          open={walletPanelOpen}
          onClose={() => setWalletPanelOpen(false)}
          onAction={(action) => {
            setWalletPanelOpen(false);
            onComingSoon?.(action);
          }}
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
