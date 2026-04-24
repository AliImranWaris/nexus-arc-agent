"use client";

import { useState, useEffect, useRef } from "react";
import { useWalletSession } from "./WalletSessionProvider";

export interface TransferPrefill {
  destinationAddress: string;
  amount: string;
}

interface TransferFormProps {
  sourceWalletId: string | null;
  prefill?: TransferPrefill | null;
}

interface TransferResult {
  success?: boolean;
  challengeId?: string;
  message?: string;
  error?: string;
  signed?: boolean;
}

const PRESET_AMOUNTS = ["0.001", "0.005", "0.01"];
const APP_ID = process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "";

export default function TransferForm({ sourceWalletId, prefill }: TransferFormProps) {
  const { session, status: sessionStatus, authedFetch } = useWalletSession();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const sdkRef = useRef<unknown>(null);

  useEffect(() => {
    if (prefill) {
      setDestination(prefill.destinationAddress);
      setAmount(prefill.amount);
      setIsPrefilled(true);
      setResult(null);
    }
  }, [prefill]);

  const isValidAddress = destination.startsWith("0x") && destination.length === 42;
  const sessionReady = sessionStatus === "ready";
  // Per demo requirements: keep Submit always enabled (only block on loading).
  const canSubmit = !loading;

  async function openPinChallenge(challengeId: string) {
    if (!session || session.mock) return;
    if (!APP_ID) return;
    try {
      const mod = await import("@circle-fin/w3s-pw-web-sdk");
      const W3SSdk = (mod as { W3SSdk: new (...args: unknown[]) => unknown }).W3SSdk;
      if (!sdkRef.current) sdkRef.current = new W3SSdk();
      const sdk = sdkRef.current as {
        setAppSettings: (s: { appId: string }) => void;
        setAuthentication: (a: { userToken: string; encryptionKey: string }) => void;
        execute: (
          challengeId: string,
          cb: (err: unknown, r?: { type?: string; status?: string }) => void,
        ) => void;
      };
      sdk.setAppSettings({ appId: APP_ID });
      sdk.setAuthentication({
        userToken: session.userToken,
        encryptionKey: session.encryptionKey,
      });
      sdk.execute(challengeId, (err, r) => {
        if (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setResult((prev) => ({ ...(prev ?? {}), error: `PIN challenge: ${msg}` }));
          return;
        }
        if (r?.status === "COMPLETE") {
          setResult((prev) => ({
            ...(prev ?? {}),
            signed: true,
            message: "Signed and submitted on Arc Testnet. Check Circle console for confirmation.",
          }));
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to open PIN modal.";
      setResult((prev) => ({ ...(prev ?? {}), error: msg }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // Friendly inline guards (don't disable the button — just don't fire the API)
    if (!sourceWalletId) {
      setResult({ error: "Pick a source wallet from the Wallets panel." });
      return;
    }
    if (!isValidAddress) {
      setResult({ error: "Enter a valid EVM address (0x + 40 hex chars)." });
      return;
    }
    if (!(parseFloat(amount) > 0)) {
      setResult({ error: "Amount must be greater than zero." });
      return;
    }
    if (!sessionReady) {
      setResult({ error: "Wallet session not ready yet. Wait a moment and retry." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await authedFetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceWalletId,
          destinationAddress: destination,
          amount,
        }),
      });
      const data: TransferResult = await res.json();
      setResult(data);
      if (data.success) {
        setIsPrefilled(false);
        if (data.challengeId) {
          // Auto-open Circle's PIN challenge modal so the user can sign immediately
          void openPinChallenge(data.challengeId);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  }

  function handleClearPrefill() {
    setDestination("");
    setAmount("0.01");
    setIsPrefilled(false);
    setResult(null);
  }

  return (
    <div id="transfer-form" className="rounded-xl border border-slate-700 bg-slate-800/60 p-6 scroll-mt-24">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-lg font-semibold text-white">Review &amp; Send</h2>
        {isPrefilled && (
          <span className="flex items-center gap-1.5 rounded-full border border-indigo-600/50 bg-indigo-950/40 px-2.5 py-1 text-xs text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Pre-filled from proposal
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Review all details carefully. Submitting creates a Circle challenge —{" "}
        <span className="text-slate-300 font-medium">you must sign it in your secure wallet UI</span>{" "}
        to authorise the transfer.
      </p>

      {/* Prefill banner */}
      {isPrefilled && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-indigo-700/40 bg-indigo-950/30 p-3">
          <svg className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1 text-xs text-indigo-300">
            Form pre-filled from the selected proposal. Verify the destination and amount before submitting.
          </div>
          <button
            onClick={handleClearPrefill}
            className="text-xs text-indigo-500 hover:text-indigo-300 transition-colors shrink-0"
          >
            Clear
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Source wallet indicator */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Source Wallet
          </label>
          <div
            className={`rounded-lg border px-3 py-2.5 text-sm font-mono ${
              sourceWalletId
                ? "border-indigo-700 bg-indigo-950/40 text-indigo-300"
                : "border-slate-700 bg-slate-900/40 text-slate-500"
            }`}
          >
            {sourceWalletId ?? "Select a wallet in the Wallets panel"}
          </div>
        </div>

        {/* Destination address */}
        <div>
          <label
            htmlFor="destination"
            className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider"
          >
            Destination Address
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => { setDestination(e.target.value); setIsPrefilled(false); }}
            placeholder="0x..."
            className={`w-full rounded-lg border px-3 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
              isPrefilled && destination
                ? "border-indigo-600/60 bg-indigo-950/20 focus:border-indigo-500 focus:ring-indigo-500"
                : "border-slate-700 bg-slate-900/60 focus:border-indigo-500 focus:ring-indigo-500"
            }`}
          />
          {destination && !isValidAddress && (
            <p className="mt-1 text-xs text-rose-400">
              Enter a valid EVM address (0x + 40 hex chars)
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Amount (USDC)
          </label>
          <div className="flex gap-2 mb-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { setAmount(preset); setIsPrefilled(false); }}
                className={`flex-1 rounded-lg border py-1.5 text-sm font-medium transition-colors ${
                  amount === preset
                    ? "border-indigo-500 bg-indigo-900/60 text-indigo-300"
                    : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-500"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            min="0.001"
            max="10"
            step="0.001"
            onChange={(e) => { setAmount(e.target.value); setIsPrefilled(false); }}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
              isPrefilled
                ? "border-indigo-600/60 bg-indigo-950/20 focus:border-indigo-500 focus:ring-indigo-500"
                : "border-slate-700 bg-slate-900/60 focus:border-indigo-500 focus:ring-indigo-500"
            }`}
          />
        </div>

        {/* Submit — kept always enabled for the demo so judges can see the
            PIN challenge modal regardless of on-chain balance. */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Preparing Circle handshake…
            </span>
          ) : (
            "Submit for Signing →"
          )}
        </button>

        {!sourceWalletId && (
          <p className="text-center text-xs text-slate-500">
            Select a source wallet in the Wallets panel above to enable transfer
          </p>
        )}
      </form>

      {/* Result */}
      {result && (
        <div
          className={`mt-5 rounded-lg border p-4 text-sm ${
            result.error
              ? "border-rose-700 bg-rose-950/40 text-rose-300"
              : "border-emerald-700 bg-emerald-950/40 text-emerald-300"
          }`}
        >
          {result.error ? (
            <p><span className="font-semibold">Error:</span> {result.error}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <p className="font-semibold text-emerald-200">Challenge Created — Awaiting User Signature</p>
              </div>
              <p className="text-emerald-400">{result.message}</p>
              {result.challengeId && (
                <div className="mt-2 rounded border border-emerald-800 bg-emerald-950/60 p-2">
                  <p className="text-xs text-emerald-500 mb-1">Circle Challenge ID</p>
                  <p className="font-mono text-xs text-emerald-300 break-all">{result.challengeId}</p>
                  {!result.signed && (
                    <p className="mt-2 text-[11px] text-emerald-400/80">
                      Enter your PIN in the Circle popup to authorise.
                    </p>
                  )}
                  {result.signed && (
                    <p className="mt-2 text-[11px] text-emerald-300 font-semibold">
                      ✓ Signed
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
