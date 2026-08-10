"use client";

import { useRef, useState } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import { useWallet } from "@/lib/WalletProvider";
import { FACTORY_ABI, FACTORY_ADDRESS, CHAIN_NAME } from "@/lib/config";
import { uploadImageToIPFS, uploadMetadataToIPFS, cidToUri } from "@/lib/ipfs";
import {
  RocketIcon,
  FlameIcon,
  UploadImageIcon,
  ChevronDownIcon,
  GlobeIcon,
  XSocialIcon,
  TelegramIcon,
} from "@/components/icons";

// Uploads the logo (and banner, if provided) to IPFS, then builds and
// uploads the metadata JSON, per LAUNCHPAD_ARCHITECTURE.md sections 3-8.
// Fields match the documented schema (name, symbol, description, image,
// website, twitter, telegram) plus "banner" (documented addition).
//
// "pairWith" (ETH vs $BAGUA) is intentionally NOT included here: per section
// 23's on-chain/off-chain split, which asset a curve is paired with is
// protocol/economic state, not descriptive off-chain metadata. It stays out
// of the JSON until the contract defines a real on-chain parameter for it —
// see the "Pair With Bagua" toggle below, which is UI-only for now.
async function buildMetadataURI({ name, symbol, description, imageFile, bannerFile, website, twitter, telegram }, onProgress) {
  onProgress?.("Uploading logo to IPFS…");
  const imageCid = await uploadImageToIPFS(imageFile);

  let bannerUri = null;
  if (bannerFile) {
    onProgress?.("Uploading banner to IPFS…");
    const bannerCid = await uploadImageToIPFS(bannerFile);
    bannerUri = cidToUri(bannerCid);
  }

  onProgress?.("Generating and uploading metadata JSON…");
  const metadata = {
    name,
    symbol,
    description: description || undefined,
    image: cidToUri(imageCid),
    banner: bannerUri || undefined,
    website: website || undefined,
    twitter: twitter || undefined,
    telegram: telegram || undefined,
  };
  const metadataCid = await uploadMetadataToIPFS(metadata);
  return cidToUri(metadataCid);
}

function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <label
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-accent-purple" : "bg-white/15"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </label>
  );
}

export default function LaunchpadView({ onComingSoon }) {
  const { address, connect, isOnGiwaChain, switchToGiwaChain } = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerDataUrl, setBannerDataUrl] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [showSocials, setShowSocials] = useState(false);
  const [pairWithBagua, setPairWithBagua] = useState(false);
  const [showInitialBuy, setShowInitialBuy] = useState(false);
  const [initialBuyEth, setInitialBuyEth] = useState("");
  const [minTokensOut, setMinTokensOut] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState(null);
  const [txError, setTxError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName("");
    setSymbol("");
    setDescription("");
    setImageFile(null);
    setImageDataUrl(null);
    setBannerFile(null);
    setBannerDataUrl(null);
    setWebsite("");
    setTwitter("");
    setTelegram("");
    setPairWithBagua(false);
    setInitialBuyEth("");
    setMinTokensOut("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleCreate = async () => {
    setTxError(null);
    setTxHash(null);
    setStatusText(null);

    if (!name.trim() || !symbol.trim()) {
      setTxError("Enter a token name and symbol first.");
      return;
    }

    if (!imageFile) {
      setTxError("Upload a token image first — it's required per the metadata spec.");
      return;
    }

    if (!FACTORY_ADDRESS) {
      setTxError("Factory contract address isn't configured yet. Set NEXT_PUBLIC_FACTORY_ADDRESS after redeploying.");
      return;
    }

    setSubmitting(true);
    try {
      const metadataURI = await buildMetadataURI(
        {
          name: name.trim(),
          symbol: symbol.trim(),
          description: description.trim(),
          imageFile,
          bannerFile,
          website: website.trim(),
          twitter: twitter.trim(),
          telegram: telegram.trim(),
        },
        setStatusText
      );

      setStatusText("Waiting for wallet confirmation…");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      const fee = await factory.creationFee().catch(() => 0n);
      const buyWei = initialBuyEth.trim() ? parseEther(initialBuyEth.trim()) : 0n;
      // No on-chain quote function exists yet for the bonding curve (see
      // config.js note), so we can't auto-derive minTokensOut from a %
      // tolerance. An advanced manual value defaults to 0 (no protection).
      const minOut = minTokensOut.trim() ? BigInt(minTokensOut.trim()) : 0n;

      setStatusText("Creating token on-chain…");
      const tx = await factory.createTokenAndBuy(name.trim(), symbol.trim(), metadataURI, minOut, {
        value: fee + buyWei,
      });
      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      resetForm();
    } catch (err) {
      setTxError(err?.shortMessage || err?.reason || err?.message || "Failed to create token. Please try again.");
    } finally {
      setSubmitting(false);
      setStatusText(null);
    }
  };

  const handlePrimaryButton = () => {
    if (!address) return connect();
    if (!isOnGiwaChain) return switchToGiwaChain();
    return handleCreate();
  };

  const primaryLabel = !address
    ? "Connect Wallet"
    : !isOnGiwaChain
    ? `Switch to ${CHAIN_NAME}`
    : submitting
    ? statusText || "Creating..."
    : "Create Token";

  return (
    <section className="mx-4 mt-4 pb-6">
      <div className="rounded-2xl bg-bg-panel card-border p-4">
        <h2 className="font-display text-lg font-bold text-white">Launch Your Meme Coin</h2>
        <p className="mt-0.5 text-sm text-white/50">Create and launch your token on {CHAIN_NAME}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm text-white/70">
              Token Name
              <span className="text-xs text-white/30">{name.length}/32</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 32))}
              maxLength={32}
              placeholder="e.g. Moon Bagua"
              className="w-full rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm text-white/70">
              Token Symbol
              <span className="text-xs text-white/30">{symbol.length}/10</span>
            </label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase().slice(0, 10))}
              maxLength={10}
              placeholder="e.g. MOON"
              className="w-full rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm text-white/70">Token Image</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-full min-h-[104px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-bg-border bg-bg-card px-3 py-4 text-white/50"
          >
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Token preview" className="h-14 w-14 rounded-lg object-cover" />
            ) : (
              <>
                <UploadImageIcon />
                <span className="text-xs">Upload Image (PNG, JPG)</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1.5 flex items-center justify-between text-sm text-white/70">
            Description (optional)
            <span className="text-xs text-white/30">{description.length}/300</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
            maxLength={300}
            rows={3}
            placeholder="Tell the world about your token..."
            className="w-full resize-none rounded-xl bg-bg-card card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
          />
        </div>

        {/* Add banner (optional) */}
        <div className="mt-4 rounded-xl bg-bg-card card-border p-3">
          <button
            type="button"
            onClick={() => setShowBanner((v) => !v)}
            className="flex w-full items-center justify-between text-sm text-white/70"
          >
            <span className="flex items-center gap-2">
              <UploadImageIcon width="16" height="16" />
              Add banner <span className="text-white/30">(Optional)</span>
            </span>
            <ChevronDownIcon
              width="16"
              height="16"
              className={`transition-transform ${showBanner ? "rotate-180" : ""}`}
            />
          </button>

          {showBanner && (
            <div className="mt-3">
              <p className="mb-2 text-xs text-white/40">
                Shown on the coin page in addition to the coin image. 3:1 / 1500×500px recommended.
              </p>
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex h-full min-h-[80px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-bg-border bg-bg-panel px-3 py-4 text-white/50"
              >
                {bannerDataUrl ? (
                  <img src={bannerDataUrl} alt="Banner preview" className="h-16 w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <UploadImageIcon />
                    <span className="text-xs">Upload Banner (PNG, JPG)</span>
                  </>
                )}
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Social links (optional) */}
        <div className="mt-3 rounded-xl bg-bg-card card-border p-3">
          <button
            type="button"
            onClick={() => setShowSocials((v) => !v)}
            className="flex w-full items-center justify-between text-sm text-white/70"
          >
            <span className="flex items-center gap-2">
              <GlobeIcon />
              Add social links <span className="text-white/30">(Optional)</span>
            </span>
            <ChevronDownIcon
              width="16"
              height="16"
              className={`transition-transform ${showSocials ? "rotate-180" : ""}`}
            />
          </button>

          {showSocials && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/50">
                  <GlobeIcon width="14" height="14" /> Website
                </label>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  className="w-full rounded-xl bg-bg-panel card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/50">
                  <XSocialIcon width="14" height="14" /> X
                </label>
                <input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/yourtoken"
                  className="w-full rounded-xl bg-bg-panel card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/50">
                  <TelegramIcon width="14" height="14" /> Telegram
                </label>
                <input
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/yourtoken"
                  className="w-full rounded-xl bg-bg-panel card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pair With Bagua */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-bg-card card-border p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
              <FlameIcon width="18" height="18" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Pair With Bagua</p>
              <p className="text-xs text-white/50">Launch your token&apos;s liquidity paired with $BAGUA instead of ETH.</p>
            </div>
          </div>
          <ToggleSwitch
            checked={pairWithBagua}
            onChange={setPairWithBagua}
            disabled={submitting}
            label="Pair With Bagua"
          />
        </div>

        {/* Initial buy (optional) */}
        <div className="mt-3 rounded-xl bg-bg-card card-border p-3">
          <button
            type="button"
            onClick={() => setShowInitialBuy((v) => !v)}
            className="flex w-full items-center justify-between text-sm text-white/70"
          >
            <span className="flex items-center gap-2">
              <RocketIcon width="16" height="16" />
              Buy tokens at launch <span className="text-white/30">(Optional)</span>
            </span>
            <ChevronDownIcon
              width="16"
              height="16"
              className={`transition-transform ${showInitialBuy ? "rotate-180" : ""}`}
            />
          </button>

          {showInitialBuy && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-white/50">Initial buy amount (ETH)</label>
                <input
                  value={initialBuyEth}
                  onChange={(e) => setInitialBuyEth(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.0"
                  className="w-full rounded-xl bg-bg-panel card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/50">
                  Minimum tokens received (advanced, optional)
                </label>
                <input
                  value={minTokensOut}
                  onChange={(e) => setMinTokensOut(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full rounded-xl bg-bg-panel card-border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                />
                <p className="mt-1.5 text-[11px] leading-snug text-white/40">
                  There&apos;s no on-chain price quote for the bonding curve yet, so this can&apos;t be
                  calculated for you from a slippage %. Leaving it at 0 means your initial buy
                  accepts any output amount — set it manually if you want protection.
                </p>
              </div>
            </div>
          )}
        </div>

        {statusText && submitting && (
          <p className="mt-3 rounded-xl border border-accent-purple/30 bg-accent-purple/10 px-4 py-2.5 text-sm text-accent-purple">
            {statusText}
          </p>
        )}
        {txError && (
          <p className="mt-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">
            {txError}
          </p>
        )}
        {txHash && (
          <p className="mt-3 rounded-xl border border-accent-green/30 bg-accent-green/10 px-4 py-2.5 text-sm text-accent-green">
            Token created: {txHash.slice(0, 10)}...{txHash.slice(-6)}
          </p>
        )}

        <button
          onClick={handlePrimaryButton}
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-purple py-3.5 text-center font-semibold text-white disabled:opacity-60"
        >
          <RocketIcon width="18" height="18" />
          {primaryLabel}
        </button>
        <p className="mt-2 text-center text-xs text-white/40">
          Deploys on {CHAIN_NAME} • Takes a few seconds
        </p>
      </div>
    </section>
  );
}
