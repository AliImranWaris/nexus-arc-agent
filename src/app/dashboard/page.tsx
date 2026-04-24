"use client";

import { useState } from "react";
import Link from "next/link";
import BalancePanel from "@/components/BalancePanel";
import TransferForm, { type TransferPrefill } from "@/components/TransferForm";
import ProposalsPanel from "@/components/ProposalsPanel";
import DemoBalanceTools from "@/components/DemoBalanceTools";
import DemoModeToggle from "@/components/DemoModeToggle";
import {
  WalletSessionProvider,
  useWalletSession,
} from "@/components/WalletSessionProvider";

function SessionBanner() {
  const { status, session, error, renew } = useWalletSession();

  if (status === "ready" && session) {
    const issued = new Date(session.issuedAt);
    if (session.mock) {
      return (
        <div className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-4 flex items-start gap-3">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0 mt-1.5" />
          <div className="flex-1 text-sm">
            <p className="text-amber-200 font-medium">
              Mock wallet session active (Circle bypass)
            </p>
            <p className="text-xs text-amber-400/90 mt-0.5">
              {session.network} · issued {issued.toLocaleTimeString()}. Showing
              mock wallets so you can review the UI and Gemini analysis. Reason:{" "}
              <span className="font-mono text-amber-300/80">
                {session.mockReason ?? "Circle credentials unavailable"}
              </span>
            </p>
          </div>
          <button
            onClick={() => void renew()}
            className="shrink-0 rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-300 hover:border-amber-500 hover:text-amber-200 transition-colors"
          >
            Retry live session
          </button>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/20 p-4 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <div className="flex-1 text-sm text-emerald-200">
          <span className="font-medium">Wallet session active</span>
          <span className="text-emerald-400/80 ml-2 text-xs">
            on {session.network} · issued {issued.toLocaleTimeString()} · refresh in ~
            {Math.round(session.expiresInSeconds / 60)} min
          </span>
        </div>
        <button
          onClick={() => void renew()}
          className="rounded-lg border border-emerald-700/60 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:border-emerald-500 hover:text-emerald-200 transition-colors"
        >
          Renew now
        </button>
      </div>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex items-center gap-3 text-sm text-slate-400">
        <svg className="h-4 w-4 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Establishing wallet session with Circle…
      </div>
    );
  }

  // expired or error
  const isExpired = status === "expired";
  return (
    <div className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-4 flex items-start gap-3">
      <svg className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-200">
          {isExpired ? "Session Expired" : "Session unavailable"}
        </p>
        <p className="text-xs text-amber-400/90 mt-0.5">
          {error ??
            (isExpired
              ? "Your wallet session token has expired. Generate a new one to continue."
              : "Could not start a Circle wallet session. Try again, or check that CIRCLE_API_KEY is set.")}
        </p>
      </div>
      <button
        onClick={() => void renew()}
        className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-amber-500 transition-colors"
      >
        Generate new token
      </button>
    </div>
  );
}

function DashboardContent() {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [transferPrefill, setTransferPrefill] = useState<TransferPrefill | null>(null);
  const [walletsForTools, setWalletsForTools] = useState<
    Array<{ id: string; address: string; blockchain: string }>
  >([]);

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
            <DemoModeToggle walletIds={walletsForTools.map((w) => w.id)} />
            <span className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
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
        <SessionBanner />

        {/* Row 1: Wallets + Transfer */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BalancePanel
            onWalletSelect={setSelectedWalletId}
            selectedWalletId={selectedWalletId}
            onWalletsChange={setWalletsForTools}
          />
          <TransferForm
            sourceWalletId={selectedWalletId}
            prefill={transferPrefill}
          />
        </div>

        {/* Dev tools: demo balance overrides */}
        <DemoBalanceTools wallets={walletsForTools} />

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

export default function Dashboard() {
  return (
    <WalletSessionProvider>
      <DashboardContent />
    </WalletSessionProvider>
  );
}
