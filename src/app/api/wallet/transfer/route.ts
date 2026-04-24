import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";
import { requireUserToken, sessionErrorResponse } from "@/lib/sessionAuth";
import { MOCK_USER_TOKEN } from "@/lib/mockWallets";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface TransferRequestBody {
  sourceWalletId: string;
  destinationAddress: string;
  /** USDC amount as a string e.g. "0.01" */
  amount: string;
}

/**
 * POST /api/wallet/transfer
 *
 * Initiates a USDC transfer on the source wallet's blockchain
 * (typically Arc Testnet via TEST_API_KEY). The USDC tokenId is
 * resolved from the wallet's own token balances at request time, so
 * the wallet and token are always on the same chain — no
 * "blockchain mismatch" possible. The Circle SDK returns a
 * challengeId — the client must complete it via Circle's PIN/biometric
 * flow before settlement. No private key ever leaves the user's device.
 */
export async function POST(req: NextRequest) {
  const tokenOrError = requireUserToken(req);
  if (tokenOrError instanceof NextResponse) return tokenOrError;
  const { userToken } = tokenOrError;

  try {
    const body: TransferRequestBody = await req.json();
    const { sourceWalletId, destinationAddress, amount } = body;

    if (!sourceWalletId || !destinationAddress || !amount) {
      return NextResponse.json(
        { error: "sourceWalletId, destinationAddress, and amount are required." },
        { status: 400 },
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10) {
      return NextResponse.json(
        { error: "Amount must be a positive number no greater than 10 USDC." },
        { status: 400 },
      );
    }

    if (userToken === MOCK_USER_TOKEN) {
      return NextResponse.json({
        success: true,
        challengeId: `mock-challenge-${uuidv4()}`,
        message:
          "Mock mode: a real Circle challenge would be created here. Add a valid CIRCLE_API_KEY to enable live signing on Arc Testnet.",
        mock: true,
      });
    }

    const client = getCircleClient();

    // Confirm the source wallet exists and capture its blockchain
    const walletRes = await client.getWallet({ userToken, id: sourceWalletId });
    const wallet = walletRes.data?.wallet;
    if (!wallet) {
      return NextResponse.json(
        { error: `Source wallet ${sourceWalletId} not found for this user.` },
        { status: 404 },
      );
    }

    // Resolve the USDC tokenId on the wallet's own chain
    const balRes = await client.getWalletTokenBalance({
      userToken,
      walletId: sourceWalletId,
    });
    const usdcEntry = (balRes.data?.tokenBalances ?? []).find(
      (b) => b.token?.symbol === "USDC",
    );
    const usdcTokenId = usdcEntry?.token?.id;

    if (!usdcTokenId) {
      return NextResponse.json(
        {
          error: `No USDC token found for wallet ${sourceWalletId} on ${wallet.blockchain}. Fund the wallet with testnet USDC before transferring.`,
        },
        { status: 400 },
      );
    }

    const transferRes = await client.createTransaction({
      userToken,
      idempotencyKey: uuidv4(),
      walletId: sourceWalletId,
      destinationAddress,
      tokenId: usdcTokenId,
      amounts: [amount],
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM",
        },
      },
    });

    const challengeId = transferRes.data?.challengeId;

    return NextResponse.json({
      success: true,
      challengeId,
      blockchain: wallet.blockchain,
      tokenId: usdcTokenId,
      message: `Challenge created on ${wallet.blockchain}. Complete the PIN/biometric step in your wallet app to authorise and settle this transaction.`,
    });
  } catch (err: unknown) {
    const sessionFail = sessionErrorResponse(err);
    if (sessionFail) return sessionFail;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
