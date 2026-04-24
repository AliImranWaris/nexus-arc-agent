"use client";

const STORAGE_KEY = "nexusarc.demoBalances";
const EVENT_NAME = "nexusarc:demo-balances-changed";

export type DemoBalances = Record<string, string>;

function read(): DemoBalances {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as DemoBalances;
    return {};
  } catch {
    return {};
  }
}

function write(next: DemoBalances) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getDemoBalances(): DemoBalances {
  return read();
}

export function setDemoBalance(walletId: string, amount: string) {
  const current = read();
  const trimmed = amount.trim();
  if (!trimmed || isNaN(parseFloat(trimmed))) {
    delete current[walletId];
  } else {
    current[walletId] = parseFloat(trimmed).toFixed(2);
  }
  write(current);
}

export function clearDemoBalance(walletId: string) {
  const current = read();
  delete current[walletId];
  write(current);
}

export function clearAllDemoBalances() {
  write({});
}

/**
 * Sets the same demo balance for every wallet id in one shot.
 * Useful for a "Demo Mode ON" master toggle.
 */
export function setAllDemoBalances(walletIds: string[], amount: string) {
  const next: DemoBalances = {};
  const fixed = isNaN(parseFloat(amount))
    ? "10.00"
    : parseFloat(amount).toFixed(2);
  walletIds.forEach((id) => {
    next[id] = fixed;
  });
  write(next);
}

export function subscribeDemoBalances(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

import { useEffect, useState } from "react";

export function useDemoBalances(): DemoBalances {
  const [balances, setBalances] = useState<DemoBalances>({});
  useEffect(() => {
    setBalances(read());
    return subscribeDemoBalances(() => setBalances(read()));
  }, []);
  return balances;
}
