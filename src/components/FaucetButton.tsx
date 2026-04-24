"use client";

import { useState } from "react";
import { useWalletSession } from "./WalletSessionProvider";
import { setDemoBalance } from "@/lib/demoBalances";

interface FaucetButtonProps {
  walletId: string;
  blockchain: string;
  onFunded: () => void;
}

type FaucetState = "idle" | "requesting" | "success" | "error" | "external";

interface ExternalFallback {
  url: string;
  address: string;
  blockchain: string;
}

export default function FaucetButton({
  walletId,
  blockchain,
  onFunded,
}: FaucetButtonProps) {
  const { authedFetch } = useWalletSession();
  const [state, setState] = useState<FaucetState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [external, setExternal] = useState<ExternalFallback | null>(null);

  const requestDrip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("requesting");
    setMessage(null);
    setExternal(null);
    try {
      const res = await authedFetch("/api/wallet/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId,
          blockchain,
          usdc: true,
          native: true,
        }),
      });
      const data = await res.json();

      if (data?.requiresExternalFaucet) {
        setState("external");
        setMessage(data.message ?? "API faucet unavailable. Use the Circle Faucet below.");
        setExternal({
          url: data.externalFaucetUrl,
          address: data.address,
          blockchain: data.blockchain,
        });
        return;
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || "Faucet request failed.");
      }

      setState("success");
      setMessage(data.message || "Drip requested. Funds usually arrive in ~30s.");
      setTimeout(() => onFunded(), 4000);
      setTimeout(() => onFunded(), 15000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Faucet request failed.";
      setState("error");
      setMessage(msg);
    }
  };

  const applyDemoBalance = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDemoBalance(walletId, "10.00");
    onFunded();
  };

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (external?.address) {
      void navigator.clipboard.writeText(external.address);
    }
  };

  const label = (() => {
    switch (state) {
      case "requesting":
        return "Requesting…";
      case "success":
        return "Dripped ✓";
      case "external":
        return "Faucet unavailable";
      case "error":
        return "Retry faucet";
      default:
        return "Request testnet USDC";
    }
  })();

  return (
    <div className="space-y-1.5">
      <button
        onClick={requestDrip}
        disabled={state === "requesting"}
        className="w-full rounded-md border border-emerald-700/60 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:border-emerald-500 hover:bg-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {label}
      </button>

      {message && (
        <p
          className={`text-[11px] leading-relaxed ${
            state === "error"
              ? "text-rose-400"
              : state === "external"
                ? "text-amber-400"
                : "text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}

      {state === "external" && external && (
        <div
          className="rounded-md border border-amber-700/40 bg-amber-950/20 p-2 space-y-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <a
              href={external.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-md border border-amber-700/60 bg-amber-950/40 px-2 py-1.5 text-center text-[11px] font-semibold text-amber-200 hover:border-amber-500 hover:bg-amber-900/40 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Open Circle Faucet ↗
            </a>
            <button
              onClick={copyAddress}
              className="rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-[11px] text-slate-300 hover:border-slate-500"
              title="Copy address"
            >
              Copy addr
            </button>
          </div>
          <button
            onClick={applyDemoBalance}
            className="w-full rounded-md border border-indigo-700/60 bg-indigo-950/40 px-2 py-1.5 text-[11px] font-semibold text-indigo-200 hover:border-indigo-500 hover:bg-indigo-900/40 transition-colors"
          >
            Apply demo balance (10.00 USDC)
          </button>
          <p className="text-[10px] text-amber-500/80 leading-snug">
            Demo balance is display-only — it lets you record the Review &amp; Send
            flow but won&apos;t settle on-chain.
          </p>
        </div>
      )}
    </div>
  );
}
