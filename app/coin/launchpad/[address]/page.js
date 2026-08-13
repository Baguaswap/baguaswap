"use client";

import { useParams } from "next/navigation";
import LaunchpadCoinView from "@/components/LaunchpadCoinView";
import { getLaunchpadTokenByAddress } from "@/lib/mockLaunchpadTokens";
import { useOnChainLaunchpadToken } from "@/lib/launchpadToken";

export default function LaunchpadCoinPage() {
  const params = useParams();
  const address = Array.isArray(params.address) ? params.address[0] : params.address;
  const mockToken = getLaunchpadTokenByAddress(address);

  // Only hit the chain when the address isn't one of the bundled demo
  // tokens — every existing mock-token link keeps resolving exactly as
  // before. This only covers real on-chain tokens that aren't in that list.
  const { token: onChainToken, loading } = useOnChainLaunchpadToken(mockToken ? null : address);

  const token = mockToken || onChainToken;

  return <LaunchpadCoinView token={token} address={address} loading={!mockToken && loading} />;
}
