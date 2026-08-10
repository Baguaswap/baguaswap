import { RocketIcon, DropletIcon, SwapIcon, FlameIcon } from "@/components/icons";

const STEPS = [
  {
    title: "Launch Token",
    description: "Create an ERC-20 token with an instant supply of 10 billion.",
    icon: RocketIcon,
  },
  {
    title: "Add Liquidity",
    description: "Add liquidity for trading through the AMM.",
    icon: DropletIcon,
  },
  {
    title: "Trade",
    description: "Trade tokens with low fees on the DEX.",
    icon: SwapIcon,
  },
  {
    title: "$BAGUA Burn",
    description: "A portion of every transaction is burned.",
    icon: FlameIcon,
  },
];

export default function Ecosystem() {
  return (
    <section className="mx-4 my-6 rounded-2xl bg-bg-panel card-border p-5">
      <h2 className="font-display text-lg font-bold text-white">Bagua Swap Ecosystem</h2>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STEPS.map(({ title, description, icon: Icon }) => (
          <div key={title} className="flex flex-col items-start gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/15 text-accent-violet">
              <Icon width="18" height="18" />
            </div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs leading-snug text-white/50">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
