"use client";

import { useParams } from "next/navigation";
import LaunchpadCoinView from "@/components/LaunchpadCoinView";
import { getLaunchpadTokenByAddress } from "@/lib/mockLaunchpadTokens";

export default function LaunchpadCoinPage() {
  const params = useParams();
  const address = Array.isArray(params.address) ? params.address[0] : params.address;
  const token = getLaunchpadTokenByAddress(address);

  return <LaunchpadCoinView token={token} address={address} />;
}
