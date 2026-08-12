"use client";

import BridgeView from "@/components/BridgeView";
import { useComingSoon } from "@/components/AppShell";

export default function BridgePage() {
  const onComingSoon = useComingSoon();
  return <BridgeView onComingSoon={onComingSoon} />;
}
