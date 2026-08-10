"use client";

import DexScreenerView from "@/components/DexScreenerView";
import { useComingSoon } from "@/components/AppShell";

export default function DexScreenerPage() {
  const onComingSoon = useComingSoon();
  return <DexScreenerView onComingSoon={onComingSoon} />;
}
