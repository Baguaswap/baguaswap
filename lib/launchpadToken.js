"use client";

// Single-token on-chain lookup for the Launchpad coin detail page
// (/coin/launchpad/[address]/page.js). Used ONLY as a fallback when an
// address isn't one of the bundled demo tokens in lib/mockLaunchpadTokens.js
// — every existing mock-token link (Home's old demo cards, Discover) keeps
// resolving exactly as it did before. This covers real tokens created
// on-chain through BaguaLaunchpadFactory that aren't in that mock list,
// e.g. the ones now shown by the real Hot Launchpad on the Home tab.
//
// Same "never fake a field" approach as lib/hotLaunchpad.js: anything that
// can't be read (metadata JSON unreachable, no TokenCreated log found,
// etc.) comes back as null and is simply not shown — never guessed.

import { useEffect, useState } from "react";
import { Contract, isAddress } from "ethers";
import { LAUNCHPAD_FACTORY_ADDRESS, LAUNCHPAD_FACTORY_ABI, AMMS_ADDRESS, AMMS_ABI, ERC20_ABI, CHAIN_NAME } from "./config";
import { getReadProvider, queryLogsWithFallback } from "./pricing";
import { fetchIpfsJson, ipfsUriToGatewayUrl } from "./ipfs";
import { formatTimeAgo } from "./format";

// Not part of the shared ERC20_ABI (it's specific to BaguaBondingCurveToken),
// so it's merged in locally just for this lookup.
const METADATA_URI_ABI = ["function metadataURI() external view returns (string memory)"];

const CACHE_TTL_MS = 30_000;
const cache = new Map(); // address(lowercase) -> { data, fetchedAt }
const inflightByAddress = new Map();

async function loadOnChainToken(address) {
  if (!address || !isAddress(address) || !AMMS_ADDRESS) return null;

  try {
    const provider = getReadProvider();
    const curve = new Contract(AMMS_ADDRESS, AMMS_ABI, provider);

    // A mapping read never reverts — an address that was never registered
    // with BaguaLaunchpadFactory just comes back all-zero. That's how a
    // genuinely unrelated/invalid address is told apart from a real token.
    const state = await curve.tokens(address).catch(() => null);
    const isRegistered =
      !!state && (state.graduated || state.tokenReserveRemaining > 0n || state.realEthReserve > 0n);
    if (!isRegistered) return null;

    const erc20 = new Contract(address, [...ERC20_ABI, ...METADATA_URI_ABI], provider);
    const [name, symbol, metadataURI] = await Promise.all([
      erc20.name().catch(() => "Unknown"),
      erc20.symbol().catch(() => "TOKEN"),
      erc20.metadataURI().catch(() => null),
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
        // Creator / created-time genuinely unavailable — leave both null.
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

// address should be passed as null/undefined when the caller already has a
// mock-data match, so this never hits the chain unnecessarily.
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
