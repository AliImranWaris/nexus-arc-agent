"use client";

import { useState } from "react";
import { useWalletSession } from "./WalletSessionProvider";

interface FaucetButtonProps {
  walletId: string;
  blockchain: string;
  onFunded: () => void;
}

type FaucetState = "idle" | "requesting" | "success" | "error";

export default function FaucetButton({
  walletId,
  blockchain,
  onFunded,
}: FaucetButtonProps) {
  const { authedFetch } = useWalletSession();
  const [state, setState] = useState<FaucetState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const requestDrip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("requesting");
    setMessage(null);
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
      if (!res.ok || data.error) {
        throw new Error(data.error || "Faucet request failed.");
      }
      setState("success");
      setMessage(data.message || "Drip requested. Funds usually arrive in ~30s.");
      // Give the chain a beat, then refresh balances
      setTimeout(() => onFunded(), 4000);
      setTimeout(() => onFunded(), 15000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Faucet request failed.";
      setState("error");
      setMessage(msg);
    }
  };

  const label = (() => {
    switch (state) {
      case "requesting":
        return "Requesting…";
      case "success":
        return "Dripped ✓";
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
            state === "error" ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
