const STARS = [
  { left: "8%", top: "18%", size: 2, delay: "0s", duration: "5s" },
  { left: "18%", top: "62%", size: 1.5, delay: "0.6s", duration: "6s" },
  { left: "27%", top: "12%", size: 1.5, delay: "1.2s", duration: "4.5s" },
  { left: "35%", top: "40%", size: 2, delay: "2s", duration: "5.5s" },
  { left: "42%", top: "78%", size: 1.5, delay: "0.3s", duration: "6.5s" },
  { left: "52%", top: "22%", size: 2.5, delay: "1.6s", duration: "5s" },
  { left: "61%", top: "58%", size: 1.5, delay: "2.4s", duration: "4.8s" },
  { left: "68%", top: "10%", size: 2, delay: "0.9s", duration: "6.2s" },
  { left: "76%", top: "36%", size: 1.5, delay: "1.8s", duration: "5.2s" },
  { left: "83%", top: "68%", size: 2, delay: "0.4s", duration: "5.8s" },
  { left: "90%", top: "24%", size: 1.5, delay: "2.6s", duration: "4.6s" },
  { left: "14%", top: "85%", size: 1.5, delay: "1.1s", duration: "6.8s" },
  { left: "58%", top: "88%", size: 1.5, delay: "1.9s", duration: "5.4s" },
  { left: "95%", top: "50%", size: 1.5, delay: "0.7s", duration: "6s" },
];

const PARTICLES = [
  { left: "12%", top: "20%", size: 1, color: "bg-accent-gold/70", delay: "0s" },
  { left: "85%", top: "30%", size: 1.5, color: "bg-amber-300/60", delay: "1.4s" },
  { left: "70%", top: "75%", size: 1, color: "bg-accent-gold/70", delay: "2.6s" },
  { left: "25%", top: "80%", size: 1.5, color: "bg-amber-300/50", delay: "3.8s" },
  { left: "45%", top: "15%", size: 1, color: "bg-accent-gold/50", delay: "5s" },
  { left: "58%", top: "45%", size: 1, color: "bg-amber-300/50", delay: "2.1s" },
  { left: "6%", top: "55%", size: 1.5, color: "bg-accent-gold/40", delay: "4.4s" },
  { left: "33%", top: "35%", size: 1, color: "bg-amber-300/60", delay: "3.1s" },
  { left: "78%", top: "55%", size: 1.5, color: "bg-accent-gold/55", delay: "1.7s" },
];

export default function HeroBackground() {
  return (
    <>
      <div className="hero-nebula pointer-events-none absolute inset-0" />
      <div className="hero-fog pointer-events-none absolute inset-0" />
      <div className="hero-rays pointer-events-none absolute inset-0" />

      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="hero-glow-gold pointer-events-none absolute inset-0" />
      <div className="hero-mouse-glow pointer-events-none absolute inset-0" />

      <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="hero-stars pointer-events-none hidden sm:block" aria-hidden="true">
        {STARS.map((star, i) => (
          <span
            key={i}
            className="hero-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden="true">
        {PARTICLES.map((particle, i) => (
          <span
            key={i}
            className={`hero-particle absolute rounded-full ${particle.color}`}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size === 1.5 ? "0.375rem" : "0.25rem",
              height: particle.size === 1.5 ? "0.375rem" : "0.25rem",
              animationDelay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="hero-noise pointer-events-none absolute inset-0" />
    </>
  );
}
