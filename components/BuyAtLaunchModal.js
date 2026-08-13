"use client";

import { formatUnits } from "ethers";
import { RocketIcon, CloseIcon } from "@/components/icons";

const SLIPPAGE_PRESETS = ["0.5", "1", "5"];

// Replaces the old inline "Buy tokens at launch (Optional)" collapsible
// section. Buying at launch is no longer optional: this popup is the only
// place the amount can be set, and its Confirm button — the one that
// actually kicks off the Pinata metadata upload + createTokenAndBuy call
// (LaunchpadView.handleCreate) — stays disabled until a nonzero amount is
// entered, so a launch can't complete without it.
export default function BuyAtLaunchModal({
  open,
  onClose,
  onConfirm,
  symbol,
  initialBuyEth,
  setInitialBuyEth,
  quote,
  estimatedTokensOutFormatted,
  curveConstantsError,
  slippagePct,
  setSlippagePct,
  useCustomMinOut,
  setUseCustomMinOut,
  customMinTokensOut,
  setCustomMinTokensOut,
  autoMinTokensOut,
  isValidAmount,
  submitting,
  statusText,
  txError,
}) {
  if (!open) return null;

  const closeIfIdle = () => {
    if (!submitting) onClose();
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center px-4 py-6">
      <button
        aria-label="Close popup overlay"
        onClick={closeIfIdle}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-y-auto no-scrollbar rounded-3xl bg-bg-panel card-border p-6 shadow-glow">
        <button
          onClick={closeIfIdle}
          disabled={submitting}
          aria-label="Close popup"
          className="absolute right-5 top-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white disabled:opacity-30"
        >
          <CloseIcon width="18" height="18" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
          <RocketIcon width="24" height="24" />
        </div>

        <h2 className="mt-4 text-center font-display text-lg font-bold text-white">
          Buy Your Token At Launch
        </h2>
        <p className="mx-auto mt-2 max-w-[280px] text-center text-sm leading-relaxed text-white/60">
          Every launch requires the creator to buy in first — this step can&apos;t be skipped.
        </p>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs text-white/50">Initial buy amount (ETH)</label>
          <input
            value={initialBuyEth}
            onChange={(e) => setInitialBuyEth(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            disabled={submitting}
            autoFocus
            className="w-full rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none disabled:opacity-60"
          />
          <p className="mt-1.5 text-xs text-white/50">
            {initialBuyEth.trim()
              ? quote
                ? <>≈ {Number(estimatedTokensOutFormatted).toLocaleString(undefined, { maximumFractionDigits: 0 })} {symbol || "tokens"} <span className="text-white/30">(estimate, from the curve&apos;s starting price)</span></>
                : curveConstantsError
                ? "Couldn't reach the network to estimate tokens — you can still buy, just without a preview."
                : "Calculating estimate…"
              : "Required — enter an amount greater than 0 to continue."}
          </p>
        </div>

        {initialBuyEth.trim() && quote && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs text-white/50">Slippage tolerance</label>
            <div className="flex flex-wrap items-center gap-2">
              {SLIPPAGE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setUseCustomMinOut(false);
                    setSlippagePct(p);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                    !useCustomMinOut && slippagePct === p
                      ? "bg-accent-purple text-white"
                      : "bg-bg-card card-border text-white/60"
                  }`}
                >
                  {p}%
                </button>
              ))}
              <button
                type="button"
                disabled={submitting}
                onClick={() => setUseCustomMinOut(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                  useCustomMinOut ? "bg-accent-purple text-white" : "bg-bg-card card-border text-white/60"
                }`}
              >
                Custom
              </button>
            </div>

            {useCustomMinOut ? (
              <div className="mt-2">
                <label className="mb-1.5 block text-xs text-white/50">Minimum tokens received (raw amount)</label>
                <input
                  value={customMinTokensOut}
                  onChange={(e) => setCustomMinTokensOut(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="0"
                  disabled={submitting}
                  className="w-full rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none disabled:opacity-60"
                />
                <p className="mt-1.5 text-[11px] leading-snug text-white/40">
                  Leaving this at 0 accepts any output amount — no slippage protection.
                </p>
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] leading-snug text-white/40">
                Your buy reverts if you&apos;d receive less than{" "}
                {Number(formatUnits(autoMinTokensOut, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 })} tokens
                (estimate minus {slippagePct}%).
              </p>
            )}
          </div>
        )}

        {statusText && submitting && (
          <p className="mt-4 rounded-xl border border-accent-purple/30 bg-accent-purple/10 px-4 py-2.5 text-sm text-accent-purple">
            {statusText}
          </p>
        )}
        {txError && (
          <p className="mt-4 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">
            {txError}
          </p>
        )}

        <button
          type="button"
          onClick={onConfirm}
          disabled={!isValidAmount || submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-purple py-3.5 text-center font-semibold text-white disabled:opacity-40"
        >
          <RocketIcon width="18" height="18" />
          {submitting ? statusText || "Creating…" : "Confirm & Create"}
        </button>
        {!isValidAmount && !submitting && (
          <p className="mt-2 text-center text-xs text-white/40">
            Buying at launch is required — enter an amount above to continue.
          </p>
        )}
      </div>
    </div>
  );
}
