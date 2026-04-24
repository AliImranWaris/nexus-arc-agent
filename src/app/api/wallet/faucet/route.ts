import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";
import { requireUserToken, sessionErrorResponse } from "@/lib/sessionAuth";
import { MOCK_USER_TOKEN } from "@/lib/mockWallets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FaucetRequestBody {
  walletId?: string;
  address?: string;
  blockchain?: string;
  native?: boolean;
  usdc?: boolean;
  eurc?: boolean;
}

/** Build a Circle web-faucet URL pre-filled with the recipient address. */
function buildExternalFaucetUrl(address: string, blockchain: string): string {
  // Circle's hosted faucet accepts the chain + address as query params.
  const chainParam = blockchain.replace("-TESTNET", "").toLowerCase();
  return `https://faucet.circle.com/?chain=${encodeURIComponent(chainParam)}&address=${encodeURIComponent(address)}`;
}

/**
 * POST /api/wallet/faucet
 *
 * Drips testnet tokens via Circle's requestTestnetTokens endpoint.
 * Defaults: ARC-TESTNET, USDC + native gas.
 *
 * If the API key lacks faucet entitlement (403), the route degrades
 * gracefully and returns the wallet address plus a pre-filled Circle
 * web-faucet URL so the caller can fund manually without losing the
 * demo flow.
 */
export async function POST(req: NextRequest) {
  const tokenOrError = requireUserToken(req);
  if (tokenOrError instanceof NextResponse) return tokenOrError;
  const { userToken } = tokenOrError;

  let resolvedAddress = "";
  let resolvedBlockchain = "";
  try {
    const body: FaucetRequestBody = await req.json().catch(() => ({}));
    const blockchain = body.blockchain ?? "ARC-TESTNET";
    resolvedBlockchain = blockchain;
    const usdc = body.usdc ?? true;
    const native = body.native ?? true;
    const eurc = body.eurc ?? false;

    if (!blockchain.includes("TESTNET") && !blockchain.includes("SEPOLIA") && !blockchain.includes("AMOY") && !blockchain.includes("FUJI") && !blockchain.includes("DEVNET")) {
      return NextResponse.json(
        { error: `Refusing faucet request on non-testnet blockchain "${blockchain}".` },
        { status: 400 },
      );
    }

    if (userToken === MOCK_USER_TOKEN) {
      return NextResponse.json({
        success: true,
        mock: true,
        message:
          "Mock mode: real testnet tokens cannot be requested. Add a valid CIRCLE_API_KEY to enable the faucet.",
      });
    }

    const client = getCircleClient();

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
    resolvedAddress = address;

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
    const status = (err as { status?: number; response?: { status?: number } })
      ?.status ?? (err as { response?: { status?: number } })?.response?.status;

    const isForbidden =
      status === 403 ||
      /forbidden|not authorized|insufficient|permission/i.test(message);

    if (isForbidden && resolvedAddress) {
      return NextResponse.json({
        success: false,
        requiresExternalFaucet: true,
        reason: "FORBIDDEN",
        address: resolvedAddress,
        blockchain: resolvedBlockchain,
        externalFaucetUrl: buildExternalFaucetUrl(
          resolvedAddress,
          resolvedBlockchain,
        ),
        message:
          "Circle's API key doesn't have faucet entitlement (403 Forbidden). Use the hosted Circle Faucet (link below) or apply a demo balance to keep recording.",
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
