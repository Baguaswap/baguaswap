export default function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-bg-card card-border px-3 py-1.5 text-xs font-medium text-white/70">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-hero-pulse-glow rounded-full bg-accent-green" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-green" />
      </span>
      Live on Giwa Chain
    </div>
  );
}
