// On-chain pricing + token-discovery helpers for the Wallet tab.
//
// BAG (and any graduated launchpad token) prices from the live BaguaFactory
// / BaguaRouter / BaguaPair reserves — no external price API exists for
// these testnet tokens, so the only honest source of truth is the pool
// itself. Ungraduated launchpad tokens price from BaguaBondingCurve's own
// getAmountOut() quote instead, since they don't have an AMM pair yet.
//
// Every function here returns null (never throws, never fakes a number)
// when a price genuinely can't be determined — e.g. no pool exists yet, or
// the relevant contract address isn't configured. Callers should treat
// null as "not priced yet", not as zero.

import { Contract, JsonRpcProvider, FallbackProvider, Network, formatUnits } from "ethers";
import {
  RPC_URL,
  BACKUP_RPC_URL,
  CHAIN_ID,
  CHAIN_NAME,
  ERC20_ABI,
  AMM_FACTORY_ADDRESS,
  AMM_FACTORY_ABI,
  ROUTER_ADDRESS,
  ROUTER_ABI,
  PAIR_ABI,
  AMMS_ADDRESS,
  AMMS_ABI,
  LAUNCHPAD_FACTORY_ADDRESS,
  LAUNCHPAD_FACTORY_ABI,
} from "./config";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEFAULT_MAX_TOKENS_TO_SCAN = 500;

let cachedWeth = null;

// A fresh JsonRpcProvider used to get created on every single call site
// (Hot Launchpad, the coin detail page, Wallet, Swap, ...). Each one is its
// own connection with its own batching queue, so ten reads in the same
// render fan out as ten separate requests against a free, rate-limited RPC
// instead of getting batched together — the more instances, the more
// requests, the more likely one gets throttled. Building the provider once
// and reusing it everywhere both cuts that request count via ethers'
// built-in batching and lets the FallbackProvider's failover (below) work
// across the whole app instead of resetting per component.
let sharedProvider = null;

export function getReadProvider() {
  if (sharedProvider) return sharedProvider;

  // staticNetwork skips a network-detection round trip (eth_chainId) on
  // every provider — cheap on its own, but adds up across many instances,
  // and we already know the chain since this app only ever targets one.
  const network = Network.from({ chainId: CHAIN_ID, name: CHAIN_NAME });
  const primary = new JsonRpcProvider(RPC_URL, network, { staticNetwork: network });

  if (!BACKUP_RPC_URL) {
    sharedProvider = primary;
    return sharedProvider;
  }

  // quorum: 1 means only ONE of the two endpoints needs to answer — this
  // is read-only display data on a testnet, not something that needs
  // multi-node consensus. Priority 1 (the official RPC) is tried first;
  // the free backup only gets used if it stalls past stallTimeout or
  // errors outright.
  const backup = new JsonRpcProvider(BACKUP_RPC_URL, network, { staticNetwork: network });
  sharedProvider = new FallbackProvider(
    [
      { provider: primary, priority: 1, weight: 1, stallTimeout: 2500 },
      { provider: backup, priority: 2, weight: 1, stallTimeout: 2500 },
    ],
    network,
    { quorum: 1 }
  );
  return sharedProvider;
}

// Retries a flaky read before giving up on it. Used for calls where
// "the RPC hiccupped" and "this genuinely doesn't exist on-chain" must not
// collapse into the same result (e.g. deciding whether a token is
// registered) — see lib/launchpadToken.js and lib/hotLaunchpad.js.
export async function withRetry(fn, { retries = 2, delayMs = 400 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

// Ordered fallback windows if the RPC rejects an unbounded eth_getLogs
// call. A single fixed window assumes we already know this RPC's exact
// range cap — but public nodes vary wildly (some accept 300k+ blocks,
// many cap out far lower, around 2k-10k). This cascades through
// decreasing windows and uses the first one the RPC actually accepts,
// instead of silently coming back empty when a single guessed window is
// still too large. Shared by every widget that reads an on-chain event
// log (Hot Launchpad, Burn Stats, the Launchpad coin detail page), so a
// fix here benefits all of them at once.
const LOG_FALLBACK_WINDOWS = [300_000, 50_000, 10_000, 2_000];

export async function queryLogsWithFallback(contract, filter, provider) {
  try {
    return await contract.queryFilter(filter, 0, "latest");
  } catch {
    // Unbounded query rejected — fall through to the windowed cascade below.
  }

  let latest;
  try {
    latest = await provider.getBlockNumber();
  } catch {
    return [];
  }

  for (const window of LOG_FALLBACK_WINDOWS) {
    try {
      const fromBlock = Math.max(0, latest - window);
      return await contract.queryFilter(filter, fromBlock, "latest");
    } catch {
      // This window was also rejected by the RPC — try the next, smaller one.
    }
  }

  return [];
}

// ETH/USD from CoinGecko, independent of wallet connection — used by
// read-only Home-tab widgets (e.g. Burn Value in USD) that must work even
// when no wallet is connected. Cached briefly in memory since it's called
// from more than one widget on the same page.
let cachedEthUsd = null;
let cachedEthUsdAt = 0;
const ETH_USD_CACHE_MS = 60_000;

export async function getEthUsdPrice() {
  if (cachedEthUsd != null && Date.now() - cachedEthUsdAt < ETH_USD_CACHE_MS) {
    return cachedEthUsd;
  }
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const data = await res.json();
    const price = data?.ethereum?.usd;
    if (typeof price === "number") {
      cachedEthUsd = price;
      cachedEthUsdAt = Date.now();
      return price;
    }
    return null;
  } catch {
    return null;
  }
}

// The wrapped-native address every BaguaFactory pair is quoted against.
// Cached in memory for the lifetime of the tab — it never changes on-chain.
export async function getWethAddress(provider) {
  if (cachedWeth) return cachedWeth;
  if (!ROUTER_ADDRESS) return null;
  try {
    const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
    const weth = await router.WETH();
    cachedWeth = weth;
    return weth;
  } catch {
    return null;
  }
}

// Price (in ETH) read straight from the live BAG/WETH (or any
// graduated-token/WETH) pool reserves.
export async function getAmmPriceInEth(provider, tokenAddress, tokenDecimals = 18) {
  if (!AMM_FACTORY_ADDRESS || !tokenAddress) return null;
  try {
    const weth = await getWethAddress(provider);
    if (!weth) return null;
    const factory = new Contract(AMM_FACTORY_ADDRESS, AMM_FACTORY_ABI, provider);
    const pairAddr = await factory.getPair(tokenAddress, weth);
    if (!pairAddr || pairAddr === ZERO_ADDRESS) return null;

    const pair = new Contract(pairAddr, PAIR_ABI, provider);
    const [reserves, token0] = await Promise.all([pair.getReserves(), pair.token0()]);
    const isToken0 = token0.toLowerCase() === tokenAddress.toLowerCase();
    const tokenReserve = isToken0 ? reserves[0] : reserves[1];
    const wethReserve = isToken0 ? reserves[1] : reserves[0];
    if (tokenReserve === 0n) return null;

    const tokenReserveNum = Number(formatUnits(tokenReserve, tokenDecimals));
    const wethReserveNum = Number(formatUnits(wethReserve, 18));
    if (!tokenReserveNum) return null;

    const priceInEth = wethReserveNum / tokenReserveNum;
    return Number.isFinite(priceInEth) ? priceInEth : null;
  } catch {
    return null;
  }
}

// Approximate marginal price (in ETH) of a not-yet-graduated launchpad
// token, quoted directly from BaguaBondingCurve.getAmountOut() using a
// small probe amount so the quote's own slippage doesn't skew the result.
export async function getBondingCurvePriceInEth(provider, tokenAddress, tokenDecimals = 18) {
  if (!AMMS_ADDRESS || !tokenAddress) return null;
  try {
    const curve = new Contract(AMMS_ADDRESS, AMMS_ABI, provider);
    const graduated = await curve.isGraduated(tokenAddress);
    if (graduated) return null; // caller should use the AMM path instead

    const vault = await curve.tokenVault(tokenAddress);
    if (vault === 0n) return null;

    const probe = vault / 100000n > 0n ? vault / 100000n : 1n;
    const ethOut = await curve.getAmountOut(tokenAddress, probe, false);
    if (ethOut === 0n) return null;

    const probeNum = Number(formatUnits(probe, tokenDecimals));
    const ethOutNum = Number(formatUnits(ethOut, 18));
    if (!probeNum) return null;

    const priceInEth = ethOutNum / probeNum;
    return Number.isFinite(priceInEth) ? priceInEth : null;
  } catch {
    return null;
  }
}

// Tries the bonding curve first for launchpad tokens (correct for tokens
// that haven't graduated yet), falling back to the AMM pool — which is
// also the only path for BAG, since BAG never goes through the curve.
export async function getTokenPriceInEth(
  provider,
  tokenAddress,
  { isLaunchpadToken = false, tokenDecimals = 18 } = {}
) {
  if (isLaunchpadToken) {
    const bondingPrice = await getBondingCurvePriceInEth(provider, tokenAddress, tokenDecimals);
    if (bondingPrice != null) return bondingPrice;
  }
  return getAmmPriceInEth(provider, tokenAddress, tokenDecimals);
}

// Scans every token ever created through BaguaLaunchpadFactory and returns
// the ones the given wallet actually holds a balance of (> 0), each with
// its live price where available. Caps the scan at maxTokensToScan to
// avoid an unbounded RPC fan-out as the platform grows — `skipped` tells
// the caller whether some tokens were left unchecked.
export async function discoverLaunchpadHoldings(
  provider,
  ownerAddress,
  { maxTokensToScan = DEFAULT_MAX_TOKENS_TO_SCAN } = {}
) {
  if (!ownerAddress || !LAUNCHPAD_FACTORY_ADDRESS) {
    return { holdings: [], total: 0, scanned: 0, skipped: false };
  }

  const factory = new Contract(LAUNCHPAD_FACTORY_ADDRESS, LAUNCHPAD_FACTORY_ABI, provider);

  let total = 0;
  try {
    total = Number(await factory.tokensLength());
  } catch {
    return { holdings: [], total: 0, scanned: 0, skipped: false };
  }
  if (!total) return { holdings: [], total: 0, scanned: 0, skipped: false };

  const skipped = total > maxTokensToScan;
  const limit = skipped ? maxTokensToScan : total;

  let addresses = [];
  try {
    addresses = await factory.getTokensPaginated(0, limit);
  } catch {
    return { holdings: [], total, scanned: 0, skipped };
  }

  const balanceResults = await Promise.allSettled(
    addresses.map((addr) => new Contract(addr, ERC20_ABI, provider).balanceOf(ownerAddress))
  );

  const held = [];
  balanceResults.forEach((res, i) => {
    if (res.status === "fulfilled" && res.value > 0n) {
      held.push({ address: addresses[i], balanceRaw: res.value });
    }
  });

  const curve = AMMS_ADDRESS ? new Contract(AMMS_ADDRESS, AMMS_ABI, provider) : null;

  const holdings = await Promise.all(
    held.map(async (h) => {
      const token = new Contract(h.address, ERC20_ABI, provider);
      let symbol = "TOKEN";
      let decimals = 18;
      try {
        const [s, d] = await Promise.all([
          token.symbol().catch(() => "TOKEN"),
          token.decimals().catch(() => 18),
        ]);
        symbol = s;
        decimals = Number(d);
      } catch {
      }

      let graduated = false;
      if (curve) {
        try {
          graduated = await curve.isGraduated(h.address);
        } catch {
        }
      }

      const priceInEth = await getTokenPriceInEth(provider, h.address, {
        isLaunchpadToken: true,
        tokenDecimals: decimals,
      });

      return {
        address: h.address,
        symbol,
        decimals,
        balance: formatUnits(h.balanceRaw, decimals),
        graduated,
        priceInEth,
      };
    })
  );

  return { holdings, total, scanned: limit, skipped };
}
