import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";
import { requireUserToken, sessionErrorResponse } from "@/lib/sessionAuth";
import { MOCK_USER_TOKEN } from "@/lib/mockWallets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FaucetRequestBody {
  walletId?: string;
  /** Override the address directly (rare; usually we look it up via walletId). */
  address?: string;
  blockchain?: string;
  native?: boolean;
  usdc?: boolean;
  eurc?: boolean;
}

/**
 * POST /api/wallet/faucet
 *
 * Drips testnet tokens to the given wallet via Circle's
 * requestTestnetTokens endpoint. Defaults to USDC + native gas on
 * ARC-TESTNET so a fresh wallet can immediately sign and settle a
 * transfer.
 */
export async function POST(req: NextRequest) {
  const tokenOrError = requireUserToken(req);
  if (tokenOrError instanceof NextResponse) return tokenOrError;
  const { userToken } = tokenOrError;

  try {
    const body: FaucetRequestBody = await req.json().catch(() => ({}));
    const blockchain = body.blockchain ?? "ARC-TESTNET";
    const usdc = body.usdc ?? true;
    const native = body.native ?? true;
    const eurc = body.eurc ?? false;

    if (userToken === MOCK_USER_TOKEN) {
      return NextResponse.json({
        success: true,
        mock: true,
        message:
          "Mock mode: real testnet tokens cannot be requested. Add a valid CIRCLE_API_KEY to enable the faucet.",
      });
    }

    const client = getCircleClient();

    // Resolve wallet address if only the id was provided
    let address = body.address;
    if (!address) {
      if (!body.walletId) {
        return NextResponse.json(
          { error: "walletId or address is required." },
          { status: 400 },
        );
      }
      const w = await client.getWallet({ userToken, id: body.walletId });
      address = w.data?.wallet?.address;
      if (!address) {
        return NextResponse.json(
          { error: `Wallet ${body.walletId} not found.` },
          { status: 404 },
        );
      }
    }

    const res = await client.requestTestnetTokens({
      address,
      blockchain: blockchain as never,
      native,
      usdc,
      eurc,
    });

    return NextResponse.json({
      success: true,
      blockchain,
      address,
      requested: { native, usdc, eurc },
      data: res.data ?? null,
      message: `Faucet drip requested for ${address.slice(0, 6)}…${address.slice(-4)} on ${blockchain}. Funds typically arrive within ~30 seconds.`,
    });
  } catch (err) {
    const sessionFail = sessionErrorResponse(err);
    if (sessionFail) return sessionFail;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
