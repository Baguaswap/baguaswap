"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRightIcon,
  CopyIcon,
  ShareIcon,
  GlobeIcon,
  XSocialIcon,
  TelegramIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/icons";
import CoinMarketPanel from "@/components/CoinMarketPanel";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex w-full items-center justify-between rounded-xl bg-bg-card card-border px-3.5 py-2.5 text-left"
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="truncate font-mono text-[13px] text-white/90">
          {copied ? "Copied!" : truncateAddress(value)}
        </p>
      </div>
      {copied ? (
        <CheckCircleIcon width="16" height="16" className="shrink-0 text-accent-green" />
      ) : (
        <CopyIcon width="16" height="16" className="shrink-0 text-white/40" />
      )}
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm font-medium text-white/60">
      <ChevronRightIcon width="16" height="16" className="rotate-180" />
      Back
    </button>
  );
}

export default function LaunchpadCoinView({ token, address, loading = false }) {
  const router = useRouter();

  if (loading) {
    return (
      <section className="mx-4 mt-4 pb-6">
        <BackButton onClick={() => router.back()} />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-bg-panel card-border" />
      </section>
    );
  }

  if (!token) {
    return (
      <section className="mx-4 mt-4 pb-6">
        <BackButton onClick={() => router.back()} />
        <div className="mt-6 rounded-2xl bg-bg-panel card-border p-6 text-center">
          <p className="text-sm text-white/60">Token not found for this contract address.</p>
          {address && <p className="mt-1 truncate font-mono text-xs text-white/40">{address}</p>}
        </div>
      </section>
    );
  }

  const {
    name,
    symbol,
    avatarColor = "#8B5CF6",
    avatarImage,
    chain = "Giwa Chain",
    creator,
    contractAddress,
    website,
    twitter,
    telegram,
    createdAgo,
  } = token;

  const handleShare = async () => {
    const shareData = {
      title: `${name} (${symbol})`,
      text: `Check out ${name} (${symbol}) on Bagua Launchpad`,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch {
    }
  };

  return (
    <section className="mx-4 mt-4 pb-6">
      <BackButton onClick={() => router.back()} />

      <div className="mt-4 rounded-2xl bg-bg-panel card-border p-5">
        <div className="flex items-start gap-3">
          {avatarImage ? (
            <img src={avatarImage} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-bg"
              style={{ backgroundColor: avatarColor }}
            >
              {symbol?.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0 pt-0.5">
            <p className="truncate font-display text-lg font-bold text-white">{name}</p>
            <p className="text-sm text-white/40">${symbol}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-md bg-bg-card px-2 py-0.5 text-[10px] font-medium text-white/60">
                <img src="/giwa-chain-icon.png" alt="" className="h-3 w-3 rounded-full" />
                {chain}
              </span>
              {createdAgo && (
                <span className="flex items-center gap-1 rounded-md bg-bg-card px-2 py-0.5 text-[10px] text-white/40">
                  <ClockIcon width="10" height="10" />
                  {createdAgo}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-xs font-semibold text-white/80"
          >
            <ShareIcon width="14" height="14" />
            Share
          </button>
          {creator && (
            <div className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-bg-card card-border py-2.5 text-xs text-white/60">
              <span className="text-white/40">By</span>
              <span className="font-mono">{truncateAddress(creator)}</span>
            </div>
          )}
        </div>

        {contractAddress && (
          <div className="mt-2">
            <CopyRow label="Contract Address" value={contractAddress} />
          </div>
        )}

        {(website || telegram || twitter) && (
          <div className="mt-2 flex items-center gap-2">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-xs font-medium text-white/70"
              >
                <GlobeIcon width="14" height="14" />
                Website
              </a>
            )}
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-xs font-medium text-white/70"
              >
                <TelegramIcon width="14" height="14" />
                Telegram
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-card card-border py-2.5 text-xs font-medium text-white/70"
              >
                <XSocialIcon width="12" height="12" />
                X
              </a>
            )}
          </div>
        )}
      </div>

      {contractAddress && <CoinMarketPanel address={contractAddress} />}
    </section>
  );
}
