import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";
import { requireUserToken, sessionErrorResponse } from "@/lib/sessionAuth";
import { MOCK_USER_TOKEN } from "@/lib/mockWallets";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/wallet/initialize
 *
 * Provisions a wallet for the current user on Arc Testnet.
 *
 * - First-time users (PIN not yet set) → createUserPinWithWallets,
 *   so the user's first PIN is set in the same challenge that
 *   provisions their first wallet.
 * - Existing users → createWallet for an additional wallet.
 *
 * Either way, Circle returns a challengeId that the browser must
 * execute via the Web SDK so the user can enter their PIN.
 */
export async function POST(req: NextRequest) {
  const tokenOrError = requireUserToken(req);
  if (tokenOrError instanceof NextResponse) return tokenOrError;
  const { userToken } = tokenOrError;

  if (userToken === MOCK_USER_TOKEN) {
    return NextResponse.json({
      challengeId: `mock-init-challenge-${uuidv4()}`,
      mock: true,
      message:
        "Mock mode: cannot provision a real Circle wallet. Add a valid CIRCLE_API_KEY to enable on-chain wallet creation.",
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const blockchain: string = body?.blockchain ?? "ARC-TESTNET";

    const client = getCircleClient();

    // Inspect user state to decide which call to make
    let pinAlreadySet = false;
    try {
      const status = await client.getUserStatus({ userToken });
      const pinStatus = status.data?.pinStatus;
      pinAlreadySet = pinStatus === "ENABLED";
    } catch {
      // If we can't read status, default to first-time setup
      pinAlreadySet = false;
    }

    const idempotencyKey = uuidv4();
    let challengeId: string | undefined;
    let flow: "pin+wallet" | "wallet-only";

    if (pinAlreadySet) {
      flow = "wallet-only";
      const res = await client.createWallet({
        userToken,
        blockchains: [blockchain] as never,
        accountType: "SCA",
        idempotencyKey,
      });
      challengeId = res.data?.challengeId;
    } else {
      flow = "pin+wallet";
      const res = await client.createUserPinWithWallets({
        userToken,
        blockchains: [blockchain] as never,
        accountType: "SCA",
        idempotencyKey,
      });
      challengeId = res.data?.challengeId;
    }

    if (!challengeId) {
      throw new Error("Circle did not return a challengeId for wallet creation.");
    }

    return NextResponse.json({
      challengeId,
      blockchain,
      flow,
      message:
        flow === "pin+wallet"
          ? "Challenge created. Set your Circle PIN in the popup — your first Arc Testnet wallet will be provisioned in the same step."
          : "Challenge created. Enter your Circle PIN in the popup to provision a new wallet on Arc Testnet.",
    });
  } catch (err) {
    const sessionFail = sessionErrorResponse(err);
    if (sessionFail) return sessionFail;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
