"use client";

// Price/candle history for a single Launchpad token, built straight from
// BaguaBondingCurve's TokensPurchased / TokensSold logs — there's no
// separate price-history indexer, so every trade this token has ever had
// is read on-chain and turned into candles + market cap + ATH + a 24h
// change, in USD. Same "never fake a field" rule as lib/hotLaunchpad.js:
// if a token has never traded, hasHistory comes back false instead of a
// guessed chart.

import { useEffect, useMemo, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { AMMS_ADDRESS, AMMS_ABI, ERC20_ABI } from "./config";
import {
  getReadProvider,
  getBondingCurvePriceInEth,
  getAmmPriceInEth,
  getEthUsdPrice,
  queryLogsWithFallback,
  withRetry,
} from "./pricing";

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_MS = 60 * 1000;
const CACHE_TTL_MS = 20_000;

// Selectable candle timeframes for the chart's interval switcher (finest
// to coarsest). Rebucketing on switch is done client-side from the raw
// trade points already fetched — no re-fetch from chain needed.
export const CHART_INTERVALS = [
  { key: "1m", label: "1m", ms: MIN_MS },
  { key: "5m", label: "5m", ms: 5 * MIN_MS },
  { key: "15m", label: "15m", ms: 15 * MIN_MS },
  { key: "30m", label: "30m", ms: 30 * MIN_MS },
  { key: "1h", label: "1H", ms: 60 * MIN_MS },
  { key: "4h", label: "4H", ms: 4 * 60 * MIN_MS },
  { key: "1d", label: "1D", ms: DAY_MS },
];

// Sensible starting timeframe based on how long the token has been
// trading — a brand-new coin opens on 1m candles instead of one giant
// bar, a week-old one doesn't open on thousands of empty 1m buckets. The
// user can still switch away from this via the timeframe row.
export function pickDefaultIntervalKey(spanMs) {
  if (spanMs <= 60 * MIN_MS) return "1m";
  if (spanMs <= 3 * 60 * MIN_MS) return "5m";
  if (spanMs <= 12 * 60 * MIN_MS) return "15m";
  if (spanMs <= 24 * 60 * MIN_MS) return "30m";
  if (spanMs <= 7 * 24 * 60 * MIN_MS) return "1h";
  if (spanMs <= 30 * 24 * 60 * MIN_MS) return "4h";
  return "1d";
}

const cache = new Map();
const inflightByAddress = new Map();

function tradeExecutionPriceEth(log, decimals) {
  const isBuy = log.args?.tokensOut !== undefined;
  const ethAmt = Number(formatUnits(isBuy ? log.args.ethIn : log.args.ethOut, 18));
  const tokenAmt = Number(formatUnits(isBuy ? log.args.tokensOut : log.args.tokensIn, decimals));
  if (!tokenAmt) return null;
  const price = ethAmt / tokenAmt;
  return Number.isFinite(price) && price > 0 ? price : null;
}

// Buckets raw trade points into OHLC candles at the given bucket width.
// Exported so the hook can rebuild candles client-side whenever the user
// switches timeframe, without re-fetching anything from chain.
export function buildCandles(points, bucketMs) {
  const first = points[0].timestampMs;
  const buckets = new Map();
  for (const p of points) {
    const bucketStart = first + Math.floor((p.timestampMs - first) / bucketMs) * bucketMs;
    const existing = buckets.get(bucketStart);
    if (!existing) {
      buckets.set(bucketStart, { open: p.priceUsd, high: p.priceUsd, low: p.priceUsd, close: p.priceUsd });
    } else {
      existing.high = Math.max(existing.high, p.priceUsd);
      existing.low = Math.min(existing.low, p.priceUsd);
      existing.close = p.priceUsd;
    }
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([timeMs, c]) => ({ time: Math.floor(timeMs / 1000), ...c }));
}

async function loadTokenChart(address) {
  const empty = { hasHistory: false };
  if (!address || !AMMS_ADDRESS) return empty;

  try {
    const provider = getReadProvider();
    const curve = new Contract(AMMS_ADDRESS, AMMS_ABI, provider);
    const erc20 = new Contract(address, ERC20_ABI, provider);

    const [decimalsRaw, totalSupplyRaw, ethUsd, graduated] = await Promise.all([
      withRetry(() => erc20.decimals()).catch(() => 18),
      withRetry(() => erc20.totalSupply()).catch(() => 0n),
      getEthUsdPrice(),
      withRetry(() => curve.isGraduated(address)).catch(() => false),
    ]);
    const decimals = Number(decimalsRaw);
    const totalSupply = Number(formatUnits(totalSupplyRaw, decimals));
    if (ethUsd == null || !totalSupply) return empty;

    const [buyLogs, sellLogs] = await Promise.all([
      queryLogsWithFallback(curve, curve.filters.TokensPurchased(address), provider),
      queryLogsWithFallback(curve, curve.filters.TokensSold(address), provider),
    ]);
    const allLogs = [...buyLogs, ...sellLogs];
    if (!allLogs.length) return empty;

    const uniqueBlocks = [...new Set(allLogs.map((l) => l.blockNumber))];
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

    const points = allLogs
      .map((log) => {
        const timestampMs = blockMap.get(log.blockNumber) ?? null;
        const priceEth = tradeExecutionPriceEth(log, decimals);
        if (timestampMs == null || priceEth == null) return null;
        return { timestampMs, priceUsd: priceEth * ethUsd };
      })
      .filter(Boolean)
      .sort((a, b) => a.timestampMs - b.timestampMs);
    if (!points.length) return empty;

    const launchMs = points[0].timestampMs;
    const nowMs = Date.now();

    // Live marginal price straight from the curve/pool, so the current
    // candle and the header number stay accurate between trades too.
    const livePriceEth = graduated
      ? await getAmmPriceInEth(provider, address, decimals)
      : await getBondingCurvePriceInEth(provider, address, decimals);
    const livePriceUsd = livePriceEth != null ? livePriceEth * ethUsd : points[points.length - 1].priceUsd;

    const currentPriceUsd = livePriceUsd;
    const currentMarketCapUsd = livePriceUsd * totalSupply;
    const athPriceUsd = Math.max(...points.map((p) => p.priceUsd), livePriceUsd);
    const athMarketCapUsd = athPriceUsd * totalSupply;

    // 24h reference point: the oldest trade inside the last 24h window, or
    // the very first trade ever (launch) if the token isn't 24h old yet —
    // no waiting around for a literal 24h clock.
    const cutoff = nowMs - DAY_MS;
    const refPoint = points.find((p) => p.timestampMs >= cutoff) || points[0];
    const basePriceUsd = refPoint.priceUsd;
    const changePct24h = basePriceUsd ? ((currentPriceUsd - basePriceUsd) / basePriceUsd) * 100 : null;
    const changeAbsUsd24h = (currentPriceUsd - basePriceUsd) * totalSupply;

    return {
      hasHistory: true,
      // Raw per-trade points, not pre-bucketed — candles are built
      // client-side (see useLaunchpadPriceHistory) so switching timeframe
      // is instant and never re-fetches from chain.
      points,
      totalSupply,
      currentPriceUsd,
      currentMarketCapUsd,
      athMarketCapUsd,
      changePct24h,
      changeAbsUsd24h,
      launchMs,
    };
  } catch {
    return empty;
  }
}

async function fetchTokenChart(address) {
  if (!address) return { hasHistory: false };
  const key = address.toLowerCase();

  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data;
  if (inflightByAddress.has(key)) return inflightByAddress.get(key);

  const promise = loadTokenChart(address)
    .then((data) => {
      cache.set(key, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => {
      inflightByAddress.delete(key);
    });

  inflightByAddress.set(key, promise);
  return promise;
}

// Polls on the same cadence as the cache TTL so the chart, market cap and
// ATH gauge stay live while the coin detail page is open. `intervalKey`
// (one of CHART_INTERVALS' keys) controls candle width; switching it only
// rebuckets the already-fetched raw points, so it's instant and doesn't
// touch the network.
export function useLaunchpadPriceHistory(address, intervalKey = "15m") {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(Boolean(address));

  useEffect(() => {
    if (!address) {
      setRaw(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = () => {
      fetchTokenChart(address).then((res) => {
        if (!cancelled) {
          setRaw(res);
          setLoading(false);
        }
      });
    };

    setLoading(true);
    load();
    const timer = setInterval(load, CACHE_TTL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [address]);

  const candles = useMemo(() => {
    if (!raw?.hasHistory || !raw.points?.length) return [];
    const bucketMs = CHART_INTERVALS.find((i) => i.key === intervalKey)?.ms ?? 15 * MIN_MS;
    const built = buildCandles(raw.points, bucketMs);
    // Patch the live candle with the current marginal price on every
    // rebucket, same as before — keeps the most recent bar accurate
    // between trades regardless of which timeframe is selected.
    if (built.length) {
      const last = built[built.length - 1];
      last.close = raw.currentPriceUsd;
      last.high = Math.max(last.high, raw.currentPriceUsd);
      last.low = Math.min(last.low, raw.currentPriceUsd);
    }
    return built;
  }, [raw, intervalKey]);

  const data = raw?.hasHistory ? { ...raw, candles } : raw;

  return { data, loading };
}
