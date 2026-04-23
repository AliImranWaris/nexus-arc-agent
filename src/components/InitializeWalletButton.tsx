"use client";

import { useCallback, useRef, useState } from "react";
import { useWalletSession } from "./WalletSessionProvider";

interface InitializeWalletButtonProps {
  onCreated: () => void;
}

type InitState =
  | "idle"
  | "loading-sdk"
  | "creating-challenge"
  | "awaiting-pin"
  | "success"
  | "error";

const APP_ID = process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "";

export default function InitializeWalletButton({
  onCreated,
}: InitializeWalletButtonProps) {
  const { session, authedFetch } = useWalletSession();
  const [state, setState] = useState<InitState>("idle");
  const [error, setError] = useState<string | null>(null);
  const sdkRef = useRef<unknown>(null);

  const initialize = useCallback(async () => {
    setError(null);
    if (!session) {
      setError("No active wallet session.");
      setState("error");
      return;
    }
    if (session.mock) {
      setError(
        "Wallet provisioning is unavailable in mock mode. Add a valid CIRCLE_API_KEY to enable it.",
      );
      setState("error");
      return;
    }
    if (!APP_ID) {
      setError(
        "NEXT_PUBLIC_CIRCLE_APP_ID is not set. Add it to Replit Secrets so the Circle Web SDK can initialize.",
      );
      setState("error");
      return;
    }

    try {
      setState("loading-sdk");
      const mod = await import("@circle-fin/w3s-pw-web-sdk");
      const W3SSdk = (mod as { W3SSdk: new (...args: unknown[]) => unknown }).W3SSdk;
      if (!sdkRef.current) {
        sdkRef.current = new W3SSdk();
      }
      const sdk = sdkRef.current as {
        setAppSettings: (s: { appId: string }) => void;
        setAuthentication: (a: { userToken: string; encryptionKey: string }) => void;
        execute: (
          challengeId: string,
          cb: (err: unknown, result?: { type?: string; status?: string }) => void,
        ) => void;
      };

      sdk.setAppSettings({ appId: APP_ID });
      sdk.setAuthentication({
        userToken: session.userToken,
        encryptionKey: session.encryptionKey,
      });

      setState("creating-challenge");
      const res = await authedFetch("/api/wallet/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockchain: "ARC-TESTNET" }),
      });
      const data = await res.json();
      if (!res.ok || !data.challengeId) {
        throw new Error(data.error || "Failed to create wallet challenge.");
      }

      setState("awaiting-pin");
      sdk.execute(data.challengeId, (err, result) => {
        if (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
          setState("error");
          return;
        }
        if (result?.status === "COMPLETE") {
          setState("success");
          onCreated();
        } else {
          setError(
            `Challenge finished with status: ${result?.status ?? "unknown"}`,
          );
          setState("error");
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setState("error");
    }
  }, [session, authedFetch, onCreated]);

  const isBusy =
    state === "loading-sdk" ||
    state === "creating-challenge" ||
    state === "awaiting-pin";

  const label = (() => {
    switch (state) {
      case "loading-sdk":
        return "Loading Circle widget…";
      case "creating-challenge":
        return "Creating challenge…";
      case "awaiting-pin":
        return "Complete PIN in popup…";
      case "success":
        return "Wallet created ✓";
      default:
        return "Create Arc Testnet wallet";
    }
  })();

  return (
    <div className="space-y-2">
      <button
        onClick={initialize}
        disabled={isBusy || state === "success"}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {label}
      </button>
      {error && (
        <p className="text-xs text-rose-400 leading-relaxed">{error}</p>
      )}
      {state === "awaiting-pin" && (
        <p className="text-xs text-indigo-300">
          Set or enter your Circle PIN in the secure popup. Your PIN never
          leaves your browser.
        </p>
      )}
    </div>
  );
}
