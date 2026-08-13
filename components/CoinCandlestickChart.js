"use client";

import { useEffect, useRef } from "react";

// Bonding-curve token prices are typically fractions of a cent (e.g.
// $0.00000005), so the library's default price format (2 decimals, min
// move 0.01) rounds every OHLC value straight to "0.00" — the right-hand
// price scale gets stuck showing a static "0.00" no matter how the price
// actually moves, and every candle collapses onto the same flat line
// since the axis can't represent the differences between them. This picks
// enough decimal precision from the candles' own magnitude (same idea as
// lib/format.js's formatTinyPrice) so the scale — and the candle detail —
// track the real price instead of being rounded away.
function computePriceFormat(data) {
  const fallback = { type: "price", precision: 2, minMove: 0.01 };
  if (!data?.length) return fallback;

  let min = Infinity;
  for (const c of data) {
    for (const v of [c.open, c.high, c.low, c.close]) {
      if (v > 0 && v < min) min = v;
    }
  }
  if (!Number.isFinite(min) || min <= 0 || min >= 1) return fallback;

  const leadingZeros = Math.max(0, Math.floor(-Math.log10(min)));
  const precision = Math.min(10, leadingZeros + 4);
  const minMove = Number((1 / 10 ** precision).toFixed(precision));
  return { type: "price", precision, minMove };
}

// Renders candles with TradingView's own charting library (lightweight-charts)
// styled to match the app's dark theme. Driven directly against the DOM via
// refs, since that's how the library expects to be used — not through React
// state/props on every candle.
export default function CoinCandlestickChart({ data = [], height = 260 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let resizeObserver;

    (async () => {
      const { createChart, CandlestickSeries, ColorType, CrosshairMode } = await import("lightweight-charts");
      if (disposed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        height,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "rgba(244, 242, 251, 0.5)",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.04)" },
          horzLines: { color: "rgba(255,255,255,0.04)" },
        },
        rightPriceScale: { borderColor: "#1E1E24" },
        timeScale: { borderColor: "#1E1E24", timeVisible: true, secondsVisible: false },
        crosshair: { mode: CrosshairMode.Normal },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22C55E",
        downColor: "#EF4444",
        borderVisible: false,
        wickUpColor: "#22C55E",
        wickDownColor: "#EF4444",
        priceFormat: computePriceFormat(data),
      });

      chartRef.current = chart;
      seriesRef.current = series;

      if (data.length) {
        series.setData(data);
        chart.timeScale().fitContent();
      }

      resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect?.width;
        if (width) chart.applyOptions({ width });
      });
      resizeObserver.observe(containerRef.current);
    })();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current || !data.length) return;
    // Re-derive precision on every update too — not just at mount — so a
    // token that graduates from the bonding curve to the AMM (and jumps
    // price order of magnitude) doesn't get stuck with its old scale.
    seriesRef.current.applyOptions({ priceFormat: computePriceFormat(data) });
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
}
