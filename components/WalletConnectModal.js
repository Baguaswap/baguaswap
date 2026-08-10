"use client";

import {
  CloseIcon,
  ChevronRightIcon,
  GoogleIcon,
  AppleIcon,
  GithubIcon,
  XSocialIcon,
  MailIcon,
  WalletConnectIcon,
  WalletIcon,
} from "@/components/icons";
import BaguaBadge from "@/components/hero/BaguaBadge";

const WALLET_OPTIONS = [
  { id: "walletconnect", name: "WalletConnect", Icon: WalletConnectIcon, soon: true },
  { id: "web3wallet", name: "Web3 Wallet", Icon: WalletIcon, soon: false },
];

const SOON_SOCIALS = [
  { id: "apple", name: "Apple", Icon: AppleIcon },
  { id: "github", name: "GitHub", Icon: GithubIcon },
  { id: "x", name: "X", Icon: XSocialIcon },
];

function SoonBadge() {
  return (
    <span className="absolute -right-1.5 -top-1.5 rounded-full bg-accent-gold px-1.5 py-[1px] text-[9px] font-bold uppercase leading-tight text-black shadow">
      Soon
    </span>
  );
}

export default function WalletConnectModal({ open, onClose, onSelectWallet }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button
        aria-label="Close popup overlay"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-y-auto no-scrollbar rounded-3xl bg-bg-panel card-border p-6 shadow-glow">
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute right-5 top-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white"
        >
          <CloseIcon width="18" height="18" />
        </button>

        <div className="mt-1">
          <BaguaBadge />
        </div>

        <h2 className="mt-4 text-center font-display text-[24px] font-extrabold leading-tight text-white">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Bagua
          </span>{" "}
          Ecosystem
        </h2>
        <p className="mx-auto mt-2 max-w-[280px] text-center text-sm leading-relaxed text-white/60">
          Sign in to start trading.
        </p>

        <div className="relative mt-6">
          <button
            type="button"
            disabled
            aria-label="Continue with Google — coming soon"
            className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-black opacity-70"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <SoonBadge />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {SOON_SOCIALS.map(({ id, name, Icon }) => (
            <button
              key={id}
              type="button"
              disabled
              aria-label={`${name} — coming soon`}
              className="relative flex items-center justify-center rounded-2xl bg-bg-card card-border py-3.5 opacity-70"
            >
              <Icon />
              <SoonBadge />
            </button>
          ))}
        </div>

        <div className="relative mt-3">
          <input
            type="email"
            disabled
            placeholder="you@example.com"
            className="w-full rounded-2xl bg-bg-card card-border py-3.5 pl-11 pr-11 text-sm text-white/40 placeholder:text-white/30"
          />
          <MailIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <SoonBadge />
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-medium text-white/40">or connect a wallet</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-2.5">
          {WALLET_OPTIONS.map(({ id, name, Icon, soon }) => (
            <div key={id} className="relative">
              <button
                type="button"
                disabled={soon}
                onClick={() => !soon && onSelectWallet(id)}
                aria-label={soon ? `${name} — coming soon` : name}
                className={`flex w-full items-center gap-3 rounded-2xl bg-bg-card card-border px-4 py-3.5 text-left ${
                  soon ? "opacity-70" : "hover:bg-white/5"
                }`}
              >
                <Icon />
                <span className="flex-1 text-sm font-semibold text-white">{name}</span>
                {!soon && <ChevronRightIcon className="text-white/50" />}
              </button>
              {soon && <SoonBadge />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
