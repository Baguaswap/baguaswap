export function formatBalance(balance) {
  if (balance == null) return "0";
  const num = Number(balance);
  if (Number.isNaN(num)) return "0";
  return num.toFixed(4).replace(/\.?0+$/, "") || "0";
}

export function formatUsd(value) {
  if (value == null || Number.isNaN(Number(value))) return "$0.00";
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Compact form for tight spaces (e.g. "12.3K", "4.2M") — used where a
// full comma-grouped number would overflow a small stat tile.
export function formatCompactNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(value)
  );
}

// Full comma-grouped integer (e.g. "12,345,678").
export function formatGroupedInt(value) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return Math.round(Number(value)).toLocaleString("en-US");
}

// "2m ago" / "5h ago" / "3d ago" relative-time label from a ms timestamp.
export function formatTimeAgo(timestampMs) {
  if (timestampMs == null) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (diffSec < 60) return "baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}j lalu`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}h lalu`;
}
