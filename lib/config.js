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
export const LAUNCHPAD_FACTORY_ADDRESS = FACTORY_ADDRESS; 
export const AMMS_ADDRESS = process.env.NEXT_PUBLIC_AMMS_ADDRESS || "";
export const BONDING_CURVE_ADDRESS = AMMS_ADDRESS; 
export const BONDING_CURVE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BONDING_CURVE_TOKEN_ADDRESS || "";
export const AMM_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_AMM_FACTORY_ADDRESS || ""; 
export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || ""; 
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || ""; 
export const MIGRATOR_ADDRESS = process.env.NEXT_PUBLIC_MIGRATOR_ADDRESS || ""; 
export const LOCKER_ADDRESS = process.env.NEXT_PUBLIC_LOCKER_ADDRESS || ""; 
export const BUYBACK_BURN_ADDRESS = process.env.NEXT_PUBLIC_BUYBACK_BURN_ADDRESS || ""; 
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud";
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
export const LAUNCHPAD_FACTORY_ABI = FACTORY_ABI; 
export const AMMS_ABI = [
  "function buyToken(address tokenAddress, uint256 minTokensOut) external payable",
  "function sellToken(address tokenAddress, uint256 tokenAmount, uint256 minEthOut) external",
  "function getAmountOut(address tokenAddress, uint256 amountIn, bool isBuy) external view returns (uint256 amountOut)",
  "function tokenVault(address tokenAddress) external view returns (uint256)",
  "function isGraduated(address tokenAddress) external view returns (bool)",
  "function tokens(address tokenAddress) external view returns (uint256 realEthReserve, uint256 tokenReserveRemaining, uint256 cumulativeEthRaised, bool graduated, address pair)",
  "event TokensPurchased(address indexed token, address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 fee)",
  "event TokensSold(address indexed token, address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 fee)",
  "event GraduationTriggered(address indexed token, uint256 ethAmount, uint256 tokenAmount)",
];
export const BONDING_CURVE_ABI = AMMS_ABI; 

export const ERC20_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];
