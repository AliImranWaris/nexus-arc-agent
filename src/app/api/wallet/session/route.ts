import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";
import { MOCK_USER_TOKEN, MOCK_ENCRYPTION_KEY } from "@/lib/mockWallets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/wallet/session
 *
 * 1. Calls createUser (idempotent) + createUserToken to mint a fresh
 *    { userToken, encryptionKey } pair for this browser session.
 * 2. No entitySecret is required or sent — this is a User-Controlled
 *    Wallet flow; signing happens on the user's device.
 * 3. If Circle rejects the credentials, falls back to a mock session
 *    so the dashboard UI and Gemini analysis remain demonstrable.
 */
export async function POST(req: NextRequest) {
  let userId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    userId = body?.userId;

    if (!userId || typeof userId !== "string" || userId.length < 8) {
      return NextResponse.json(
        { error: "A valid userId is required to start a session." },
        { status: 400 },
      );
    }

    const client = getCircleClient();

    try {
      await client.createUser({ userId });
    } catch (createErr) {
      const msg =
        createErr instanceof Error ? createErr.message.toLowerCase() : "";
      if (!msg.includes("already") && !msg.includes("exist")) {
        throw createErr;
      }
    }

    const tokenRes = await client.createUserToken({ userId });
    const userToken = tokenRes.data?.userToken;
    const encryptionKey = tokenRes.data?.encryptionKey;

    if (!userToken || !encryptionKey) {
      throw new Error("Circle did not return a userToken/encryptionKey.");
    }

    return NextResponse.json({
      userId,
      userToken,
      encryptionKey,
      expiresInSeconds: 3300,
      issuedAt: new Date().toISOString(),
      network: "Arc Testnet (Circle Sandbox)",
      mock: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Mock fallback so the rest of the dashboard remains usable.
    return NextResponse.json({
      userId: userId ?? "mock-user",
      userToken: MOCK_USER_TOKEN,
      encryptionKey: MOCK_ENCRYPTION_KEY,
      expiresInSeconds: 3300,
      issuedAt: new Date().toISOString(),
      network: "Arc Testnet (Mock Mode)",
      mock: true,
      mockReason: message,
    });
  }
}
