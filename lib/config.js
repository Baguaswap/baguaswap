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

export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "";
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
export const AMMS_ADDRESS = process.env.NEXT_PUBLIC_AMMS_ADDRESS || "";

// Public IPFS gateway used only as a fallback for READING metadata/images
// (e.g. ipfs://CID -> https://<gateway>/ipfs/CID). Uploading/pinning never
// happens client-side against a public gateway — see /app/api/ipfs/*.
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud";

// NOTE: This ABI matches the target interface described in
// LAUNCHPAD_ARCHITECTURE.md section 9 (createTokenAndBuy). No smart contract
// exists yet — this is the interface the frontend expects the contract to
// implement, not a confirmed deployed interface. Total supply is treated as
// a fixed on-chain constant (10,000,000,000) per section 1.1, so it is not
// passed as a parameter here.
export const FACTORY_ABI = [
  "function createTokenAndBuy(string calldata name_, string calldata symbol_, string calldata metadataURI_, uint256 minTokensOut) external payable returns (address token)",
  "function getAllTokens() external view returns (address[] memory)",
  "function creationFee() external view returns (uint256)",
  "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, string metadataURI)",
];

// minTokensOut / minEthOut are slippage-protection parameters. There is no
// on-chain quote/getAmountOut function defined yet (the bonding curve
// formula itself isn't finalized — see LAUNCHPAD_ARCHITECTURE.md section 10),
// so the frontend cannot compute these automatically from a % tolerance.
// Until a quote function is added to the contract, the UI lets the user
// enter a manual minimum and otherwise defaults to 0 (no protection), with
// an explicit warning — see components/SwapView.js.
export const AMMS_ABI = [
  "function buyToken(address tokenAddress, uint256 minTokensOut) external payable",
  "function sellToken(address tokenAddress, uint256 tokenAmount, uint256 minEthOut) external",
  "function tokenVault(address tokenAddress) external view returns (uint256)",
  "function isGraduated(address tokenAddress) external view returns (bool)",
  "event TokensPurchased(address indexed buyer, address indexed token, uint256 amountEth, uint256 amountTokens)",
  "event TokensSold(address indexed seller, address indexed token, uint256 amountTokens, uint256 amountEth)",
];

export const ERC20_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];
