"use client";

import LiquidityView from "@/components/LiquidityView";
import { useComingSoon } from "@/components/AppShell";

export default function LiquidityPage() {
  const onComingSoon = useComingSoon();
  return <LiquidityView onComingSoon={onComingSoon} />;
}
