"use client";

import { useState } from "react";
import {
  clearAllDemoBalances,
  setDemoBalance,
  useDemoBalances,
} from "@/lib/demoBalances";

interface DemoBalanceToolsProps {
  wallets: Array<{ id: string; address: string; blockchain: string }>;
}

export default function DemoBalanceTools({ wallets }: DemoBalanceToolsProps) {
  const overrides = useDemoBalances();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const overrideCount = Object.keys(overrides).length;

  const apply = (walletId: string) => {
    const value = draft[walletId] ?? overrides[walletId] ?? "";
    setDemoBalance(walletId, value);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Dev tools
          </span>
          <span className="text-xs text-slate-300">
            Demo balance overrides
          </span>
          {overrideCount > 0 && (
            <span className="rounded-full bg-indigo-900/50 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
              {overrideCount} active
            </span>
          )}
        </div>
        <svg
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-800 px-4 py-4 space-y-3">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Manually override the displayed USDC balance for any wallet so you
            can record the Review &amp; Send flow even when the testnet faucet
            is unavailable. Overrides are display-only — they live in your
            browser&apos;s local storage and never affect on-chain state.
          </p>

          {wallets.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              No wallets yet. Provision one above to use this panel.
            </p>
          )}

          {wallets.map((w) => {
            const current = overrides[w.id] ?? "";
            const draftValue = draft[w.id] ?? current;
            return (
              <div
                key={w.id}
                className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/40 p-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-slate-400 truncate">
                    {w.address.slice(0, 10)}…{w.address.slice(-6)}
                  </p>
                  <p className="text-[10px] text-slate-600">{w.blockchain}</p>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={draftValue}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [w.id]: e.target.value }))
                  }
                  className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => apply(w.id)}
                  className="rounded-md border border-indigo-700/60 bg-indigo-950/40 px-2 py-1 text-[11px] font-semibold text-indigo-300 hover:border-indigo-500"
                >
                  Set
                </button>
                {current && (
                  <button
                    onClick={() => setDemoBalance(w.id, "")}
                    className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-rose-700 hover:text-rose-400"
                  >
                    Clear
                  </button>
                )}
              </div>
            );
          })}

          {overrideCount > 0 && (
            <button
              onClick={clearAllDemoBalances}
              className="text-[11px] text-slate-500 hover:text-rose-400"
            >
              Clear all overrides
            </button>
          )}
        </div>
      )}
    </div>
  );
}
