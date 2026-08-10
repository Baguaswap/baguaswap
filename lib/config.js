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

export const FACTORY_ABI = [
  "function createToken(string memory name, string memory symbol, uint256 supply, string memory tokenURI) external payable returns (address)",
  "function getAllTokens() external view returns (address[] memory)",
  "function creationFee() external view returns (uint256)",
  "event TokenCreated(address indexed tokenAddress, string name, string symbol, address indexed creator, string tokenURI)",
];

export const AMMS_ABI = [
  "function buyToken(address tokenAddress) external payable",
  "function sellToken(address tokenAddress, uint256 tokenAmount) external",
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
