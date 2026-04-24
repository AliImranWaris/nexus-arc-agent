"use client";

import { useEffect, useState, useCallback } from "react";
import WalletCard from "./WalletCard";
import { useWalletSession } from "./WalletSessionProvider";
import InitializeWalletButton from "./InitializeWalletButton";
import { useDemoBalances } from "@/lib/demoBalances";

interface Wallet {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  usdcBalance: string;
}

interface BalanceData {
  wallets: Wallet[];
  totalUSDC: string;
  error?: string;
}

interface BalancePanelProps {
  onWalletSelect: (walletId: string) => void;
  selectedWalletId: string | null;
  onWalletsChange?: (wallets: Array<{ id: string; address: string; blockchain: string }>) => void;
}

export default function BalancePanel({ onWalletSelect, selectedWalletId, onWalletsChange }: BalancePanelProps) {
  const { status: sessionStatus, authedFetch } = useWalletSession();
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const demoBalances = useDemoBalances();

  const displayWallets = (data?.wallets ?? []).map((w) => {
    const override = demoBalances[w.id];
    return override
      ? { ...w, usdcBalance: override, _demo: true as const }
      : { ...w, _demo: false as const };
  });

  const displayTotal = displayWallets
    .reduce((sum, w) => sum + (parseFloat(w.usdcBalance) || 0), 0)
    .toFixed(2);
  const hasAnyDemo = displayWallets.some((w) => w._demo);

  const fetchBalances = useCallback(async () => {
    if (sessionStatus !== "ready") return;
    setLoading(true);
    try {
      const res = await authedFetch("/api/wallet/balance");
      const json: BalanceData = await res.json();
      if (!res.ok) {
        setData({ wallets: [], totalUSDC: "0.00", error: json.error || "Failed to fetch balances." });
        onWalletsChange?.([]);
      } else {
        setData(json);
        onWalletsChange?.(
          (json.wallets ?? []).map((w) => ({
            id: w.id,
            address: w.address,
            blockchain: w.blockchain,
          })),
        );
      }
      setLastRefreshed(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch balances.";
      setData({ wallets: [], totalUSDC: "0.00", error: msg });
      onWalletsChange?.([]);
    } finally {
      setLoading(false);
    }
  }, [sessionStatus, authedFetch, onWalletsChange]);

  useEffect(() => {
    if (sessionStatus === "ready") fetchBalances();
  }, [sessionStatus, fetchBalances]);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Wallets</h2>
          {lastRefreshed && (
            <p className="text-xs text-slate-500 mt-0.5">
              Last updated {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchBalances}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-slate-500 hover:text-slate-200 disabled:opacity-50"
        >
          <svg
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Total balance summary */}
      {data && !data.error && (
        <div className="mb-5 rounded-lg bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border border-indigo-800/40 p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Balance</p>
            {hasAnyDemo && (
              <span className="rounded-full bg-amber-900/40 border border-amber-700/50 px-2 py-0.5 text-[10px] font-medium text-amber-300 uppercase tracking-wider">
                Demo override
              </span>
            )}
          </div>
          <p className="text-4xl font-bold text-white">
            {displayTotal}
            <span className="text-lg text-slate-400 ml-2 font-normal">USDC</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{displayWallets.length} wallet{displayWallets.length !== 1 ? "s" : ""} on testnet</p>
        </div>
      )}

      {/* States */}
      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Fetching wallets…</p>
          </div>
        </div>
      )}

      {data?.error && (
        <div className="rounded-lg border border-rose-700/50 bg-rose-950/30 p-4 text-sm text-rose-400">
          <p className="font-medium mb-1">Could not load wallets</p>
          <p className="text-rose-500">{data.error}</p>
          <p className="mt-2 text-xs text-rose-600">
            Try renewing your wallet session above, or verify CIRCLE_API_KEY in Replit Secrets.
          </p>
        </div>
      )}

      {data && !data.error && data.wallets.length === 0 && (
        <div className="py-6 px-2 space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-300 font-medium">
              No wallet on Arc Testnet yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Provision your first user-controlled wallet. Circle will prompt
              you to set a PIN — it stays in your browser.
            </p>
          </div>
          <InitializeWalletButton onCreated={fetchBalances} />
        </div>
      )}

      {data && !data.error && displayWallets.length > 0 && (
        <div className="space-y-3">
          {displayWallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              demo={wallet._demo}
              selected={selectedWalletId === wallet.id}
              onSelect={onWalletSelect}
              onFunded={fetchBalances}
            />
          ))}
        </div>
      )}
    </div>
  );
}
