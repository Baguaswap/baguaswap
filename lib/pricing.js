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

import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import {
  RPC_URL,
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

export function getReadProvider() {
  return new JsonRpcProvider(RPC_URL);
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
