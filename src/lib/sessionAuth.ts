import { NextRequest, NextResponse } from "next/server";

/** Header used to forward the per-session Circle user token to API routes. */
export const USER_TOKEN_HEADER = "x-circle-user-token";

export interface ExtractedToken {
  userToken: string;
}

/**
 * Pull the per-request userToken from a custom header.
 * Returns either { userToken } or a 401 NextResponse with SESSION_EXPIRED code.
 */
export function requireUserToken(
  req: NextRequest,
): ExtractedToken | NextResponse {
  const userToken = req.headers.get(USER_TOKEN_HEADER);
  if (!userToken) {
    return NextResponse.json(
      {
        error: "Session expired. Please renew your wallet session.",
        code: "SESSION_EXPIRED",
      },
      { status: 401 },
    );
  }
  return { userToken };
}

/**
 * Inspect a Circle SDK error and decide whether the underlying user token
 * looks expired/invalid. Returns a 401 SESSION_EXPIRED response if so,
 * otherwise null (caller should bubble the original error).
 */
export function sessionErrorResponse(err: unknown): NextResponse | null {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const lower = message.toLowerCase();
  const looksExpired =
    lower.includes("unauthor") ||
    lower.includes("invalid token") ||
    lower.includes("expired") ||
    lower.includes("401");

  if (!looksExpired) return null;
  return NextResponse.json(
    {
      error: "Session expired. Please renew your wallet session.",
      code: "SESSION_EXPIRED",
    },
    { status: 401 },
  );
}
