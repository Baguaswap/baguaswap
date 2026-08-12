"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { CHAIN_ID, DEFAULT_NETWORK, NETWORKS, RPC_URL, WALLETCONNECT_PROJECT_ID, COINGECKO_ID_BY_SYMBOL, getWalletTierIcon } from "./config";

const WalletContext = createContext(null);

let wcProviderPromise = null;

async function getWalletConnectProvider() {
  if (!wcProviderPromise) {
    wcProviderPromise = import("@walletconnect/ethereum-provider").then(({ EthereumProvider }) =>
      EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        optionalChains: [CHAIN_ID],
        rpcMap: { [CHAIN_ID]: RPC_URL },
        optionalMethods: ["wallet_switchEthereumChain", "wallet_addEthereumChain"],
        showQrModal: true,
        metadata: {
          name: "Bagua Swap",
          description: "Bagua Swap — DEX & Launchpad on Giwa Chain",
          url: typeof window !== "undefined" ? window.location.origin : "https://baguaswap.vercel.app",
          icons: [
            (typeof window !== "undefined" ? window.location.origin : "https://baguaswap.vercel.app") + "/logo.png",
          ],
        },
      })
    );
  }
  return wcProviderPromise;
}

function buildChainParams(network) {
  return {
    chainId: "0x" + network.chainId.toString(16),
    chainName: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: network.rpcUrls,
    blockExplorerUrls: network.blockExplorerUrls,
  };
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(DEFAULT_NETWORK);
  const [usdPrice, setUsdPrice] = useState(null);
  const [usdChangePct, setUsdChangePct] = useState(null);
  const [portfolioChangePct, setPortfolioChangePct] = useState(null);
  const [showUsd, setShowUsd] = useState(false);
  const activeProviderRef = useRef(null);

  const PORTFOLIO_HISTORY_PREFIX = "bagua_portfolio_history:";
  const PORTFOLIO_HISTORY_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // keep 30 days
  const PORTFOLIO_SNAPSHOT_MIN_GAP_MS = 5 * 60 * 1000; // don't spam snapshots
  const PORTFOLIO_REFERENCE_MIN_AGE_MS = 20 * 60 * 60 * 1000; // needs to be ~24h old

  // Records how much the wallet's TOTAL value is worth right now, and
  // derives the 24H change from a snapshot taken ~24h ago — i.e. real
  // profit/loss on the wallet (price moves + deposits/withdrawals/swaps
  // all included), not just "did ETH's price go up". Snapshots live in
  // localStorage per address, so the history only exists on this device
  // and builds up the more the wallet is used.
  const recordPortfolioSnapshot = useCallback((addr, value) => {
    if (!addr || value == null || Number.isNaN(value) || typeof window === "undefined") {
      setPortfolioChangePct(null);
      return;
    }
    const key = PORTFOLIO_HISTORY_PREFIX + addr.toLowerCase();
    let history = [];
    try {
      history = JSON.parse(window.localStorage.getItem(key) || "[]");
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }

    const now = Date.now();
    history = history.filter((p) => p && now - p.t < PORTFOLIO_HISTORY_MAX_AGE_MS);

    const last = history[history.length - 1];
    if (!last || now - last.t >= PORTFOLIO_SNAPSHOT_MIN_GAP_MS) {
      history.push({ t: now, v: value });
      try {
        window.localStorage.setItem(key, JSON.stringify(history));
      } catch {
      }
    }

    const target = now - 24 * 60 * 60 * 1000;
    let reference = null;
    for (const point of history) {
      if (point.t <= target) reference = point;
      else break;
    }

    if (!reference || now - reference.t < PORTFOLIO_REFERENCE_MIN_AGE_MS || reference.v <= 0) {
      setPortfolioChangePct(null);
      return;
    }

    const pct = ((value - reference.v) / reference.v) * 100;
    setPortfolioChangePct(Number.isFinite(pct) ? pct : null);
  }, []);

  const getEthereum = () => (typeof window !== "undefined" ? window.ethereum : null);
  const getActiveProvider = () => activeProviderRef.current || getEthereum();

  const refreshBalance = useCallback(async (addr) => {
    const ethereum = getActiveProvider();
    if (!ethereum || !addr) return;
    const provider = new BrowserProvider(ethereum);
    const raw = await provider.getBalance(addr);
    setBalance(formatEther(raw));
  }, []);

  const refreshUsdPrice = useCallback(async (network) => {
    const targetNetwork = network || selectedNetwork;
    const coingeckoId = COINGECKO_ID_BY_SYMBOL[targetNetwork?.nativeCurrency?.symbol];
    if (!coingeckoId) {
      setUsdPrice(null);
      setUsdChangePct(null);
      return;
    }
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await res.json();
      const price = data?.[coingeckoId]?.usd;
      const changePct = data?.[coingeckoId]?.usd_24h_change;
      setUsdPrice(typeof price === "number" ? price : null);
      setUsdChangePct(typeof changePct === "number" ? changePct : null);
    } catch {
    }
  }, [selectedNetwork]);

  const switchToNetwork = useCallback(async (network) => {
    const ethereum = getActiveProvider();
    if (!ethereum) return;
    const params = buildChainParams(network);
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: params.chainId }],
      });
    } catch (switchError) {
      // Chain not added yet — ask the wallet to add it.
      if (switchError?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [params],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const switchToGiwaChain = useCallback(async () => {
    await switchToNetwork(DEFAULT_NETWORK);
  }, [switchToNetwork]);

  const bindProviderEvents = useCallback(
    (ethereum) => {
      if (ethereum.__baguaEventsBound) return;
      ethereum.__baguaEventsBound = true;

      const handleAccountsChanged = (accounts) => {
        if (!accounts || accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
          refreshBalance(accounts[0]);
        }
      };
      const handleChainChanged = (hexChainId) => {
        setChainId(parseInt(hexChainId, 16));
      };
      const handleDisconnect = () => disconnect();

      ethereum.on?.("accountsChanged", handleAccountsChanged);
      ethereum.on?.("chainChanged", handleChainChanged);
      ethereum.on?.("disconnect", handleDisconnect);
    },
    []
  );

  const connect = useCallback(
    async (network) => {
      const targetNetwork = network || selectedNetwork;
      const ethereum = getEthereum();
      if (!ethereum) {
        setError("No wallet found. Install MetaMask or another Web3 wallet.");
        return;
      }
      setConnecting(true);
      setError(null);
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        activeProviderRef.current = ethereum;

        try {
          await switchToNetwork(targetNetwork);
        } catch (switchErr) {
          console.warn("Couldn't auto-switch network:", switchErr);
        }

        const chainHex = await ethereum.request({ method: "eth_chainId" });
        setAddress(accounts[0]);
        setChainId(parseInt(chainHex, 16));
        setSelectedNetwork(targetNetwork);
        await refreshBalance(accounts[0]);
        refreshUsdPrice(targetNetwork);
      } catch (err) {
        setError(err?.message || "Failed to connect wallet.");
      } finally {
        setConnecting(false);
      }
    },
    [refreshBalance, refreshUsdPrice, switchToNetwork, selectedNetwork]
  );

  const connectWalletConnect = useCallback(
    async (network) => {
      const targetNetwork = network || selectedNetwork;
      if (!WALLETCONNECT_PROJECT_ID) {
        setError("WalletConnect isn't configured yet — missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.");
        return;
      }
      setConnecting(true);
      setError(null);
      try {
        const wcProvider = await getWalletConnectProvider();
        await wcProvider.enable();
        const accounts = wcProvider.accounts;
        activeProviderRef.current = wcProvider;
        bindProviderEvents(wcProvider);

        try {
          await switchToNetwork(targetNetwork);
        } catch (switchErr) {
          console.warn("Couldn't auto-switch network:", switchErr);
        }

        setAddress(accounts[0]);
        setChainId(wcProvider.chainId);
        setSelectedNetwork(targetNetwork);
        await refreshBalance(accounts[0]);
        refreshUsdPrice(targetNetwork);
      } catch (err) {
        setError(err?.message || "Failed to connect via WalletConnect.");
      } finally {
        setConnecting(false);
      }
    },
    [refreshBalance, refreshUsdPrice, switchToNetwork, selectedNetwork, bindProviderEvents]
  );

  const disconnect = useCallback(() => {
    if (activeProviderRef.current?.disconnect) {
      activeProviderRef.current.disconnect().catch(() => {});
    }
    activeProviderRef.current = null;
    setAddress(null);
    setBalance(null);
    setChainId(null);
    setPortfolioChangePct(null);
  }, []);

  useEffect(() => {
    if (!WALLETCONNECT_PROJECT_ID) return;
    let cancelled = false;

    const tryRestore = async () => {
      try {
        const wcProvider = await getWalletConnectProvider();
        bindProviderEvents(wcProvider);
        if (cancelled) return;
        if (wcProvider.session && wcProvider.accounts?.length && !activeProviderRef.current) {
          activeProviderRef.current = wcProvider;
          setAddress(wcProvider.accounts[0]);
          setChainId(wcProvider.chainId);
          await refreshBalance(wcProvider.accounts[0]);
          refreshUsdPrice();
        }
      } catch {
      }
    };

    tryRestore();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") tryRestore();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    let cancelled = false;

    const tryRestoreInjected = async () => {
      if (activeProviderRef.current) return; 
      try {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (cancelled || !accounts || accounts.length === 0 || activeProviderRef.current) return;

        bindProviderEvents(ethereum);
        activeProviderRef.current = ethereum;

        const chainHex = await ethereum.request({ method: "eth_chainId" });
        const restoredChainId = parseInt(chainHex, 16);
        setChainId(restoredChainId)
        const matchedNetwork = NETWORKS.find((n) => n.chainId === restoredChainId) || DEFAULT_NETWORK;
        setSelectedNetwork(matchedNetwork);

        setAddress(accounts[0]);
        await refreshBalance(accounts[0]);
        refreshUsdPrice(matchedNetwork);
      } catch {
      }
    };

    tryRestoreInjected();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        refreshBalance(accounts[0]);
      }
    };
    const handleChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect, refreshBalance]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => refreshUsdPrice(), 60_000);
    return () => clearInterval(interval);
  }, [address, refreshUsdPrice]);

  const toggleShowUsd = useCallback(() => setShowUsd((v) => !v), []);

  const usdBalance = useMemo(() => {
    if (balance == null || usdPrice == null) return null;
    return Number(balance) * usdPrice;
  }, [balance, usdPrice]);

  const walletTierIconUrl = useMemo(() => getWalletTierIcon(usdBalance), [usdBalance]);

  const value = useMemo(
    () => ({
      address,
      balance,
      chainId,
      connecting,
      error,
      selectedNetwork,
      usdPrice,
      usdChangePct,
      usdBalance,
      portfolioChangePct,
      recordPortfolioSnapshot,
      showUsd,
      toggleShowUsd,
      walletTierIconUrl,
      isOnGiwaChain: chainId === CHAIN_ID,
      connect,
      connectWalletConnect,
      disconnect,
      clearError,
      switchToGiwaChain,
      switchToNetwork,
      refreshUsdPrice,
    }),
    [
      address,
      balance,
      chainId,
      connecting,
      error,
      selectedNetwork,
      usdPrice,
      usdChangePct,
      usdBalance,
      portfolioChangePct,
      recordPortfolioSnapshot,
      showUsd,
      toggleShowUsd,
      walletTierIconUrl,
      connect,
      connectWalletConnect,
      disconnect,
      clearError,
      switchToGiwaChain,
      switchToNetwork,
      refreshUsdPrice,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
