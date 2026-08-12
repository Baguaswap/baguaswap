"use client";

import { useRouter } from "next/navigation";
import WalletView from "@/components/WalletView";
import { useComingSoon } from "@/components/AppShell";

export default function WalletPage() {
  const router = useRouter();
  const onComingSoon = useComingSoon();
  return (
    <WalletView
      onComingSoon={onComingSoon}
      onSwap={() => router.push("/swap")}
      onBridge={() => router.push("/bridge")}
    />
  );
}
