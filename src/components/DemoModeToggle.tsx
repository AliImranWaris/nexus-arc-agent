"use client";

import { useEffect, useRef } from "react";
import {
  clearAllDemoBalances,
  setAllDemoBalances,
  useDemoBalances,
} from "@/lib/demoBalances";

interface DemoModeToggleProps {
  walletIds: string[];
}

const DEMO_AMOUNT = "10.50";
const AUTO_FLAG = "nexusarc.demoModeAutoApplied";

export default function DemoModeToggle({ walletIds }: DemoModeToggleProps) {
  const overrides = useDemoBalances();
  const autoAppliedRef = useRef(false);

  // Demo mode = every wallet has an override AND it equals the demo amount
  const isOn =
    walletIds.length > 0 &&
    walletIds.every((id) => overrides[id] === DEMO_AMOUNT);

  // Auto-enable demo mode the first time a wallet appears (so judges see
  // a non-zero balance instantly). We honour an explicit "off" by writing
  // the auto flag, so subsequent loads don't re-enable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoAppliedRef.current) return;
    if (walletIds.length === 0) return;

    const everApplied = window.localStorage.getItem(AUTO_FLAG) === "1";
    const anyOverride = Object.keys(overrides).length > 0;

    if (!everApplied && !anyOverride) {
      setAllDemoBalances(walletIds, DEMO_AMOUNT);
      window.localStorage.setItem(AUTO_FLAG, "1");
      autoAppliedRef.current = true;
    } else {
      autoAppliedRef.current = true;
    }
  }, [walletIds, overrides]);

  const toggle = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTO_FLAG, "1");
    }
    if (isOn) {
      clearAllDemoBalances();
    } else {
      setAllDemoBalances(walletIds, DEMO_AMOUNT);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <a
        href="https://faucet.circle.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
        title="Open Circle's hosted faucet in a new tab"
      >
        Faucet
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 17L17 7M17 7H8M17 7V16" />
        </svg>
      </a>
      <button
        onClick={toggle}
        disabled={walletIds.length === 0}
        title={
          walletIds.length === 0
            ? "Provision a wallet first"
            : isOn
              ? "Click to turn demo mode off"
              : `Click to set every wallet to ${DEMO_AMOUNT} USDC for recording`
        }
        className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          isOn
            ? "border border-amber-600/60 bg-amber-900/40 text-amber-200 hover:bg-amber-900/60"
            : "border border-slate-700/80 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isOn ? "bg-amber-400 animate-pulse" : "bg-slate-600"
          }`}
        />
        Demo {isOn ? `· ${DEMO_AMOUNT}` : "Off"}
      </button>
    </div>
  );
}
