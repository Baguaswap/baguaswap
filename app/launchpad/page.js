"use client";

import LaunchpadView from "@/components/LaunchpadView";
import { useComingSoon } from "@/components/AppShell";

export default function LaunchpadPage() {
  const onComingSoon = useComingSoon();
  return <LaunchpadView onComingSoon={onComingSoon} />;
}
