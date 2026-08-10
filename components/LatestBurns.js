import { FlameIcon } from "@/components/icons";

const BURNS = [
  { address: "0x8a3f...c88", amount: "2,345 $BAGUA", time: "2m ago" },
  { address: "0x71f2...c88", amount: "1,234 $BAGUA", time: "5m ago" },
  { address: "0x9d1a...e321", amount: "5,678 $BAGUA", time: "12m ago" },
];

export default function LatestBurns() {
  return (
    <div className="flex flex-col rounded-xl bg-bg-card card-border p-4">
      <h3 className="mb-3 font-display font-bold text-white">Latest Burns</h3>

      <div className="flex-1 space-y-3">
        {BURNS.map((burn, i) => (
          <div key={i} className="grid grid-cols-[1.3fr_1fr_0.7fr] items-center gap-2 text-xs">
            <span className="flex items-center gap-2 truncate text-white/80">
              <FlameIcon className="shrink-0 text-accent-gold" width="14" height="14" />
              <span className="truncate">{burn.address}</span>
            </span>
            <span className="truncate text-white/60">{burn.amount}</span>
            <span className="text-right text-white/40">{burn.time}</span>
          </div>
        ))}
      </div>

      <button className="mt-4 rounded-lg card-border py-2 text-xs font-semibold text-accent-violet hover:bg-white/5">
        View All
      </button>
    </div>
  );
}
