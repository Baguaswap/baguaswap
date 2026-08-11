"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import ComingSoonModal from "@/components/ComingSoonModal";

const PATH_TO_LABEL = {
  "/": "Home",
  "/swap": "Swap",
  "/launchpad": "Launchpad",
  "/dex": "DEX Screener",
  "/wallet": "Wallet",
  "/discover": "Discover",
  "/liquidity": "Liquidity",
  "/docs": "Docs",
};

const ComingSoonContext = createContext(() => {});

export function useComingSoon() {
  return useContext(ComingSoonContext);
}

export default function AppShell({ children }) {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState(null);

  const activeTab = PATH_TO_LABEL[pathname] ?? "Home";

  const handleNavigate = (label) => {
    setComingSoonFeature(label);
  };

  return (
    <ComingSoonContext.Provider value={setComingSoonFeature}>
      <main className="min-h-screen pb-24">
        <Header onOpenMenu={() => setMenuOpen(true)} onComingSoon={setComingSoonFeature} />
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          activeItem={activeTab}
          onNavigate={handleNavigate}
        />

        {children}

        <BottomNav active={activeTab} onSelect={handleNavigate} />

        <ComingSoonModal feature={comingSoonFeature} onClose={() => setComingSoonFeature(null)} />
      </main>
    </ComingSoonContext.Provider>
  );
}
