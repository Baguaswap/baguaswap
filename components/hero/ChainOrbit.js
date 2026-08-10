import { EthIcon, PlusCircleIcon, CHAIN_ICON_MAP } from "@/components/icons";

const RADIUS = 78;
const DURATION = 40;
const NODE_SIZE = 38;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function OrbitLines({ nodes }) {
  const cx = 100;
  const cy = 100;
  const r = 68; 

  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="chain-line-gradient" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
          <stop offset="45%" stopColor="#F5B324" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {nodes.map((node, i) => {
        const angle = (360 / nodes.length) * i;
        const x = cx + r * Math.cos(toRad(angle));
        const y = cy + r * Math.sin(toRad(angle));
        return (
          <line
            key={node.id}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="url(#chain-line-gradient)"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="hero-orbit-line"
            style={{ animationDelay: `${i * -0.4}s` }}
          />
        );
      })}
    </svg>
  );
}

function OrbitNode({ node, angle }) {
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{ transform: `rotate(${angle}deg) translateX(${RADIUS}px)` }}
    >
      <div
        className="animate-hero-spin-reverse flex items-center justify-center"
        style={{
          animationDuration: `${DURATION}s`,
          width: NODE_SIZE,
          height: NODE_SIZE,
          marginLeft: -NODE_SIZE / 2,
          marginTop: -NODE_SIZE / 2,
        }}
        title={node.name}
      >
        <div className="relative flex items-center justify-center" style={{ width: NODE_SIZE, height: NODE_SIZE }}>
          {/* Soft pulsing halo behind the card */}
          <span
            className="chain-node-pulse pointer-events-none absolute inset-0 rounded-xl bg-accent-purple/30 blur-md"
            style={{ animationDelay: `${angle * -0.01}s` }}
          />
          <div
            className={`chain-glass-card group relative flex items-center justify-center rounded-xl card-border transition-transform duration-300 hover:-translate-y-0.5 hover:scale-110 ${
              node.isMore ? "text-white/50" : "text-white/90"
            }`}
            style={{ width: NODE_SIZE, height: NODE_SIZE }}
          >
            {node.isMore ? (
              <PlusCircleIcon width={NODE_SIZE * 0.46} height={NODE_SIZE * 0.46} />
            ) : node.iconUrl ? (
              <img src={node.iconUrl} alt={node.name} className="h-1/2 w-1/2 rounded-full" />
            ) : (
              (() => {
                const ChainIcon = CHAIN_ICON_MAP[node.icon] || EthIcon;
                return <ChainIcon width={NODE_SIZE * 0.46} height={NODE_SIZE * 0.46} />;
              })()
            )}
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-accent-purple/0 shadow-[0_0_0_0_rgba(139,92,246,0)] transition-shadow duration-300 group-hover:bg-accent-purple/10 group-hover:shadow-[0_0_18px_4px_rgba(139,92,246,0.35)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChainOrbit({ nodes }) {
  return (
    <div
      className="animate-hero-spin-slow absolute inset-0"
      style={{ animationDuration: `${DURATION}s` }}
      aria-hidden="true"
    >
      <OrbitLines nodes={nodes} />
      {nodes.map((node, i) => (
        <OrbitNode key={node.id} node={node} angle={(360 / nodes.length) * i} />
      ))}
    </div>
  );
}
