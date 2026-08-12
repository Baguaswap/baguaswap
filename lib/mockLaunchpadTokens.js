// Centralized mock data for every Launchpad coin card shown across the app
// (Hot Launchpad on Home, Recently Launched / Top Gainers / New This Week
// on Discover). Kept in one place so the card lists and the full coin
// detail page (/coin/launchpad/[address]) always agree on what a given
// contract address looks like. Once real on-chain/indexer data is wired
// up, these exports are the seam to swap out.

export const HOT_LAUNCHPAD_TOKENS = [
  {
    symbol: "DBAGUA", name: "DOGE BAGUA", price: "$0.0₄8214", change: "+42.6%",
    bondingProgress: 78, marketCap: "$128,450", liquidity: "$65,430", avatarColor: "#F5B324",
    contractAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    creator: "0x9f0eA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8",
    website: "https://baguaswap.example", twitter: "https://x.com/dogebagua", createdAgo: "12m ago",
  },
  {
    symbol: "PEIPEI", name: "PEIPEI", price: "$0.0₄6120", change: "+18.9%",
    bondingProgress: 61, marketCap: "$97,220", liquidity: "$48,210", avatarColor: "#22C55E",
    contractAddress: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    creator: "0x8e9fA0b1C2d3E4f5A6b7C8d9E0f1A2b3C4d5E6f7",
    website: "https://baguaswap.example", twitter: "https://x.com/peipei", createdAgo: "34m ago",
  },
  {
    symbol: "WAGMI", name: "WAGMI", price: "$0.0₅9884", change: "-4.3%",
    bondingProgress: 44, marketCap: "$76,890", liquidity: "$36,540", avatarColor: "#F5B324",
    contractAddress: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    creator: "0x7d8eA9b0C1d2E3f4A5b6C7d8E9f0A1b2C3d4E5f6",
    twitter: "https://x.com/wagmi", createdAgo: "1h ago",
  },
  {
    symbol: "MIAO", name: "MIAO", price: "$0.0₅5031", change: "-11.7%",
    bondingProgress: 22, marketCap: "$55,670", liquidity: "$28,120", avatarColor: "#EF4444",
    contractAddress: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    creator: "0x6c7dA8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f5",
    website: "https://baguaswap.example", createdAgo: "2h ago",
  },
];

export const RECENTLY_LAUNCHED_TOKENS = [
  {
    name: "CHIIKAWA", sub: "ちいかわ", price: "$0.000125", change: "+124.5%", mc: "$1.26M", txns: "8.2K", minutes: "2m", avatarColor: "#F472B6",
    contractAddress: "0x1f2e3d4c5b6a7988766554433221100ffeeddcc", creator: "0xaa11Bb22Cc33Dd44Ee55Ff6600112233445566aa",
    website: "https://baguaswap.example", twitter: "https://x.com/chiikawa",
  },
  {
    name: "JIMOTHY", sub: "Jimothy The Raccoon", price: "$0.006892", change: "+68.7%", mc: "$6.89M", txns: "12.1K", minutes: "5m", avatarColor: "#78716C",
    contractAddress: "0x2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d", creator: "0xbb22Cc33Dd44Ee55Ff661122334455667788bb",
    twitter: "https://x.com/jimothy",
  },
  {
    name: "FROGE", sub: "Frog with Hat", price: "$0.000945", change: "+95.3%", mc: "$945K", txns: "6.7K", minutes: "7m", avatarColor: "#65A30D",
    contractAddress: "0x3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e", creator: "0xcc33Dd44Ee55Ff66112233445566778899ccdd",
    website: "https://baguaswap.example",
  },
  {
    name: "DOGGO", sub: "Doggfather", price: "$0.000532", change: "+41.2%", mc: "$532K", txns: "3.9K", minutes: "9m", avatarColor: "#F59E0B",
    contractAddress: "0x4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f", creator: "0xdd44Ee55Ff6611223344556677889900aabbdd",
    website: "https://baguaswap.example", twitter: "https://x.com/doggo",
  },
];

export const TOP_GAINERS_TOKENS = [
  { rank: 1, name: "PEPEKING", sub: "The King of Pepe", address: "0x1a2B...9F0e", contractAddress: "0x1a2B3c4D5e6F708192a3B4c5D6e7F8091a2B9F0e", creator: "0xee55Ff661122334455667788990011aabbccee", website: "https://baguaswap.example", twitter: "https://x.com/pepeking", price: "$0.002341", change: "+245.6%", mc: "$2.34M", txns: "15.4K", avatarColor: "#22C55E" },
  { rank: 2, name: "CATINU", sub: "cat in the universe", address: "0x3c4D...7A1f", contractAddress: "0x3c4D5e6F708192a3B4c5D6e7F8091a2B3c4D7A1f", creator: "0xff6611223344556677889900aabbccddeeff11", twitter: "https://x.com/catinu", price: "$0.001234", change: "+186.3%", mc: "$1.23M", txns: "9.8K", avatarColor: "#94A3B8" },
  { rank: 3, name: "ANIMEGIRL", sub: "Just a cute anime girl", address: "0x5e6F...2B3c", contractAddress: "0x5e6F708192a3B4c5D6e7F8091a2B3c4D5e6F2B3c", creator: "0x1122334455667788990011aabbccddeeff1122", website: "https://baguaswap.example", price: "$0.000543", change: "+132.4%", mc: "$543K", txns: "7.8K", avatarColor: "#EC4899" },
  { rank: 4, name: "PUDGY", sub: "Just a Pudgy Penguin", address: "0x7a8B...4D5e", contractAddress: "0x7a8B9c0D1e2F304152637485960718293a4B4D5e", creator: "0x2233445566778899001122aabbccddeeff2233", website: "https://baguaswap.example", twitter: "https://x.com/pudgy", price: "$0.000321", change: "+98.7%", mc: "$321K", txns: "5.2K", avatarColor: "#3B82F6" },
];

export const NEW_THIS_WEEK_TOKENS = [
  { name: "FOXY", hours: "2h", avatarColor: "#F97316", contractAddress: "0x6f708192a3b4c5d6e7f8091a2b3c4d5e6f70812", creator: "0x33445566778899001122334aabbccddeeff3344", twitter: "https://x.com/foxy" },
  { name: "LIZZY", hours: "4h", avatarColor: "#84CC16", contractAddress: "0x708192a3b4c5d6e7f8091a2b3c4d5e6f7081923", creator: "0x44556677889900112233445aabbccddeeff4455", website: "https://baguaswap.example" },
  { name: "BULLY", hours: "6h", avatarColor: "#F472B6", contractAddress: "0x8192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b", creator: "0x556677889900112233445566aabbccddeeff556" },
  { name: "KITSU", hours: "8h", avatarColor: "#F59E0B", contractAddress: "0x92a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c", creator: "0x66778899001122334455667aabbccddeeff6677", website: "https://baguaswap.example", twitter: "https://x.com/kitsu" },
];

// Normalizes any of the four shapes above into the token object
// LaunchpadCoinView expects.
function normalize(item) {
  return {
    name: item.sub || item.name,
    symbol: item.symbol || item.name,
    avatarColor: item.avatarColor,
    chain: "Giwa Chain",
    creator: item.creator,
    contractAddress: item.contractAddress,
    website: item.website,
    twitter: item.twitter,
    marketCap: item.marketCap || item.mc,
    change: item.change,
    createdAgo: item.createdAgo || item.minutes || item.hours,
  };
}

const ALL_TOKEN_SOURCES = [
  ...HOT_LAUNCHPAD_TOKENS,
  ...RECENTLY_LAUNCHED_TOKENS,
  ...TOP_GAINERS_TOKENS,
  ...NEW_THIS_WEEK_TOKENS,
];

export function getLaunchpadTokenByAddress(address) {
  if (!address) return null;
  const match = ALL_TOKEN_SOURCES.find(
    (t) => t.contractAddress?.toLowerCase() === address.toLowerCase()
  );
  return match ? normalize(match) : null;
}
