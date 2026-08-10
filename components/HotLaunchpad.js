import { FlameIcon } from "@/components/icons";

const TOKENS = [
  { symbol: "DBAGUA", name: "DOGE BAGUA", marketCap: "$128,450", liquidity: "$65,430", color: "#F5B324" },
  { symbol: "PEIPEI", name: "PEIPEI", marketCap: "$97,220", liquidity: "$48,210", color: "#22C55E" },
  { symbol: "WAGMI", name: "WAGMI", marketCap: "$76,890", liquidity: "$36,540", color: "#F5B324" },
  { symbol: "MIAO", name: "MIAO", marketCap: "$55,670", liquidity: "$28,120", color: "#EF4444" },
];

function TokenAvatar({ label, color }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-bg"
      style={{ backgroundColor: color }}
    >
      {label.slice(0, 2)}
    </div>
  );
}

export default function HotLaunchpad() {
  return (
    <section className="mx-4 mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
            <FlameIcon className="text-accent-gold" />
            Hot Launchpad
          </h2>
          <p className="text-xs text-white/50">Newest meme coins on Bagua Swap</p>
        </div>
        <a href="#" className="text-sm font-medium text-accent-purple">
          View All
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOKENS.map((token) => (
          <div key={token.symbol} className="rounded-xl bg-bg-card card-border p-4">
            <div className="mb-2 flex items-start justify-between">
              <TokenAvatar label={token.symbol} color={token.color} />
              <span className="rounded-md bg-accent-green/15 px-2 py-0.5 text-[10px] font-medium text-accent-green">
                New
              </span>
            </div>
            <p className="font-display text-sm font-bold text-white">{token.name}</p>
            <p className="text-xs text-white/40">{token.symbol}</p>

            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Market Cap</span>
                <span className="text-white/80">{token.marketCap}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Liquidity</span>
                <span className="text-white/80">{token.liquidity}</span>
              </div>
            </div>

            <button className="mt-3 w-full rounded-lg bg-accent-purple/15 py-2 text-xs font-semibold text-accent-violet hover:bg-accent-purple/25">
              Trade Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
