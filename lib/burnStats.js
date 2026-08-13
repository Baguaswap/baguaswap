"use client";

// Real on-chain $BAGUA burn data, read straight from the deployed
// BaguaBuybackBurn contract. It keeps no running "total burned" counter in
// storage, so the BurnExecuted event log is the only source of truth — this
// file queries that log directly instead of showing any placeholder numbers.
//
// Nothing here is faked: if the contract isn't configured, or the RPC call
// fails, or there simply haven't been any burns yet, every number comes
// back as 0 / null / an empty list — never a made-up figure.

import { useEffect, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { BUYBACK_BURN_ADDRESS, BUYBACK_BURN_ABI, TOKEN_ADDRESS, ERC20_ABI } from "./config";
import { getReadProvider, getAmmPriceInEth, getEthUsdPrice, queryLogsWithFallback } from "./pricing";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const CACHE_TTL_MS = 30_000;
let cache = null; // { data, fetchedAt }
let inflight = null;

async function fetchTokenMeta(provider) {
  if (!TOKEN_ADDRESS) return { symbol: "BAGUA", decimals: 18 };
  try {
    const token = new Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([
      token.symbol().catch(() => "BAGUA"),
      token.decimals().catch(() => 18),
    ]);
    return { symbol, decimals: Number(decimals) };
  } catch {
    return { symbol: "BAGUA", decimals: 18 };
  }
}

async function queryBurnLogs(contract, provider) {
  return queryLogsWithFallback(contract, contract.filters.BurnExecuted(), provider);
}

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
  return logs.map((log) => ({
    amountRaw: log.args?.amount ?? 0n,
    blockNumber: log.blockNumber,
    txHash: log.transactionHash,
    timestamp: blockMap.get(log.blockNumber) ?? null,
  }));
}

function emptyResult() {
  return {
    configured: Boolean(BUYBACK_BURN_ADDRESS && TOKEN_ADDRESS),
    symbol: "BAGUA",
    decimals: 18,
    totalBurned: 0,
    last24hBurned: 0,
    burnValueUsd: null,
    events: [],
  };
}

async function loadBurnStats() {
  if (!BUYBACK_BURN_ADDRESS || !TOKEN_ADDRESS) {
    return emptyResult();
  }

  try {
    const provider = getReadProvider();
    const contract = new Contract(BUYBACK_BURN_ADDRESS, BUYBACK_BURN_ABI, provider);
    const [meta, rawLogs] = await Promise.all([fetchTokenMeta(provider), queryBurnLogs(contract, provider)]);
    const events = (await attachTimestamps(provider, rawLogs)).sort((a, b) => b.blockNumber - a.blockNumber);

    const totalBurnedRaw = events.reduce((sum, e) => sum + e.amountRaw, 0n);
    const totalBurned = Number(formatUnits(totalBurnedRaw, meta.decimals));

    const cutoff = Date.now() - DAY;
    const last24hBurned = events
      .filter((e) => e.timestamp != null && e.timestamp >= cutoff)
      .reduce((sum, e) => sum + Number(formatUnits(e.amountRaw, meta.decimals)), 0);

    let burnValueUsd = null;
    try {
      const [bagPriceEth, ethUsd] = await Promise.all([
        getAmmPriceInEth(provider, TOKEN_ADDRESS, meta.decimals),
        getEthUsdPrice(),
      ]);
      if (bagPriceEth != null && ethUsd != null) {
        burnValueUsd = totalBurned * bagPriceEth * ethUsd;
      }
    } catch {
    }

    return {
      configured: true,
      symbol: meta.symbol,
      decimals: meta.decimals,
      totalBurned,
      last24hBurned,
      burnValueUsd,
      events,
    };
  } catch {
    return emptyResult();
  }
}

export async function fetchBurnStats({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }
  if (!force && inflight) return inflight;

  inflight = loadBurnStats()
    .then((data) => {
      cache = { data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

// Shared by BurnStats + LatestBurns so both widgets reuse a single RPC
// round trip instead of each fetching the event log independently.
export function useBurnStats() {
  const [data, setData] = useState(cache?.data ?? null);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    if (!cache) setLoading(true);
    fetchBurnStats().then((res) => {
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

// ── Chart bucketing ────────────────────────────────────────────────
// Buckets real BurnExecuted events into bars for the selected timeframe,
// anchored to "now". Buckets with no burn activity are legitimately 0 —
// never backfilled with a fake value.

const MONTH_LABELS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const WEEKDAY_LABELS_ID = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]; // Date#getDay(): 0 = Sunday

function sumAmountInRange(events, decimals, startMs, endMs) {
  return events
    .filter((e) => e.timestamp != null && e.timestamp >= startMs && e.timestamp < endMs)
    .reduce((sum, e) => sum + Number(formatUnits(e.amountRaw, decimals)), 0);
}

export function bucketBurnEvents(events, timeframeKey, decimals, now = Date.now()) {
  if (timeframeKey === "1D") {
    const bucketMs = 3 * HOUR;
    const bars = [];
    for (let i = 7; i >= 0; i--) {
      const end = now - i * bucketMs;
      const start = end - bucketMs;
      const value = sumAmountInRange(events, decimals, start, end);
      const label = i === 0 ? "Now" : `${String(new Date(end).getHours()).padStart(2, "0")}.00`;
      bars.push({ label, value, showLabel: i % 2 === 0 || i === 0 });
    }
    return bars;
  }

  if (timeframeKey === "1W") {
    const bars = [];
    for (let i = 6; i >= 0; i--) {
      const end = now - i * DAY;
      const start = end - DAY;
      const value = sumAmountInRange(events, decimals, start, end);
      bars.push({ label: WEEKDAY_LABELS_ID[new Date(end).getDay()], value, showLabel: true });
    }
    return bars;
  }

  if (timeframeKey === "1M") {
    const bars = [];
    for (let i = 3; i >= 0; i--) {
      const end = now - i * 7 * DAY;
      const start = end - 7 * DAY;
      const value = sumAmountInRange(events, decimals, start, end);
      bars.push({ label: `Minggu ${4 - i}`, value, showLabel: true });
    }
    return bars;
  }

  if (timeframeKey === "1Y") {
    const base = new Date(now);
    const bars = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(base.getFullYear(), base.getMonth() - i, 1).getTime();
      const end = new Date(base.getFullYear(), base.getMonth() - i + 1, 1).getTime();
      const value = sumAmountInRange(events, decimals, start, end);
      bars.push({
        label: MONTH_LABELS_ID[new Date(start).getMonth()],
        value,
        showLabel: i % 3 === 0 || i === 0,
      });
    }
    return bars;
  }

  // ALL — one bar per calendar year, from the earliest burn (or this year
  // if there are none yet) through the current year.
  const currentYear = new Date(now).getFullYear();
  const earliestYear = events.reduce(
    (min, e) => (e.timestamp != null ? Math.min(min, new Date(e.timestamp).getFullYear()) : min),
    currentYear
  );
  const bars = [];
  for (let y = earliestYear; y <= currentYear; y++) {
    const start = new Date(y, 0, 1).getTime();
    const end = new Date(y + 1, 0, 1).getTime();
    bars.push({ label: String(y), value: sumAmountInRange(events, decimals, start, end), showLabel: true });
  }
  return bars;
}
