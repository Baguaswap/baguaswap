export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 91342);
export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || "Giwa Chain";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia-rpc.giwa.io";
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://sepolia-explorer.giwa.io";
export const NATIVE_CURRENCY = {
  name: "ETH",
  symbol: "ETH",
  decimals: 18,
};

export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "e67b678aed34528f39963e9d7221e88d";

export const GIWA_CHAIN_PARAMS = {
  chainId: "0x" + CHAIN_ID.toString(16),
  chainName: CHAIN_NAME,
  nativeCurrency: NATIVE_CURRENCY,
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [EXPLORER_URL],
};

export const NETWORKS = [
  {
    id: "giwa-chain",
    name: CHAIN_NAME,
    type: "testnet",
    chainId: CHAIN_ID,
    iconUrl: "/giwa-chain-icon.png",
    icon: "EthIcon",
    rpcUrls: [RPC_URL],
    blockExplorerUrls: [EXPLORER_URL],
    nativeCurrency: NATIVE_CURRENCY,
  },
];

export const DEFAULT_NETWORK = NETWORKS[0];

export const COINGECKO_ID_BY_SYMBOL = {
  ETH: "ethereum",
};

export const WALLET_TIERS = [
  { id: 1, max: 10, iconUrl: "/wallet-tiers/iw-1.png" },
  { id: 2, max: 100, iconUrl: "/wallet-tiers/iw-2.png" },
  { id: 3, max: 500, iconUrl: "/wallet-tiers/iw-3.png" },
  { id: 4, max: 1000, iconUrl: "/wallet-tiers/iw-4.png" },
  { id: 5, max: Infinity, iconUrl: "/wallet-tiers/iw-5.png" },
];

export function getWalletTierIcon(usdValue) {
  const value = usdValue == null ? 0 : usdValue;
  const tier = WALLET_TIERS.find((t) => value < t.max) || WALLET_TIERS[WALLET_TIERS.length - 1];
  return tier.iconUrl;
}

// ─────────────────────────────────────────────────────────────────
// Ethereum Sepolia (L1) — needed for the Bridge tab. Giwa Chain is an
// OP Stack L2 that settles on Ethereum Sepolia, so bridging deposits
// ETH into the L1StandardBridge contract below (see docs.giwa.io).
// ─────────────────────────────────────────────────────────────────
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
export const SEPOLIA_EXPLORER_URL = "https://sepolia.etherscan.io";

export const SEPOLIA_NETWORK = {
  id: "ethereum-sepolia",
  name: "Ethereum Sepolia",
  type: "testnet",
  chainId: SEPOLIA_CHAIN_ID,
  icon: "EthIcon",
  rpcUrls: [SEPOLIA_RPC_URL],
  blockExplorerUrls: [SEPOLIA_EXPLORER_URL],
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
};

// L1StandardBridge (OP Stack) for Giwa Chain, deployed on Ethereum
// Sepolia. depositETHTo() locks ETH on L1 and the same amount is
// credited on Giwa Chain ~1-3 minutes later ("Lock-and-Mint").
export const GIWA_L1_STANDARD_BRIDGE_ADDRESS =
  process.env.NEXT_PUBLIC_GIWA_L1_STANDARD_BRIDGE_ADDRESS || "0x77b2ffc0F57598cAe1DB76cb398059cF5d10A7E7";

export const GIWA_L1_STANDARD_BRIDGE_ABI = [
  "function depositETHTo(address _to, uint32 _minGasLimit, bytes calldata _extraData) external payable",
  "event ETHDepositInitiated(address indexed from, address indexed to, uint256 amount, bytes extraData)",
];

// Gas granted to the deposit on L2 — comfortably covers a plain ETH
// credit to a regular wallet address.
export const BRIDGE_L2_MIN_GAS_LIMIT = 200000;

// ─────────────────────────────────────────────────────────────────
// Contract addresses (GIWA Sepolia). Real contracts now exist — see
// /docs/CONTRACTS.md for what every contract does and its full function
// list, and for the admin setup checklist that must be done on-chain
// (setLaunchpadRegistrar, setFactory, setMigrator, etc.) before
// createTokenAndBuy() will succeed.
// ─────────────────────────────────────────────────────────────────

// BAG — the protocol's own native/utility token (BaguaBuybackBurn target).
// NOT a launchpad token: it trades through the regular Router/Pair (AMM),
// not through the bonding curve. Used as the default token in Swap.
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "";

// NOTE ON NAMING: this env var is called NEXT_PUBLIC_FACTORY_ADDRESS for
// historical reasons, but the ABI below (FACTORY_ABI) is the
// BaguaLaunchpadFactory interface (createTokenAndBuy / getAllTokens /
// creationFee) — used by the Launchpad tab to create new tokens. It is
// NOT the DEX/AMM pair factory (that one is AMM_FACTORY_ADDRESS below).
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
export const LAUNCHPAD_FACTORY_ADDRESS = FACTORY_ADDRESS; // clearer alias, same value

// BaguaBondingCurve — buyToken()/sellToken() per launchpad token. Used by
// the Swap tab (and internally by BaguaLaunchpadFactory for the initial buy).
export const AMMS_ADDRESS = process.env.NEXT_PUBLIC_AMMS_ADDRESS || "";
export const BONDING_CURVE_ADDRESS = AMMS_ADDRESS; // clearer alias, same value

// BaguaBondingCurveToken — the implementation contract that
// BaguaLaunchpadFactory clones for every new launchpad token. Not used
// directly by the frontend yet (reference/verification only).
export const BONDING_CURVE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BONDING_CURVE_TOKEN_ADDRESS || "";

// The following are deployed and available, but not wired into any
// component yet (out of scope for this pass — see /docs/CONTRACTS.md).
export const AMM_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_AMM_FACTORY_ADDRESS || ""; // BaguaFactory (DEX pair factory)
export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || ""; // BaguaRouter
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || ""; // BaguaTreasury
export const MIGRATOR_ADDRESS = process.env.NEXT_PUBLIC_MIGRATOR_ADDRESS || ""; // BaguaMigrator
export const LOCKER_ADDRESS = process.env.NEXT_PUBLIC_LOCKER_ADDRESS || ""; // BaguaLocker
export const BUYBACK_BURN_ADDRESS = process.env.NEXT_PUBLIC_BUYBACK_BURN_ADDRESS || ""; // BaguaBuybackBurn

// Public IPFS gateway used only as a fallback for READING metadata/images
// (e.g. ipfs://CID -> https://<gateway>/ipfs/CID). Uploading/pinning never
// happens client-side against a public gateway — see /app/api/ipfs/*.
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud";

// Matches the deployed BaguaLaunchpadFactory.sol exactly (see
// /docs/CONTRACTS.md → BaguaLaunchpadFactory). Total supply is a fixed
// on-chain constant (10,000,000,000, minted in BaguaBondingCurveToken),
// so it is not passed as a parameter here.
export const FACTORY_ABI = [
  "function createTokenAndBuy(string calldata name_, string calldata symbol_, string calldata metadataURI_, uint256 minTokensOut) external payable returns (address token)",
  "function getAllTokens() external view returns (address[] memory)",
  "function getTokensPaginated(uint256 offset, uint256 limit) external view returns (address[] memory)",
  "function tokensLength() external view returns (uint256)",
  "function creationFee() external view returns (uint256)",
  "function launchpadPair(address token) external view returns (address)",
  "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, string metadataURI)",
  "event LaunchpadPairCreated(address indexed token, address indexed pair)",
];
export const LAUNCHPAD_FACTORY_ABI = FACTORY_ABI; // clearer alias, same value

// Matches the deployed BaguaBondingCurve.sol exactly (see
// /docs/CONTRACTS.md → BaguaBondingCurve). getAmountOut() is a real
// on-chain view function — it can be used to quote buy/sell output before
// sending a tx (e.g. to auto-fill minTokensOut / minEthOut from a
// slippage %), which the earlier prototype ABI didn't have.
export const AMMS_ABI = [
  "function buyToken(address tokenAddress, uint256 minTokensOut) external payable",
  "function sellToken(address tokenAddress, uint256 tokenAmount, uint256 minEthOut) external",
  "function getAmountOut(address tokenAddress, uint256 amountIn, bool isBuy) external view returns (uint256 amountOut)",
  "function tokenVault(address tokenAddress) external view returns (uint256)",
  "function isGraduated(address tokenAddress) external view returns (bool)",
  // Public constants below let the frontend replicate the bonding-curve
  // quote math for a token that doesn't exist on-chain YET (e.g. while a
  // user is still filling out the Create Token form, before creation) —
  // a brand-new token always starts from these exact reserves, so the
  // formula below matches BaguaBondingCurve._buy()/getAmountOut() exactly.
  "function VIRTUAL_ETH_RESERVE() external view returns (uint256)",
  "function VIRTUAL_TOKEN_RESERVE() external view returns (uint256)",
  "function TOKEN_SELL_SUPPLY() external view returns (uint256)",
  "function K() external view returns (uint256)",
  "function tradingFeeBps() external view returns (uint256)",
  "function tokens(address tokenAddress) external view returns (uint256 realEthReserve, uint256 tokenReserveRemaining, uint256 cumulativeEthRaised, bool graduated, address pair)",
  "event TokensPurchased(address indexed token, address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 fee)",
  "event TokensSold(address indexed token, address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 fee)",
  "event GraduationTriggered(address indexed token, uint256 ethAmount, uint256 tokenAmount)",
];
export const BONDING_CURVE_ABI = AMMS_ABI; // clearer alias, same value

export const ERC20_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];
