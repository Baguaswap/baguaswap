export default function HeroLogo() {
  return (
    <div className="hero-parallax-logo animate-hero-float relative">
      <div
        className="animate-hero-ring-spin pointer-events-none absolute -inset-5 rounded-full"
        style={{
          border: "1px dashed rgba(245, 179, 36, 0.25)",
          boxShadow: "0 0 20px rgba(139, 92, 246, 0.12) inset",
        }}
        aria-hidden="true"
      />

      <span
        className="hero-ripple-ring pointer-events-none absolute -inset-2 rounded-full border border-accent-gold/40"
        style={{ animationDelay: "0s" }}
        aria-hidden="true"
      />
      <span
        className="hero-ripple-ring pointer-events-none absolute -inset-2 rounded-full border border-accent-purple/40"
        style={{ animationDelay: "2.25s" }}
        aria-hidden="true"
      />

      <div className="animate-hero-tilt">
        <img
          src="/logo.png"
          alt="Bagua"
          className="relative h-28 w-28 drop-shadow-[0_0_25px_rgba(245,179,36,0.35)] sm:h-32 sm:w-32"
        />
      </div>
    </div>
  );
}
