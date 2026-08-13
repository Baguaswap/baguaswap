"use client";

import { useEffect, useState } from "react";
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

function pickBucketMs(spanMs) {
  if (spanMs <= 60 * MIN_MS) return MIN_MS;
  if (spanMs <= 6 * 60 * MIN_MS) return 5 * MIN_MS;
  if (spanMs <= 24 * 60 * MIN_MS) return 15 * MIN_MS;
  if (spanMs <= 7 * 24 * 60 * MIN_MS) return 60 * MIN_MS;
  return 24 * 60 * MIN_MS;
}

function buildCandles(points, bucketMs) {
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
    const candles = buildCandles(points, pickBucketMs(nowMs - launchMs));

    const livePriceEth = graduated
      ? await getAmmPriceInEth(provider, address, decimals)
      : await getBondingCurvePriceInEth(provider, address, decimals);
    const livePriceUsd = livePriceEth != null ? livePriceEth * ethUsd : points[points.length - 1].priceUsd;

    if (candles.length) {
      const last = candles[candles.length - 1];
      last.close = livePriceUsd;
      last.high = Math.max(last.high, livePriceUsd);
      last.low = Math.min(last.low, livePriceUsd);
    }

    const currentPriceUsd = livePriceUsd;
    const currentMarketCapUsd = livePriceUsd * totalSupply;
    const athPriceUsd = Math.max(...points.map((p) => p.priceUsd), livePriceUsd);
    const athMarketCapUsd = athPriceUsd * totalSupply;

    const cutoff = nowMs - DAY_MS;
    const refPoint = points.find((p) => p.timestampMs >= cutoff) || points[0];
    const basePriceUsd = refPoint.priceUsd;
    const changePct24h = basePriceUsd ? ((currentPriceUsd - basePriceUsd) / basePriceUsd) * 100 : null;
    const changeAbsUsd24h = (currentPriceUsd - basePriceUsd) * totalSupply;

    return {
      hasHistory: true,
      candles,
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

export function useLaunchpadPriceHistory(address) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(address));

  useEffect(() => {
    if (!address) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = () => {
      fetchTokenChart(address).then((res) => {
        if (!cancelled) {
          setData(res);
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

  return { data, loading };
}
