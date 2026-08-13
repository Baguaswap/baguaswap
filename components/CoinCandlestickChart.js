"use client";

import { useEffect, useRef } from "react";

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
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
}
