"use client";

import { FlameIcon } from "@/components/icons";
import { useBurnStats } from "@/lib/burnStats";
import { formatGroupedInt, formatTimeAgo } from "@/lib/format";
import { EXPLORER_URL, BUYBACK_BURN_ADDRESS } from "@/lib/config";

const MAX_ROWS = 3;

function shortenTx(hash) {
  if (!hash) return "";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export default function LatestBurns() {
  const { data, loading } = useBurnStats();
  const rows = data.events.slice(0, MAX_ROWS);
  const viewAllHref =
    EXPLORER_URL && BUYBACK_BURN_ADDRESS ? `${EXPLORER_URL}/address/${BUYBACK_BURN_ADDRESS}` : null;

  return (
    <div className="flex flex-col rounded-xl bg-bg-card card-border p-4">
      <h3 className="mb-3 font-display font-bold text-white">Latest Burns</h3>

      <div className="flex-1 space-y-3">
        {loading ? (
          <p className="text-xs text-white/40">Memuat...</p>
        ) : !data.configured ? (
          <p className="text-xs text-white/40">Kontrak buyback &amp; burn belum dikonfigurasi.</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-white/40">Belum ada burn tercatat.</p>
        ) : (
          rows.map((burn) => {
            const amount = formatGroupedInt(Number(burn.amountRaw) / 10 ** data.decimals);
            const txHref = EXPLORER_URL ? `${EXPLORER_URL}/tx/${burn.txHash}` : null;
            const row = (
              <div className="grid grid-cols-[1.3fr_1fr_0.7fr] items-center gap-2 text-xs">
                <span className="flex items-center gap-2 truncate text-white/80">
                  <FlameIcon className="shrink-0 text-accent-gold" width="14" height="14" />
                  <span className="truncate">{shortenTx(burn.txHash)}</span>
                </span>
                <span className="truncate text-white/60">
                  {amount} ${data.symbol}
                </span>
                <span className="text-right text-white/40">{formatTimeAgo(burn.timestamp)}</span>
              </div>
            );
            return txHref ? (
              <a
                key={burn.txHash}
                href={txHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80"
              >
                {row}
              </a>
            ) : (
              <div key={burn.txHash}>{row}</div>
            );
          })
        )}
      </div>

      {viewAllHref ? (
        <a
          href={viewAllHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-lg card-border py-2 text-center text-xs font-semibold text-accent-violet hover:bg-white/5"
        >
          View All
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 rounded-lg card-border py-2 text-xs font-semibold text-white/30"
        >
          View All
        </button>
      )}
    </div>
  );
}
