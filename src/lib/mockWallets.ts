/**
 * Mock wallet data used as a temporary bypass when Circle credentials
 * are unavailable, so the dashboard UI and Gemini analysis remain testable.
 * Activated when the session endpoint cannot reach Circle.
 */

export const MOCK_USER_TOKEN = "MOCK_USER_TOKEN";
export const MOCK_ENCRYPTION_KEY = "MOCK_ENCRYPTION_KEY";

export interface MockWallet {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  usdcBalance: string;
  allBalances: { token: { symbol: string }; amount: string }[];
}

export const MOCK_WALLETS: MockWallet[] = [
  {
    id: "mock-wallet-arc-001",
    address: "0xA4b8C2D1eF35f7a9D6B4c81e9E5D0F1c2a3B4C5D",
    blockchain: "ARC-TESTNET",
    state: "LIVE",
    usdcBalance: "12.45",
    allBalances: [{ token: { symbol: "USDC" }, amount: "12.45" }],
  },
  {
    id: "mock-wallet-arc-002",
    address: "0xB5c9D3e2F46a8b0E7C5d92f0F6E1A2B3D4c5d6e7",
    blockchain: "ARC-TESTNET",
    state: "LIVE",
    usdcBalance: "3.78",
    allBalances: [{ token: { symbol: "USDC" }, amount: "3.78" }],
  },
];

export function totalMockUSDC(): string {
  return MOCK_WALLETS.reduce(
    (sum, w) => sum + parseFloat(w.usdcBalance),
    0,
  ).toFixed(2);
}
