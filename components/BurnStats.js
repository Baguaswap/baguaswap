"use client";

import { useMemo, useState } from "react";
import { useBurnStats, bucketBurnEvents } from "@/lib/burnStats";
import { formatUsd, formatGroupedInt } from "@/lib/format";
import { EXPLORER_URL, BUYBACK_BURN_ADDRESS } from "@/lib/config";

const TIMEFRAMES = [
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "1Y", label: "1Y" },
  { key: "ALL", label: "ALL" },
];

function formatK(value) {
  if (value >= 1000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `${Math.round(value)}`;
}

function BurnBarChart({ data }) {
  const w = 300;
  const h = 100;
  const padX = 4;
  const maxValue = Math.max(1, ...data.map((d) => d.value));
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(maxValue * f));
  const slot = (w - padX * 2) / data.length;
  const barWidth = Math.min(20, slot * 0.5);

  return (
    <div className="relative mt-3 overflow-hidden rounded-xl card-border bg-[#060607] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      {/* Ambient glow — same warm gold treatment as the hero banner */}
      <div className="pointer-events-none absolute right-[10%] top-[10%] h-28 w-28 rounded-full bg-accent-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,179,36,0.10),transparent_65%)]" />

      <div className="relative flex gap-2">
        <div className="flex h-24 flex-col justify-between py-0.5 text-right text-[9px] font-medium tabular-nums text-white/35">
          {ticks.map((t, i) => (
            <span key={i}>{formatK(t)}</span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-24 w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="burnBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFDE9E" />
                <stop offset="35%" stopColor="#F5B324" />
                <stop offset="100%" stopColor="#8A5A0F" />
              </linearGradient>
              <linearGradient id="burnBarSheen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <filter id="burnBarGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1="0"
                x2={w}
                y1={h * f}
                y2={h * f}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            ))}

            {data.map((d, i) => {
              const cx = padX + slot * i + slot / 2;
              const barH = d.value > 0 ? Math.max((d.value / maxValue) * (h - 4), 2) : 0;
              return (
                <g key={i} className="transition-opacity duration-200 hover:opacity-90">
                  {/* soft gold glow echo beneath the bar */}
                  <rect
                    x={cx - barWidth / 2}
                    y={h - barH}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    fill="#F5B324"
                    opacity="0.35"
                    filter="url(#burnBarGlow)"
                  />
                  {/* crisp bar on top */}
                  <rect
                    x={cx - barWidth / 2}
                    y={h - barH}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    fill="url(#burnBarGradient)"
                  />
                  {/* glossy top cap highlight */}
                  <rect
                    x={cx - barWidth / 2}
                    y={h - barH}
                    width={barWidth}
                    height={Math.min(barH, 3)}
                    rx="2"
                    fill="url(#burnBarSheen)"
                    opacity="0.8"
                  />
                </g>
              );
            })}

            <line x1="0" x2={w} y1={h} y2={h} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
          </svg>

          <div className="mt-1 flex text-[9px] font-medium text-white/40">
            {data.map((d, i) => (
              <span key={i} style={{ width: `${100 / data.length}%` }} className="text-center">
                {d.showLabel ? d.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BurnStats() {
  const [timeframe, setTimeframe] = useState("1D");
  const { data, loading } = useBurnStats();
  const chartData = useMemo(
    () => bucketBurnEvents(data.events, timeframe, data.decimals),
    [data.events, data.decimals, timeframe]
  );

  const detailsHref =
    EXPLORER_URL && BUYBACK_BURN_ADDRESS ? `${EXPLORER_URL}/address/${BUYBACK_BURN_ADDRESS}` : null;

  return (
    <div className="rounded-xl bg-bg-card card-border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display font-bold text-white">${data.symbol} Burn Stats</h3>
        {detailsHref ? (
          <a
            href={detailsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-medium text-accent-purple"
          >
            View Detail
          </a>
        ) : null}
      </div>

      {!data.configured ? (
        <p className="text-xs text-white/40">Kontrak buyback &amp; burn belum dikonfigurasi.</p>
      ) : (
        <>
          <p className="text-xs text-white/50">Total Burned</p>
          <p className="font-display text-2xl font-bold text-accent-gold">
            {loading ? "..." : formatGroupedInt(data.totalBurned)}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-white/50">Burn Value (USD)</p>
              <p className="font-semibold text-white">
                {loading ? "..." : data.burnValueUsd != null ? formatUsd(data.burnValueUsd) : "—"}
              </p>
            </div>
            <div>
              <p className="text-white/50">Last 24H Burned</p>
              <p className="font-semibold text-accent-green">
                {loading ? "..." : data.last24hBurned > 0 ? `+${formatGroupedInt(data.last24hBurned)}` : "0"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-medium text-white/60">${data.symbol} Burn Activity</p>
            <div className="flex gap-1 rounded-lg bg-black/20 p-0.5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => setTimeframe(tf.key)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    tf.key === timeframe
                      ? "bg-accent-gold text-bg"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <BurnBarChart data={chartData} />

          {!loading && data.events.length === 0 ? (
            <p className="mt-2 text-center text-[11px] text-white/30">Belum ada burn tercatat.</p>
          ) : null}
        </>
      )}
    </div>
  );
}
