"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/lib/WalletProvider";
import { EXPLORER_URL } from "@/lib/config";
import {
  CloseIcon,
  CopyIcon,
  ExternalLinkIcon,
  HomeIcon,
  SwapIcon,
  SearchIcon,
  RocketIcon,
  DropletIcon,
  WalletIcon,
  PieChartIcon,
  UserPlusIcon,
  GiftIcon,
  VoteIcon,
  DocsIcon,
  ShieldCheckIcon,
  HeadsetIcon,
  SettingsIcon,
  MoonIcon,
  LogoutIcon,
  CompassIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  { label: "Home", icon: HomeIcon, route: "/" },
  { label: "Discover", icon: CompassIcon, route: "/discover" },
  { label: "Swap", icon: SwapIcon, route: "/swap" },
  { label: "DEX Screener", icon: SearchIcon, route: "/dex", badge: "New" },
  { label: "Launchpad", icon: RocketIcon, route: null },
  { label: "Liquidity", icon: DropletIcon, route: "/liquidity" },
  { label: "Wallet", icon: WalletIcon, route: "/wallet" },
  { label: "Portfolio", icon: PieChartIcon, route: null, badge: "New" },
  { label: "Referrals", icon: UserPlusIcon, route: null },
  { label: "Airdrop", icon: GiftIcon, route: null, badge: "New" },
  { label: "Voting", icon: VoteIcon, route: null },
];

const FOOTER_LINKS = [
  { label: "Docs", icon: DocsIcon, external: true, route: "/docs" },
  { label: "Audit", icon: ShieldCheckIcon, external: true, route: null },
  { label: "Support", icon: HeadsetIcon, external: true, route: null },
  { label: "Settings", icon: SettingsIcon, external: false, route: null },
];

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Sidebar({ open, onClose, activeItem = "Home", onNavigate }) {
  const { address, connect, disconnect, connecting, walletTierIconUrl } = useWallet();
  const [darkMode, setDarkMode] = useState(true);

  const handleCopy = () => {
    if (address) navigator.clipboard.writeText(address);
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close menu overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[85%] max-w-[340px] bg-bg-panel card-border border-l-0
          transition-transform duration-300 ease-out flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Bagua Swap logo" className="h-9 w-9 rounded-lg" />
            <div className="leading-tight">
              <p className="font-display font-bold text-white">BAGUA</p>
              <p className="font-display font-bold text-accent-purple -mt-1">SWAP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-bg-border text-white/70 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {address && (
          <div className="mx-5 mb-4 flex items-center justify-between rounded-xl bg-bg-card card-border px-4 py-3">
            <div className="flex items-center gap-2">
              <img src={walletTierIconUrl} alt="" className="h-7 w-7 shrink-0 rounded-full" />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                  {truncateAddress(address)}
                  <button onClick={handleCopy} aria-label="Copy address" className="text-white/50 hover:text-white">
                    <CopyIcon />
                  </button>
                </div>
                <a
                  href={`${EXPLORER_URL}/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-accent-purple"
                >
                  View on Explorer <ExternalLinkIcon width="12" height="12" />
                </a>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 no-scrollbar">
          {NAV_ITEMS.map(({ label, icon: Icon, badge, route }) => {
            const active = label === activeItem;
            const itemClassName = `flex items-center justify-between rounded-lg px-3 py-2.5 mb-1 text-[15px] transition-colors
              ${active ? "bg-accent-purple/15 text-accent-purple" : "text-white/85 hover:bg-white/5"}`;
            const content = (
              <>
                <span className="flex items-center gap-3">
                  <Icon />
                  {label}
                </span>
                {badge && (
                  <span className="rounded-md bg-accent-purple/20 px-2 py-0.5 text-[11px] font-medium text-accent-violet">
                    {badge}
                  </span>
                )}
              </>
            );

            if (route) {
              return (
                <Link key={label} href={route} onClick={onClose} className={itemClassName}>
                  {content}
                </Link>
              );
            }

            return (
              <a
                key={label}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.(label);
                }}
                className={itemClassName}
              >
                {content}
              </a>
            );
          })}
        </nav>

        <div className="px-3 pb-2 pt-2 border-t border-bg-border">
          {FOOTER_LINKS.map(({ label, icon: Icon, external, route }) => {
            const itemClassName =
              "flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] text-white/85 hover:bg-white/5";
            const content = (
              <>
                <span className="flex items-center gap-3">
                  <Icon />
                  {label}
                </span>
                {external ? <ExternalLinkIcon width="14" height="14" className="text-white/40" /> : (
                  <span className="text-white/30">›</span>
                )}
              </>
            );

            if (route) {
              return (
                <Link key={label} href={route} onClick={onClose} className={itemClassName}>
                  {content}
                </Link>
              );
            }

            return (
              <a
                key={label}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.(label);
                }}
                className={itemClassName}
              >
                {content}
              </a>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-bg-border">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-3 text-[15px] text-white/85">
              <MoonIcon />
              Dark Mode
            </span>
            <button
              onClick={() => setDarkMode((v) => !v)}
              aria-label="Toggle dark mode"
              className={`relative h-6 w-11 rounded-full transition-colors ${darkMode ? "bg-accent-purple" : "bg-white/15"}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {address ? (
            <button
              onClick={disconnect}
              className="flex w-full items-center gap-3 rounded-lg border border-accent-red/30 px-3 py-2.5 text-[15px] text-accent-red hover:bg-accent-red/10"
            >
              <LogoutIcon />
              Disconnect Wallet
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="flex w-full items-center gap-3 rounded-lg border border-accent-purple/30 bg-accent-purple/15 px-3 py-2.5 text-[15px] text-accent-purple hover:bg-accent-purple/25 disabled:opacity-60"
            >
              <WalletIcon />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

