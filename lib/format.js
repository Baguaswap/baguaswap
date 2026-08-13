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

// Compact transaction-count stat used by Hot Launchpad on the Home tab.
// Below 1,000 shows the plain integer; at 1,000 and above shows two
// decimal places with a lowercase "k"/"m" suffix — e.g. 999 -> "999",
// 1000 -> "1.00k", 1010 -> "1.01k", 12345 -> "12.35k".
export function formatTxCount(value) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  const num = Math.max(0, Math.round(Number(value)));
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${(num / 1000).toFixed(2)}k`;
  return `${(num / 1_000_000).toFixed(2)}m`;
}

const SUBSCRIPT_DIGITS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
function toSubscript(n) {
  return String(n)
    .split("")
    .map((d) => SUBSCRIPT_DIGITS[Number(d)] ?? d)
    .join("");
}

// USD price formatter for very small (typical bonding-curve memecoin)
// prices, e.g. 0.00008214 -> "$0.0₄8214" (one shown zero + a subscript
// count of the remaining leading zeros, then 4 significant digits). Falls
// back to a plain fixed-decimal format once the value isn't tiny anymore.
export function formatTinyPrice(value) {
  if (value == null || Number.isNaN(Number(value)) || Number(value) <= 0) return "$0.00";
  const num = Number(value);
  if (num >= 1) return `$${num.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (num >= 0.0001) {
    return `$${num.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;
  }

  const fixed = num.toFixed(20);
  const afterDecimal = fixed.split(".")[1] || "";
  let zeroCount = 0;
  while (afterDecimal[zeroCount] === "0") zeroCount++;
  const significant = afterDecimal.slice(zeroCount, zeroCount + 4);
  return `$0.0${toSubscript(zeroCount - 1)}${significant}`;
}
