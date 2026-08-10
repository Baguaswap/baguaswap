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
