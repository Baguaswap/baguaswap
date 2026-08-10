import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

export async function POST(req) {
  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) {
    return NextResponse.json(
      { error: "IPFS pinning isn't configured on the server yet. Set PINATA_JWT in your environment." },
      { status: 500 }
    );
  }

  let incomingForm;
  try {
    incomingForm = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = incomingForm.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PNG or JPG images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image is larger than the 5MB limit." }, { status: 400 });
  }

  const forwardForm = new FormData();
  forwardForm.append("file", file, file.name || "upload");

  let res;
  try {
    res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${pinataJwt}` },
      body: forwardForm,
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the IPFS pinning provider." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.IpfsHash) {
    return NextResponse.json(
      { error: data?.error?.details || data?.error || "IPFS image upload failed." },
      { status: 502 }
    );
  }

  return NextResponse.json({ cid: data.IpfsHash });
}
