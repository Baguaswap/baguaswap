"use client";

import DiscoverView from "@/components/DiscoverView";
import { useComingSoon } from "@/components/AppShell";

export default function DiscoverPage() {
  const onComingSoon = useComingSoon();
  return <DiscoverView onComingSoon={onComingSoon} />;
}
