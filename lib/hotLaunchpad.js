"use client";

// Real on-chain data for the "Hot Launchpad" section on the Home tab, read
// directly from the deployed BaguaLaunchpadFactory + BaguaBondingCurve
// contracts (see /docs/CONTRACTS.md). Same philosophy as lib/burnStats.js:
// nothing here is faked — if the RPC call fails, the contracts aren't
// configured, or a value genuinely can't be determined yet, it comes back
// as null/0/[] instead of a placeholder number.
//
// Scope note: this file (and the data it produces) is only consumed by
// components/HotLaunchpad.js on the Home tab ("/"). Discover, DEX Screener,
// and the /coin/launchpad/[address] detail page are untouched and keep
// reading lib/mockLaunchpadTokens.js exactly as before.

import { useEffect, useState } from "react";
import { Contract, formatUnits } from "ethers";
import {
  LAUNCHPAD_FACTORY_ADDRESS,
  LAUNCHPAD_FACTORY_ABI,
  AMMS_ADDRESS,
  AMMS_ABI,
  ERC20_ABI,
} from "./config";
import { getReadProvider, getBondingCurvePriceInEth, getAmmPriceInEth, getEthUsdPrice, queryLogsWithFallback } from "./pricing";
import { fetchIpfsJson, ipfsUriToGatewayUrl } from "./ipfs";

// Not part of the shared ERC20_ABI (it's specific to BaguaBondingCurveToken),
// so it's merged in locally just for this lookup — same as lib/launchpadToken.js.
const METADATA_URI_ABI = ["function metadataURI() external view returns (string memory)"];

const DAY_MS = 24 * 60 * 60 * 1000;

// Caps how many of the most-recently-created launchpad tokens get scanned
// per refresh, so this stays a handful of RPC round trips even once the
// platform has launched hundreds of tokens.
const MAX_TOKENS_TO_SCAN = 60;

const CACHE_TTL_MS = 30_000;
let cache = null; // { data, fetchedAt }
let inflight = null;

async function attachTimestamps(provider, logs) {
  const uniqueBlocks = [...new Set(logs.map((l) => l.blockNumber))];
  const blockMap = new Map();
  await Promise.all(
    uniqueBlocks.map(async (bn) => {
      try {
        const block = await provider.getBlock(bn);
        blockMap.set(bn, block ? Number(block.timestamp) * 1000 : null);
      } catch {
        blockMap.set(bn, null);
      }
    })
  );
  return logs.map((log) => ({ ...log, timestampMs: blockMap.get(log.blockNumber) ?? null }));
}

function emptyResult() {
  return {
    configured: Boolean(LAUNCHPAD_FACTORY_ADDRESS && AMMS_ADDRESS),
    tokens: [],
  };
}

// Average execution price (ETH per token) of a single TokensPurchased /
// TokensSold log — used as the reference point for a 24h % change, since
// there's no separate price-history indexer to query.
function tradeExecutionPriceEth(log, decimals) {
  const isBuy = log.args?.tokensOut !== undefined;
  const ethAmt = Number(formatUnits(isBuy ? log.args.ethIn : log.args.ethOut, 18));
  const tokenAmt = Number(formatUnits(isBuy ? log.args.tokensOut : log.args.tokensIn, decimals));
  if (!tokenAmt) return null;
  const price = ethAmt / tokenAmt;
  return Number.isFinite(price) && price > 0 ? price : null;
}

async function loadHotLaunchpadTokens() {
  if (!LAUNCHPAD_FACTORY_ADDRESS || !AMMS_ADDRESS) return emptyResult();

  try {
    const provider = getReadProvider();
    const factory = new Contract(LAUNCHPAD_FACTORY_ADDRESS, LAUNCHPAD_FACTORY_ABI, provider);
    const curve = new Contract(AMMS_ADDRESS, AMMS_ABI, provider);

    const total = Number(await factory.tokensLength().catch(() => 0n));
    if (!total) return { configured: true, tokens: [] };

    const limit = Math.min(total, MAX_TOKENS_TO_SCAN);
    const offset = Math.max(0, total - limit); // scan the most recently created tokens first
    const addresses = await factory.getTokensPaginated(offset, limit).catch(() => []);
    if (!addresses.length) return { configured: true, tokens: [] };

    const [buyLogsRaw, sellLogsRaw, createdLogsRaw, ethUsd, tokenSellSupply] = await Promise.all([
      queryLogsWithFallback(curve, curve.filters.TokensPurchased(), provider),
      queryLogsWithFallback(curve, curve.filters.TokensSold(), provider),
      queryLogsWithFallback(factory, factory.filters.TokenCreated(), provider),
      getEthUsdPrice(),
      curve.TOKEN_SELL_SUPPLY().catch(() => null),
    ]);

    // Launch timestamp per token, straight from the TokenCreated log's
    // block — used for the live "Xs / Xm / Xh" age counter on the card
    // (replaces the old static "New" label). null if genuinely unavailable.
    const createdLogsWithTs = await attachTimestamps(provider, createdLogsRaw);
    const createdAtByToken = new Map();
    for (const log of createdLogsWithTs) {
      const key = log.args?.token?.toLowerCase();
      if (key && !createdAtByToken.has(key)) createdAtByToken.set(key, log.timestampMs ?? null);
    }

    const allBlocks = [...buyLogsRaw, ...sellLogsRaw];
    const blockMap = new Map();
    const uniqueBlocks = [...new Set(allBlocks.map((l) => l.blockNumber))];
    await Promise.all(
      uniqueBlocks.map(async (bn) => {
        try {
          const block = await provider.getBlock(bn);
          blockMap.set(bn, block ? Number(block.timestamp) * 1000 : null);
        } catch {
          blockMap.set(bn, null);
        }
      })
    );
    const withTs = (logs) => logs.map((l) => ({ ...l, timestampMs: blockMap.get(l.blockNumber) ?? null }));
    const buyLogs = withTs(buyLogsRaw);
    const sellLogs = withTs(sellLogsRaw);

    const byToken = new Map();
    for (const addr of addresses) byToken.set(addr.toLowerCase(), { buys: [], sells: [] });
    for (const log of buyLogs) {
      const key = log.args?.token?.toLowerCase();
      if (byToken.has(key)) byToken.get(key).buys.push(log);
    }
    for (const log of sellLogs) {
      const key = log.args?.token?.toLowerCase();
      if (byToken.has(key)) byToken.get(key).sells.push(log);
    }

    const cutoff = Date.now() - DAY_MS;

    const tokens = await Promise.all(
      addresses.map(async (address) => {
        const activity = byToken.get(address.toLowerCase()) || { buys: [], sells: [] };

        let name = "Unknown";
        let symbol = "TOKEN";
        let decimals = 18;
        let totalSupplyRaw = 0n;
        let metadataURI = null;
        try {
          const erc20 = new Contract(address, [...ERC20_ABI, ...METADATA_URI_ABI], provider);
          const [n, s, d, ts, meta] = await Promise.all([
            erc20.name().catch(() => "Unknown"),
            erc20.symbol().catch(() => "TOKEN"),
            erc20.decimals().catch(() => 18),
            erc20.totalSupply().catch(() => 0n),
            erc20.metadataURI().catch(() => null),
          ]);
          name = n;
          symbol = s;
          decimals = Number(d);
          totalSupplyRaw = ts;
          metadataURI = meta;
        } catch {
          // Keep the fallback name/symbol/decimals above.
        }

        // Same "never fake a field" rule as everything else in this file:
        // if the metadata JSON can't be fetched/parsed, or has no image,
        // avatarImage stays null and the UI falls back to the letter avatar.
        const meta = metadataURI ? await fetchIpfsJson(metadataURI) : null;
        const avatarImage = meta?.image ? ipfsUriToGatewayUrl(meta.image) : null;
        const createdAtMs = createdAtByToken.get(address.toLowerCase()) ?? null;

        let graduated = false;
        let realEthReserve = 0;
        let tokenReserveRemaining = null;
        try {
          const state = await curve.tokens(address);
          graduated = state.graduated;
          realEthReserve = Number(formatUnits(state.realEthReserve, 18));
          tokenReserveRemaining = state.tokenReserveRemaining;
        } catch {
          // Leave defaults — token state genuinely unreadable right now.
        }

        let bondingProgress = graduated ? 100 : 0;
        if (!graduated && tokenReserveRemaining != null && tokenSellSupply) {
          const soldBps = ((tokenSellSupply - tokenReserveRemaining) * 10000n) / tokenSellSupply;
          bondingProgress = Math.min(100, Math.max(0, Number(soldBps) / 100));
        }

        const priceInEth = graduated
          ? await getAmmPriceInEth(provider, address, decimals)
          : await getBondingCurvePriceInEth(provider, address, decimals);
        const priceUsd = priceInEth != null && ethUsd != null ? priceInEth * ethUsd : null;

        const totalSupply = Number(formatUnits(totalSupplyRaw, decimals));
        const marketCapUsd = priceUsd != null && totalSupply ? priceUsd * totalSupply : null;

        const buys24h = activity.buys.filter((l) => l.timestampMs != null && l.timestampMs >= cutoff);
        const sells24h = activity.sells.filter((l) => l.timestampMs != null && l.timestampMs >= cutoff);
        const buyCount24h = buys24h.length;
        const sellCount24h = sells24h.length;

        const volumeEth24h =
          buys24h.reduce((sum, l) => sum + Number(formatUnits(l.args?.ethIn ?? 0n, 18)), 0) +
          sells24h.reduce((sum, l) => sum + Number(formatUnits(l.args?.ethOut ?? 0n, 18)), 0);
        const volume24h = ethUsd != null ? volumeEth24h * ethUsd : 0;

        // Bonding-curve "liquidity" proxy: the live ETH reserve backing the
        // curve, doubled to represent both sides of the virtual pool (same
        // convention most DEX UIs use for a balanced AMM pair).
        const liquidityUsd = ethUsd != null ? realEthReserve * 2 * ethUsd : null;

        // Best-effort 24h % change: compare the current price to the
        // execution price of the oldest trade inside the 24h window (or the
        // most recent trade before it, if none fall inside the window).
        // null if the token has never traded — never a guessed number.
        const allTrades = [...activity.buys, ...activity.sells]
          .filter((l) => l.timestampMs != null)
          .sort((a, b) => a.timestampMs - b.timestampMs);
        let change = null;
        if (allTrades.length && priceInEth != null) {
          const refTrade = allTrades.find((l) => l.timestampMs >= cutoff) || allTrades[allTrades.length - 1];
          const refPrice = tradeExecutionPriceEth(refTrade, decimals);
          if (refPrice) change = ((priceInEth - refPrice) / refPrice) * 100;
        }

        return {
          contractAddress: address,
          name,
          symbol,
          avatarImage,
          createdAtMs,
          graduated,
          priceUsd,
          change,
          marketCapUsd,
          liquidityUsd,
          volume24h,
          buyCount24h,
          sellCount24h,
          bondingProgress,
        };
      })
    );

    return { configured: true, tokens };
  } catch {
    return emptyResult();
  }
}

export async function fetchHotLaunchpadTokens({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }
  if (!force && inflight) return inflight;

  inflight = loadHotLaunchpadTokens()
    .then((data) => {
      cache = { data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useHotLaunchpadTokens() {
  const [data, setData] = useState(cache?.data ?? null);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    if (!cache) setLoading(true);
    fetchHotLaunchpadTokens().then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data: data || emptyResult(), loading };
}
