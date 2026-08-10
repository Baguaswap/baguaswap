"use client";

import { useState } from "react";
import {
  DocsIcon,
  ArrowDownToLineIcon,
  InfoIcon,
  CompassIcon,
  RocketIcon,
  PieChartIcon,
  FlameIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  LockIcon,
} from "@/components/icons";

const WHITEPAPER_URL = "/bagua-whitepaper-v1.5.docx";
const WHITEPAPER_FILENAME = "Bagua_Ecosystem_Whitepaper_v1_5.docx";

const TOKEN_FACTS = [
  { label: "Token Name", value: "Bagua" },
  { label: "Ticker Symbol", value: "BAG" },
  { label: "Max Supply", value: "1,000,000,000 BAG" },
  { label: "Genesis Blockchain", value: "GIWA Network" },
  { label: "Standard", value: "GIWA Native (ERC-20 Compatible)" },
  { label: "Relayer Standard", value: "ERC-4337 (EntryPoint v0.7)" },
];

const ALLOCATION = [
  { label: "DEX Liquidity Pools & Ecosystem Reserves", pct: 40, color: "bg-accent-gold" },
  { label: "Launchpad IDO & Public Ecosystem", pct: 25, color: "bg-accent-purple" },
  { label: "Community Staking Rewards & Yield Farming", pct: 15, color: "bg-accent-green" },
  { label: "Dev & Core Team (24-Month Linear Vesting)", pct: 10, color: "bg-accent-violet" },
  { label: "Marketing, Partnerships & CEX Reserve", pct: 10, color: "bg-white/40" },
];

const LIFECYCLE = [
  { step: "Sign", detail: "The user, holding Bagua ($BAG) with zero native gas required, signs a UserOperation (UserOp) via their Smart Account." },
  { step: "Bundle", detail: "The UserOp is submitted to the alt-mempool, where a Bundler Node validates it and packages it with other UserOperations." },
  { step: "Route", detail: "The Bundler submits the bundle to the EntryPoint Smart Contract, which invokes the Bagua Paymaster." },
  { step: "Settle", detail: "The Bagua Paymaster deducts $BAG from the user's Smart Account and pays the required native gas to the EntryPoint contract." },
  { step: "Execute", detail: "Final contract execution completes — the token is swapped or launched." },
];

const SECTIONS = [
  {
    id: "summary",
    icon: InfoIcon,
    title: "Executive Summary",
    body: (
      <div className="space-y-3 text-[13px] leading-relaxed text-white/70">
        <p>
          BaguaSwap is a next-generation decentralized finance (DeFi) ecosystem and Launchpad
          platform built natively for the GIWA Network, designed to provide ultra-deep liquidity,
          seamless token incubation, and complete gas-fee abstraction for Web3 users.
        </p>
        <p>
          Conceived as the pioneer DEX and Launchpad infrastructure for the upcoming GIWA
          Blockchain, BaguaSwap begins its rollout with an adaptive, milestone-driven strategy.
          Currently operating in its Testnet Phase, BaguaSwap is stress-testing its AMM DEX,
          Launchpad engine, and ERC-4337 Account Abstraction Paymaster on the GIWA Testnet.
        </p>
        <p>
          Powered by its native utility token Bagua ($BAG) with a fixed maximum supply of
          1,000,000,000 BAG, BaguaSwap introduces a dual-engine deflationary and gasless
          transaction model: an automated fee split that buys back and burns $BAG, paired with an
          ERC-4337 Paymaster that removes the need to hold native gas tokens.
        </p>
      </div>
    ),
  },
  {
    id: "vision",
    icon: CompassIcon,
    title: "1. Vision & Ecosystem Strategy",
    body: (
      <div className="space-y-4 text-[13px] leading-relaxed text-white/70">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">1.1 Core Mission</p>
          <p>
            To eliminate native gas friction in Web3 through ERC-4337 Account Abstraction,
            providing a unified liquidity hub and launchpad on GIWA where project creators and
            traders can operate effortlessly without needing to hold native gas tokens.
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
            1.2 Adaptive Milestone-Based Launch Strategy
          </p>
          <ul className="space-y-2">
            <li>
              <span className="font-semibold text-white">Milestone 1 (Current — GIWA Testnet):</span>{" "}
              Full-stack protocol deployment on GIWA Testnet to refine AMM mechanics, IDO
              launchpad contracts, and the ERC-4337 Paymaster pipeline.
            </li>
            <li>
              <span className="font-semibold text-white">Milestone 2 (GIWA Mainnet Unveiling):</span>{" "}
              Immediate deployment of the Bagua ($BAG) Token Generation Event (TGE), liquidity
              seeding, and native DEX/Launchpad activation upon GIWA Mainnet going live.
            </li>
            <li>
              <span className="font-semibold text-white">Milestone 3 (Post-Mainnet Stabilization):</span>{" "}
              CEX listings and transition toward full DAO governance once GIWA Mainnet liquidity
              reaches sustainable thresholds.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "features",
    icon: RocketIcon,
    title: "2. Core Platform Features",
    body: (
      <div className="space-y-4 text-[13px] leading-relaxed text-white/70">
        <div>
          <p className="mb-1 font-semibold text-white">2.1 Bagua Launchpad (Token Generator & IDO Engine)</p>
          <p className="mb-2">
            An end-to-end token creation and incubation platform allowing developers to mint,
            deploy, and launch new tokens effortlessly on the GIWA Network.
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Automated Liquidity Locking — anti-rugpull smart contract lock-ups on initial DEX liquidity.</li>
            <li>Tiered Staking Allocations — $BAG stakers gain guaranteed VIP allocation access to high-tier IDOs.</li>
            <li>Gasless Token Deployment — creators launch projects paying fees purely in $BAG via the Paymaster.</li>
          </ul>
        </div>
        <div>
          <p className="mb-1 font-semibold text-white">2.2 Bagua Automated Market Maker (AMM) DEX</p>
          <p>
            An advanced AMM facilitating instant token swaps with minimal slippage on the GIWA
            Network, with multi-asset liquidity pools where LPs earn swap fees and $BAG yield
            incentives.
          </p>
        </div>
        <div>
          <p className="mb-1 font-semibold text-white">2.3 ERC-4337 Account Abstraction & Paymaster Relayer</p>
          <p className="mb-2">
            BaguaSwap removes the need to hold native GIWA gas tokens for basic smart contract
            interactions.
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Smart Accounts — ERC-4337 compliant contract wallets with session keys, social recovery, and batched transactions.</li>
            <li>UserOperations — off-chain UserOp objects detailing intended actions like swaps or token launches.</li>
            <li>Bagua Paymaster — accepts payment in $BAG and sponsors the required native gas to the EntryPoint contract.</li>
            <li>Bundlers — off-chain nodes that package UserOperations into a single bundle transaction.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "tokenomics",
    icon: PieChartIcon,
    title: "3. Tokenomics & Allocation",
    body: (
      <div className="space-y-4 text-[13px] leading-relaxed text-white/70">
        <div className="divide-y divide-bg-border rounded-xl bg-black/30 card-border">
          {TOKEN_FACTS.map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="text-white/50">{f.label}</span>
              <span className="text-right font-medium text-white">{f.value}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
            3.2 Token Allocation & Distribution
          </p>
          <div className="space-y-3">
            {ALLOCATION.map((a) => (
              <div key={a.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-white/70">{a.label}</span>
                  <span className="font-semibold text-white">{a.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "fees",
    icon: FlameIcon,
    title: "4. Fee Structure & Automated Buyback & Burn",
    body: (
      <div className="space-y-4 text-[13px] leading-relaxed text-white/70">
        <p>
          Every interaction within the BaguaSwap ecosystem (swaps, token deployment, launchpad
          participation) incurs a small ecosystem fee, deducted in $BAG and split as follows:
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-accent-gold/30 bg-accent-gold/10 p-3">
            <p className="text-lg font-bold text-accent-gold">30%</p>
            <p className="mt-0.5 text-xs text-white/60">
              Automated Buyback & Burn — permanently removed from circulating supply.
            </p>
          </div>
          <div className="rounded-xl border border-accent-violet/30 bg-accent-violet/10 p-3">
            <p className="text-lg font-bold text-accent-violet">70%</p>
            <p className="mt-0.5 text-xs text-white/60">
              Dev & Treasury Wallet — operations and Paymaster liquidity.
            </p>
          </div>
        </div>
        <div>
          <p className="mb-1 font-semibold text-white">4.1 Buyback & Burn Mechanism</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Continuous market pressure — 30% of all accrued fees route into the Automated Buyback Smart Contract.</li>
            <li>Auto-execution — the contract automatically purchases $BAG from open market AMM pools.</li>
            <li>Permanent destruction — purchased $BAG is sent to the null burn address, reducing circulating supply.</li>
          </ul>
        </div>
        <div>
          <p className="mb-1 font-semibold text-white">4.2 Dev & Treasury Allocation</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Liquidity deposits in the ERC-4337 Paymaster Contract on GIWA Mainnet.</li>
            <li>Continuous infrastructure engineering and smart contract development.</li>
            <li>Tier-1 and Tier-2 CEX listing fees.</li>
            <li>Third-party security audits and bug bounty programs.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "roadmap",
    icon: CalendarIcon,
    title: "5. Milestone-Based Execution Roadmap",
    body: (
      <div className="space-y-4 text-[13px] leading-relaxed text-white/70">
        <div className="rounded-xl border border-accent-green/30 bg-accent-green/5 p-3">
          <p className="flex items-center gap-1.5 font-semibold text-accent-green">
            Milestone 1 — GIWA Testnet & Audits
            <span className="ml-auto rounded-full bg-accent-green/20 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-green">Active</span>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Deployment of core smart contracts on GIWA Testnet (Testnet Token, AMM DEX V1, Launchpad Engine).</li>
            <li>Testing and optimization of the ERC-4337 Bagua Paymaster and Bundler nodes.</li>
            <li>Third-party smart contract audits for all core protocols.</li>
            <li>Community-incentivized testnet campaign (bug bounties & feedback program).</li>
          </ul>
        </div>
        <div className="rounded-xl card-border bg-black/20 p-3">
          <p className="font-semibold text-white">Milestone 2 — GIWA Mainnet Genesis</p>
          <p className="mt-0.5 text-xs text-white/40">Pending GIWA Mainnet</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Official Token Generation Event (TGE) for $BAG exclusively on GIWA Mainnet.</li>
            <li>Launch of Bagua AMM DEX V1 & primary liquidity pools.</li>
            <li>Activation of the live ERC-4337 Paymaster for gasless swaps and launches.</li>
            <li>Activation of the Automated 30% Buyback & Burn Smart Contract.</li>
            <li>Onboarding of GIWA-native projects onto the Bagua Launchpad.</li>
          </ul>
        </div>
        <div className="rounded-xl card-border bg-black/20 p-3">
          <p className="font-semibold text-white">Milestone 3 — CEX Integration & DAO Governance</p>
          <p className="mt-0.5 text-xs text-white/40">Global Scale</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>CEX listings on Tier-1 and Tier-2 platforms.</li>
            <li>Expansion of staking tiers and long-term yield farming incentives.</li>
            <li>Transition to full DAO governance.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "lifecycle",
    icon: ClockIcon,
    title: "6. Transaction Lifecycle",
    body: (
      <div className="space-y-3 text-[13px] leading-relaxed text-white/70">
        <p>Each ecosystem transaction follows a fixed on-chain lifecycle, from signature to settlement:</p>
        <ol className="space-y-2.5">
          {LIFECYCLE.map((l, i) => (
            <li key={l.step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-purple/20 text-xs font-bold text-accent-purple">
                {i + 1}
              </span>
              <span>
                <span className="font-semibold text-white">{l.step}: </span>
                {l.detail}
              </span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: "security",
    icon: ShieldCheckIcon,
    title: "7. Security, Audits & Decentralization",
    body: (
      <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-white/70">
        <li>
          <span className="font-semibold text-white">Audited ERC-4337 Implementations</span> — Paymaster and
          Smart Account contracts follow audited OpenZeppelin and ERC-4337 reference standards.
        </li>
        <li>
          <span className="font-semibold text-white">Multi-Signature Treasury</span> — all dev/treasury and
          Paymaster liquidity funds are governed by a Multi-Sig Wallet requiring 4-of-7 core signer confirmations.
        </li>
        <li>
          <span className="font-semibold text-white">Timelock Protocol</span> — critical parameters (fee
          adjustments, Paymaster oracle feeds) are subject to a mandatory 48-hour timelock delay.
        </li>
      </ul>
    ),
  },
  {
    id: "disclaimer",
    icon: LockIcon,
    title: "8. Legal Disclaimer",
    body: (
      <p className="text-[13px] italic leading-relaxed text-white/50">
        This whitepaper is for informational purposes only and does not constitute financial,
        investment, or legal advice. Cryptocurrency investments and decentralized finance
        protocols carry inherent risks, including market volatility and technical smart contract
        risks. Participants should conduct their own thorough research (DYOR) before
        participating in the BaguaSwap ecosystem.
      </p>
    ),
  },
];

function AccordionItem({ section, open, onToggle }) {
  const Icon = section.icon;
  return (
    <div className="overflow-hidden rounded-xl bg-bg-card card-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 px-3.5 py-3.5 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
          <Icon width="15" height="15" />
        </span>
        <span className="flex-1 text-sm font-semibold text-white">{section.title}</span>
        <ChevronDownIcon
          width="16"
          height="16"
          className={`shrink-0 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-bg-border px-3.5 py-4">{section.body}</div>}
    </div>
  );
}

export default function DocsView() {
  const [openIds, setOpenIds] = useState(() => new Set(["summary"]));

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="hero-glow relative overflow-hidden rounded-2xl bg-bg-panel card-border p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
          <DocsIcon width="20" height="20" />
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-white">Docs</h1>
        <p className="mt-1 max-w-[85%] text-sm text-white/60">
          Official documentation for the Bagua Ecosystem — DEX, Launchpad & ERC-4337 Account
          Abstraction on GIWA.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent-gold/40 bg-accent-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-gold">
          v1.5.0 — GIWA-Native Edition
        </span>
      </div>

      <a
        href={WHITEPAPER_URL}
        download={WHITEPAPER_FILENAME}
        className="group mt-4 flex items-center gap-3 rounded-2xl bg-accent-purple px-4 py-3.5 text-white transition-transform duration-150 active:scale-[0.98]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <ArrowDownToLineIcon width="18" height="18" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">View Whitepaper</span>
          <span className="block text-xs text-white/70">Tap to download the full .docx document</span>
        </span>
        <ArrowDownToLineIcon
          width="16"
          height="16"
          className="shrink-0 opacity-70 transition-transform duration-200 group-active:translate-y-0.5"
        />
      </a>

      <div className="mt-6 space-y-2.5">
        {SECTIONS.map((section) => (
          <AccordionItem
            key={section.id}
            section={section}
            open={openIds.has(section.id)}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-white/30">© 2026 Bagua Ecosystem. All Rights Reserved.</p>
    </section>
  );
}
