export default function BaguaBadge() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      <div
        className="pointer-events-none absolute inset-[-14px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)" }}
        aria-hidden="true"
      />

      {[45, 135, 225, 315].map((deg) => (
        <span
          key={deg}
          className="pointer-events-none absolute h-1.5 w-1.5 rotate-45 bg-accent-purple/70"
          style={{
            top: `${50 - 46 * Math.cos((deg * Math.PI) / 180)}%`,
            left: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
            transform: "translate(-50%, -50%) rotate(45deg)",
          }}
          aria-hidden="true"
        />
      ))}

      <img
        src="/logo.png"
        alt="Bagua"
        className="relative h-20 w-20 drop-shadow-[0_0_18px_rgba(245,179,36,0.4)]"
      />
    </div>
  );
}
