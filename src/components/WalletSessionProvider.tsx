"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const USER_ID_STORAGE_KEY = "nexusarc.userId";
export const USER_TOKEN_HEADER = "x-circle-user-token";

export type SessionStatus = "idle" | "loading" | "ready" | "expired" | "error";

export interface WalletSession {
  userId: string;
  userToken: string;
  encryptionKey: string;
  issuedAt: string;
  expiresInSeconds: number;
  network: string;
}

interface WalletSessionContextValue {
  session: WalletSession | null;
  status: SessionStatus;
  error: string | null;
  renew: () => Promise<void>;
  /** Wraps fetch to attach the session token & auto-mark expired on 401. */
  authedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const WalletSessionContext = createContext<WalletSessionContextValue | null>(
  null,
);

function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!id) {
    id = `nexusarc-${crypto.randomUUID()}`;
    window.localStorage.setItem(USER_ID_STORAGE_KEY, id);
  }
  return id;
}

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<WalletSession | null>(null);

  const renew = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const userId = getOrCreateUserId();
      const res = await fetch("/api/wallet/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Session request failed (${res.status})`);
      }
      const next: WalletSession = {
        userId: data.userId,
        userToken: data.userToken,
        encryptionKey: data.encryptionKey,
        issuedAt: data.issuedAt,
        expiresInSeconds: data.expiresInSeconds,
        network: data.network ?? "Arc Testnet (Circle Sandbox)",
      };
      sessionRef.current = next;
      setSession(next);
      setStatus("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStatus("error");
      sessionRef.current = null;
      setSession(null);
    }
  }, []);

  useEffect(() => {
    void renew();
  }, [renew]);

  const authedFetch = useCallback<WalletSessionContextValue["authedFetch"]>(
    async (input, init = {}) => {
      const current = sessionRef.current;
      if (!current) {
        setStatus("expired");
        throw new Error("No active wallet session.");
      }
      const headers = new Headers(init.headers ?? {});
      headers.set(USER_TOKEN_HEADER, current.userToken);
      const res = await fetch(input, { ...init, headers });
      if (res.status === 401) {
        // Mark expired so UI prompts user to renew. Don't auto-renew silently —
        // user explicitly requested visible "Session Expired" handling.
        sessionRef.current = null;
        setSession(null);
        setStatus("expired");
        let errMsg = "Session expired. Please renew your wallet session.";
        try {
          const body = await res.clone().json();
          if (body?.error) errMsg = body.error;
        } catch {
          /* ignore parse failures */
        }
        setError(errMsg);
      }
      return res;
    },
    [],
  );

  const value = useMemo<WalletSessionContextValue>(
    () => ({ session, status, error, renew, authedFetch }),
    [session, status, error, renew, authedFetch],
  );

  return (
    <WalletSessionContext.Provider value={value}>
      {children}
    </WalletSessionContext.Provider>
  );
}

export function useWalletSession(): WalletSessionContextValue {
  const ctx = useContext(WalletSessionContext);
  if (!ctx) {
    throw new Error(
      "useWalletSession must be used inside <WalletSessionProvider>.",
    );
  }
  return ctx;
}
