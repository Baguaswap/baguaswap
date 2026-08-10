"use client";

import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import HotLaunchpad from "@/components/HotLaunchpad";
import BurnStats from "@/components/BurnStats";
import LatestBurns from "@/components/LatestBurns";
import Ecosystem from "@/components/Ecosystem";

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Hero
        onLaunchClick={() => router.push("/launchpad")}
        onDocsClick={() => router.push("/docs")}
      />
      <HotLaunchpad />

      <section className="mx-4 mt-6 grid gap-3 sm:grid-cols-2">
        <BurnStats />
        <LatestBurns />
      </section>

      <Ecosystem />
    </>
  );
}
