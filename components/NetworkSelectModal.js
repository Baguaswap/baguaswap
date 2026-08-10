"use client";

import { useMemo, useState } from "react";
import { CloseIcon, SearchIcon, CheckCircleIcon, LockIcon, EthIcon, CHAIN_ICON_MAP } from "@/components/icons";
import { NETWORKS } from "@/lib/config";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "mainnet", label: "Mainnet" },
  { id: "testnet", label: "Testnet" },
];

const LIVE_NETWORK_ID = "giwa-chain";

export default function NetworkSelectModal({ open, onClose, onSelect, selectedNetworkId }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredNetworks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NETWORKS.filter((network) => {
      const matchesFilter = filter === "all" || network.type === filter;
      const matchesQuery = !q || network.name.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close popup overlay"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[80vh] w-full flex-col rounded-t-2xl bg-bg-panel card-border p-5 shadow-glow sm:max-w-sm sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">Select Network</h3>
          <button
            onClick={onClose}
            aria-label="Close popup"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white"
          >
            <CloseIcon width="16" height="16" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-bg-card card-border px-3 py-2.5">
          <SearchIcon width="16" height="16" className="shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search network"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        <div className="mt-3 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.id ? "bg-accent-purple text-white" : "bg-bg-card card-border text-white/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {filteredNetworks.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">No network found</p>
          ) : (
            filteredNetworks.map((network) => {
              const isSelected = network.id === selectedNetworkId;
              const isLive = network.id === LIVE_NETWORK_ID;
              return (
                <button
                  key={network.id}
                  onClick={() => isLive && onSelect(network)}
                  disabled={!isLive}
                  aria-disabled={!isLive}
                  className={`flex w-full items-center gap-3 rounded-xl bg-bg-card card-border px-3 py-3 text-left ${
                    isLive ? "hover:bg-white/5" : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {network.iconUrl ? (
                    <img src={network.iconUrl} alt="" className="h-8 w-8 shrink-0 rounded-full" />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80">
                      {(() => {
                        const ChainIcon = CHAIN_ICON_MAP[network.icon] || EthIcon;
                        return <ChainIcon width="18" height="18" />;
                      })()}
                    </span>
                  )}
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-white">{network.name}</span>
                    <span className="block text-xs capitalize text-white/40">{network.type}</span>
                  </span>
                  {isLive ? (
                    isSelected && <CheckCircleIcon width="18" height="18" className="shrink-0 text-accent-purple" />
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-gold px-2 py-0.5 text-[10px] font-bold uppercase leading-tight text-black">
                      <LockIcon width="10" height="10" />
                      Soon
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
