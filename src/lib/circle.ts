import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

/**
 * Returns a Circle SDK client authenticated with the server-side API key.
 * Call this only from API routes — never expose CIRCLE_API_KEY to the browser.
 */
export function getCircleClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error("CIRCLE_API_KEY is not set in environment variables.");
  }
  return initiateUserControlledWalletsClient({ apiKey });
}
