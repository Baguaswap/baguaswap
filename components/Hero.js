"use client";

import { useRef } from "react";
import { RocketIcon, DocsIcon } from "@/components/icons";
import LiveBadge from "@/components/hero/LiveBadge";
import HeroBackground from "@/components/hero/HeroBackground";
import HeroStats from "@/components/hero/HeroStats";
import RippleButton from "@/components/hero/RippleButton";
import useHeroParallax from "@/components/hero/useHeroParallax";

export default function Hero({ onLaunchClick, onDocsClick }) {
  const heroRef = useRef(null);
  useHeroParallax(heroRef);

  return (
    <section
      ref={heroRef}
      className="relative mx-4 overflow-hidden rounded-2xl card-border bg-[#060607]"
    >
      <div className="hero-parallax-bg pointer-events-none absolute inset-0">
        <HeroBackground />
      </div>

      <div className="pointer-events-none absolute -right-4 -bottom-4 top-0 w-[72%] sm:-right-6 sm:w-[64%]">
        <div className="animate-hero-pulse-glow absolute right-[8%] top-[8%] h-[45%] w-[45%] rounded-full bg-accent-gold/25 blur-3xl" />
        <img
          src="/hero-hand.png"
          alt="Bagua coin held in a robotic hand"
          className="hero-parallax-logo animate-hero-float relative h-full w-full object-contain object-right-bottom drop-shadow-[0_0_35px_rgba(245,179,36,0.4)]"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-3 p-4">
        <div className="relative">
          <div className="relative z-10 max-w-[64%] sm:max-w-[56%]">
            <LiveBadge />

            <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Build Once.
              <br />
              <span className="text-accent-gold">Launch</span>
              <br />
              Anywhere.
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <RippleButton
                onClick={onLaunchClick}
                className="group relative flex items-center gap-1.5 overflow-hidden rounded-xl bg-accent-gold px-3 py-2.5 text-[11px] font-semibold text-bg transition-all duration-200 hover:shadow-glow active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <RocketIcon
                  width="14"
                  height="14"
                  className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
                Launch Your Token
                <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
              </RippleButton>
              <RippleButton
                onClick={onDocsClick}
                className="group relative flex items-center gap-1.5 overflow-hidden rounded-xl card-border bg-bg-card px-3 py-2.5 text-[11px] font-semibold text-white/90 transition-all duration-200 hover:border-white/20 hover:bg-white/5 active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <DocsIcon width="14" height="14" className="shrink-0" />
                View Docs
              </RippleButton>
            </div>
          </div>
        </div>

        <HeroStats />
      </div>
    </section>
  );
}
