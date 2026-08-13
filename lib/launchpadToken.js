"use client";

import { useEffect, useState } from "react";
import { Contract, isAddress } from "ethers";
import { LAUNCHPAD_FACTORY_ADDRESS, LAUNCHPAD_FACTORY_ABI, AMMS_ADDRESS, AMMS_ABI, ERC20_ABI, CHAIN_NAME } from "./config";
import { getReadProvider, queryLogsWithFallback, withRetry } from "./pricing";
import { fetchIpfsJson, ipfsUriToGatewayUrl } from "./ipfs";
import { formatTimeAgo } from "./format";

const METADATA_URI_ABI = ["function metadataURI() external view returns (string memory)"];

const CACHE_TTL_MS = 45_000;
const cache = new Map();
const inflightByAddress = new Map();

async function loadOnChainToken(address) {
  if (!address || !isAddress(address) || !AMMS_ADDRESS) return null;

  try {
    const provider = getReadProvider();
    const curve = new Contract(AMMS_ADDRESS, AMMS_ABI, provider);

    const state = await withRetry(() => curve.tokens(address)).catch(() => null);
    const isRegistered =
      !!state && (state.graduated || state.tokenReserveRemaining > 0n || state.realEthReserve > 0n);
    if (!isRegistered) return null;

    const erc20 = new Contract(address, [...ERC20_ABI, ...METADATA_URI_ABI], provider);
    const [name, symbol, metadataURI] = await Promise.all([
      withRetry(() => erc20.name()).catch(() => "Unknown"),
      withRetry(() => erc20.symbol()).catch(() => "TOKEN"),
      withRetry(() => erc20.metadataURI()).catch(() => null),
    ]);

    const meta = metadataURI ? await fetchIpfsJson(metadataURI) : null;

    let creator = null;
    let createdAgo = null;
    if (LAUNCHPAD_FACTORY_ADDRESS) {
      try {
        const factory = new Contract(LAUNCHPAD_FACTORY_ADDRESS, LAUNCHPAD_FACTORY_ABI, provider);
        const logs = await queryLogsWithFallback(factory, factory.filters.TokenCreated(address), provider);
        const log = logs[0];
        if (log) {
          creator = log.args?.creator ?? null;
          const block = await provider.getBlock(log.blockNumber).catch(() => null);
          if (block) createdAgo = formatTimeAgo(Number(block.timestamp) * 1000);
        }
      } catch {
      }
    }

    return {
      name,
      symbol,
      avatarImage: meta?.image ? ipfsUriToGatewayUrl(meta.image) : null,
      chain: CHAIN_NAME,
      creator,
      contractAddress: address,
      website: meta?.website || null,
      twitter: meta?.twitter || null,
      telegram: meta?.telegram || null,
      createdAgo,
    };
  } catch {
    return null;
  }
}

async function fetchOnChainToken(address) {
  if (!address) return null;
  const key = address.toLowerCase();

  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data;
  if (inflightByAddress.has(key)) return inflightByAddress.get(key);

  const promise = loadOnChainToken(address)
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

export function useOnChainLaunchpadToken(address) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(Boolean(address));

  useEffect(() => {
    if (!address) {
      setToken(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchOnChainToken(address).then((res) => {
      if (!cancelled) {
        setToken(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { token, loading };
}
