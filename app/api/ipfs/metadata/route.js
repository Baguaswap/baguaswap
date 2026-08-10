import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) {
    return NextResponse.json(
      { error: "IPFS pinning isn't configured on the server yet. Set PINATA_JWT in your environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let res;
  try {
    res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pinataContent: body }),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the IPFS pinning provider." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.IpfsHash) {
    return NextResponse.json(
      { error: data?.error?.details || data?.error || "IPFS metadata upload failed." },
      { status: 502 }
    );
  }

  return NextResponse.json({ cid: data.IpfsHash });
}
