import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";
import { v4 as uuidv4 } from "uuid";

export interface TransferRequestBody {
  sourceWalletId: string;
  destinationAddress: string;
  /** USDC amount as a string e.g. "0.01" */
  amount: string;
}

/**
 * POST /api/wallet/transfer
 *
 * Initiates a USDC transfer on the testnet.
 * The Circle SDK returns a challenge ID — the client must pass this to
 * Circle's Web3 Services PIN/biometric flow before the transaction settles.
 * This keeps the private key exclusively in the user's device (self-custody).
 */
export async function POST(req: NextRequest) {
  try {
    const body: TransferRequestBody = await req.json();
    const { sourceWalletId, destinationAddress, amount } = body;

    if (!sourceWalletId || !destinationAddress || !amount) {
      return NextResponse.json(
        { error: "sourceWalletId, destinationAddress, and amount are required." },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10) {
      return NextResponse.json(
        { error: "Amount must be a positive number no greater than 10 USDC." },
        { status: 400 }
      );
    }

    const client = getCircleClient();
    const userToken = process.env.CIRCLE_USER_TOKEN;
    const encryptionKey = process.env.CIRCLE_ENCRYPTION_KEY;

    if (!userToken || !encryptionKey) {
      return NextResponse.json(
        { error: "Server wallet credentials are not configured." },
        { status: 500 }
      );
    }

    const transferRes = await client.createTransaction({
      userToken,
      idempotencyKey: uuidv4(),
      walletId: sourceWalletId,
      destinationAddress,
      // USDC token contract address on the testnet
      tokenId: "5797fbd6-3795-519d-84ca-ec4c5f80c3b1",
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
      message:
        "Challenge created. Complete the PIN/biometric step in your wallet app to authorise and settle this transaction.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
