"use client";

import SwapView from "@/components/SwapView";
import { useComingSoon } from "@/components/AppShell";

export default function SwapPage() {
  const onComingSoon = useComingSoon();
  return <SwapView onComingSoon={onComingSoon} />;
}
