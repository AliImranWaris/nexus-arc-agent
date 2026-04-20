"use client";

import { useState } from "react";
import Link from "next/link";
import BalancePanel from "@/components/BalancePanel";
import TransferForm, { type TransferPrefill } from "@/components/TransferForm";
import ProposalsPanel from "@/components/ProposalsPanel";

export default function Dashboard() {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [transferPrefill, setTransferPrefill] = useState<TransferPrefill | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top nav */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors mr-1"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Home
            </Link>
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">NexusArc Dashboard</h1>
              <p className="text-xs text-slate-500">Circle Programmable Wallets · Arc Testnet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
              User-controlled · Self-custody
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Testnet
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Setup banner */}
        <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 flex gap-3">
          <svg className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm text-amber-500">
            <span className="font-medium text-amber-300">Setup required — </span>
            Add{" "}
            <code className="font-mono text-amber-400">CIRCLE_API_KEY</code>,{" "}
            <code className="font-mono text-amber-400">CIRCLE_USER_TOKEN</code>, and{" "}
            <code className="font-mono text-amber-400">CIRCLE_ENCRYPTION_KEY</code>{" "}
            to <code className="font-mono text-amber-400">.env.local</code>.
            Get credentials at{" "}
            <span className="text-amber-400 underline underline-offset-2 cursor-default">console.circle.com</span>.
          </p>
        </div>

        {/* Row 1: Wallets + Transfer */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BalancePanel
            onWalletSelect={setSelectedWalletId}
            selectedWalletId={selectedWalletId}
          />
          <TransferForm
            sourceWalletId={selectedWalletId}
            prefill={transferPrefill}
          />
        </div>

        {/* Row 2: Proposals — full width */}
        <ProposalsPanel onPropose={setTransferPrefill} />

        {/* Footer stat strip */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Network", value: "Arc Testnet" },
            { label: "Protocol", value: "Circle UCW SDK" },
            { label: "Custody", value: "User self-custody" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-semibold text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
