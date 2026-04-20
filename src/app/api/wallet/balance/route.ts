import { NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";

/**
 * GET /api/wallet/balance
 *
 * Fetches token balances for the wallets belonging to the user token
 * stored in CIRCLE_USER_TOKEN. In a real app the user token would come
 * from your auth session, not an env var.
 */
export async function GET() {
  try {
    const client = getCircleClient();
    const userToken = process.env.CIRCLE_USER_TOKEN;

    if (!userToken) {
      return NextResponse.json(
        { error: "CIRCLE_USER_TOKEN is not configured." },
        { status: 500 }
      );
    }

    // List wallets owned by this user
    const walletsRes = await client.listWallets({ userToken });
    const wallets = walletsRes.data?.wallets ?? [];

    if (wallets.length === 0) {
      return NextResponse.json({ wallets: [], totalUSDC: "0.00" });
    }

    // Fetch token balances for each wallet
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        const balRes = await client.getWalletTokenBalance({
          userToken,
          walletId: wallet.id,
        });
        const balances = balRes.data?.tokenBalances ?? [];
        const usdcBalance =
          balances.find((b) => b.token?.symbol === "USDC")?.amount ?? "0";
        return {
          id: wallet.id,
          address: wallet.address,
          blockchain: wallet.blockchain,
          state: wallet.state,
          usdcBalance,
          allBalances: balances,
        };
      })
    );

    const totalUSDC = walletsWithBalances
      .reduce((sum, w) => sum + parseFloat(w.usdcBalance), 0)
      .toFixed(2);

    return NextResponse.json({ wallets: walletsWithBalances, totalUSDC });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
