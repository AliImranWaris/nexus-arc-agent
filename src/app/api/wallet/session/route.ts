import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/wallet/session
 *
 * For each browser session we:
 *  1. Ensure a Circle user exists for the supplied userId (idempotent).
 *  2. Mint a fresh userToken + encryptionKey via createUserToken().
 *
 * No long-lived CIRCLE_USER_TOKEN is stored on the server.
 * Tokens are short-lived; clients re-call this endpoint to refresh.
 *
 * Because the configured CIRCLE_API_KEY is a TEST_API_KEY, all SDK calls
 * automatically route to Circle's sandbox/testnet (Arc Testnet) — the SDK
 * picks the environment from the key prefix, no extra endpoint config needed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body?.userId;

    if (!userId || typeof userId !== "string" || userId.length < 8) {
      return NextResponse.json(
        { error: "A valid userId is required to start a session." },
        { status: 400 },
      );
    }

    const client = getCircleClient();

    // Idempotent: if the user already exists Circle returns a 409-style error
    // we can safely swallow.
    try {
      await client.createUser({ userId });
    } catch (createErr) {
      const msg =
        createErr instanceof Error ? createErr.message.toLowerCase() : "";
      if (!msg.includes("already") && !msg.includes("exist")) {
        // Re-throw unexpected creation errors
        throw createErr;
      }
    }

    const tokenRes = await client.createUserToken({ userId });
    const userToken = tokenRes.data?.userToken;
    const encryptionKey = tokenRes.data?.encryptionKey;

    if (!userToken || !encryptionKey) {
      return NextResponse.json(
        { error: "Circle did not return a userToken/encryptionKey." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      userId,
      userToken,
      encryptionKey,
      // Circle user tokens are valid ~60 minutes; clients should refresh proactively.
      expiresInSeconds: 3300,
      issuedAt: new Date().toISOString(),
      network: "Arc Testnet (Circle Sandbox)",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
