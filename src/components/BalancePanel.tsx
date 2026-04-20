"use client";

import { useEffect, useState, useCallback } from "react";
import WalletCard from "./WalletCard";

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
}

export default function BalancePanel({ onWalletSelect, selectedWalletId }: BalancePanelProps) {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/balance");
      const json: BalanceData = await res.json();
      setData(json);
      setLastRefreshed(new Date());
    } catch {
      setData({ wallets: [], totalUSDC: "0.00", error: "Failed to fetch balances." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

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
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Balance</p>
          <p className="text-4xl font-bold text-white">
            {data.totalUSDC}
            <span className="text-lg text-slate-400 ml-2 font-normal">USDC</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{data.wallets.length} wallet{data.wallets.length !== 1 ? "s" : ""} on testnet</p>
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
            Make sure CIRCLE_API_KEY and CIRCLE_USER_TOKEN are set in .env.local
          </p>
        </div>
      )}

      {data && !data.error && data.wallets.length === 0 && (
        <div className="py-10 text-center text-slate-500 text-sm">
          No wallets found for this user token.
        </div>
      )}

      {data && !data.error && data.wallets.length > 0 && (
        <div className="space-y-3">
          {data.wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              selected={selectedWalletId === wallet.id}
              onSelect={onWalletSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
