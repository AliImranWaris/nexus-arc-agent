import { NextRequest, NextResponse } from "next/server";
import { getCircleClient } from "@/lib/circle";
import { requireUserToken, sessionErrorResponse } from "@/lib/sessionAuth";
import { MOCK_USER_TOKEN, MOCK_WALLETS, totalMockUSDC } from "@/lib/mockWallets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tokenOrError = requireUserToken(req);
  if (tokenOrError instanceof NextResponse) return tokenOrError;
  const { userToken } = tokenOrError;

  if (userToken === MOCK_USER_TOKEN) {
    return NextResponse.json({
      wallets: MOCK_WALLETS,
      totalUSDC: totalMockUSDC(),
      mock: true,
    });
  }

  try {
    const client = getCircleClient();
    const walletsRes = await client.listWallets({ userToken });
    const wallets = walletsRes.data?.wallets ?? [];

    if (wallets.length === 0) {
      return NextResponse.json({ wallets: [], totalUSDC: "0.00" });
    }

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
      }),
    );

    const totalUSDC = walletsWithBalances
      .reduce((sum, w) => sum + parseFloat(w.usdcBalance), 0)
      .toFixed(2);

    return NextResponse.json({ wallets: walletsWithBalances, totalUSDC });
  } catch (err: unknown) {
    const sessionFail = sessionErrorResponse(err);
    if (sessionFail) return sessionFail;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
