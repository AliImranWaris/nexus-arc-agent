/**
 * Simulated proposal data for hackathon demo purposes.
 * In a real app these would come from on-chain data, price feeds, or
 * a backend analysis service. These are clearly labelled as demo/simulated.
 */

export type ProposalType = "Liquidity" | "Rebalance" | "Yield" | "Spread";

export interface Proposal {
  id: string;
  type: ProposalType;
  title: string;
  rationale: string;
  amount: string; // USDC string, e.g. "0.005"
  destinationAddress: string;
  confidenceScore: number; // 0–100
  estimatedReturn: string; // e.g. "+0.12%"
  timeWindow: string; // e.g. "~4 min"
  isStale: boolean;
}

export const DEMO_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    type: "Liquidity",
    title: "Arc Pool Liquidity Top-Up",
    rationale:
      "Simulated depth imbalance detected in the USDC/ARC testnet pool. Small injection may improve fill rates for pending orders.",
    amount: "0.01",
    destinationAddress: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    confidenceScore: 87,
    estimatedReturn: "+0.18%",
    timeWindow: "~3 min",
    isStale: false,
  },
  {
    id: "prop-002",
    type: "Rebalance",
    title: "Cross-Wallet Rebalance",
    rationale:
      "Simulated portfolio drift of 2.3% from target allocation. Micro-transfer to secondary wallet restores balance.",
    amount: "0.005",
    destinationAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    confidenceScore: 73,
    estimatedReturn: "Neutral",
    timeWindow: "~1 min",
    isStale: false,
  },
  {
    id: "prop-003",
    type: "Yield",
    title: "Testnet Yield Position Entry",
    rationale:
      "Simulated yield contract on Arc testnet offering 4.2% APY for USDC deposits above 0.001. Window is limited.",
    amount: "0.008",
    destinationAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    confidenceScore: 61,
    estimatedReturn: "+4.20% APY",
    timeWindow: "~12 min",
    isStale: false,
  },
  {
    id: "prop-004",
    type: "Spread",
    title: "Bid-Ask Spread Capture",
    rationale:
      "Simulated 0.09% spread arbitrage window between two testnet AMMs. Small positions limit slippage risk.",
    amount: "0.003",
    destinationAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    confidenceScore: 54,
    estimatedReturn: "+0.09%",
    timeWindow: "~7 min",
    isStale: true,
  },
];

export const PROPOSAL_TYPE_META: Record<
  ProposalType,
  { color: string; bg: string; border: string; dot: string }
> = {
  Liquidity: {
    color: "text-sky-300",
    bg: "bg-sky-950/50",
    border: "border-sky-700/50",
    dot: "bg-sky-400",
  },
  Rebalance: {
    color: "text-violet-300",
    bg: "bg-violet-950/50",
    border: "border-violet-700/50",
    dot: "bg-violet-400",
  },
  Yield: {
    color: "text-emerald-300",
    bg: "bg-emerald-950/50",
    border: "border-emerald-700/50",
    dot: "bg-emerald-400",
  },
  Spread: {
    color: "text-amber-300",
    bg: "bg-amber-950/50",
    border: "border-amber-700/50",
    dot: "bg-amber-400",
  },
};
