"use client";

import { IPFS_GATEWAY } from "./config";

// Modern IPFS CIDs can be CIDv0 ("Qm...") or CIDv1 ("bafy...", "bafk...",
// etc). Per LAUNCHPAD_ARCHITECTURE.md section 4, never assume a "Qm" prefix.
function isLikelyCid(cid) {
  if (typeof cid !== "string" || cid.length < 10) return false;
  return cid.startsWith("Qm") || cid.startsWith("baf") || cid.startsWith("b");
}

/**
 * Uploads an image File to IPFS via our own /api/ipfs/image route (which
 * holds the pinning-provider API key server-side). Per section 19, a
 * successful HTTP response is not treated as proof of a successful pin —
 * the returned CID is validated before being trusted.
 */
export async function uploadImageToIPFS(file) {
  if (!file) throw new Error("No image file provided.");

  const formData = new FormData();
  formData.append("file", file);

  let res;
  try {
    res = await fetch("/api/ipfs/image", { method: "POST", body: formData });
  } catch {
    throw new Error("Couldn't reach the IPFS upload service. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || !isLikelyCid(data.cid)) {
    throw new Error(data?.error || "Image upload to IPFS failed — the request completed but returned no valid CID.");
  }

  return data.cid;
}

/**
 * Uploads a metadata JSON object to IPFS via /api/ipfs/metadata.
 */
export async function uploadMetadataToIPFS(metadata) {
  let res;
  try {
    res = await fetch("/api/ipfs/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });
  } catch {
    throw new Error("Couldn't reach the IPFS upload service. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || !isLikelyCid(data.cid)) {
    throw new Error(data?.error || "Metadata upload to IPFS failed — the request completed but returned no valid CID.");
  }

  return data.cid;
}

export function cidToUri(cid) {
  return `ipfs://${cid}`;
}

export function cidToGatewayUrl(cid) {
  return `${IPFS_GATEWAY}/ipfs/${cid}`;
}
