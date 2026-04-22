import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_PROPOSALS, type Proposal } from "./proposals";

export const GEMINI_MODEL = "gemini-2.5-flash";

let cachedClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Add it to your Replit Secrets.",
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(apiKey);
  }
  return cachedClient;
}

export function getGeminiModel() {
  return getClient().getGenerativeModel({ model: GEMINI_MODEL });
}

export interface AnalyzedProposal extends Proposal {
  aiInsight: string;
}

const SYSTEM_INSTRUCTION = `You are NexusArc, a cautious financial-reasoning assistant for a programmable
wallet demo on a testnet. You analyze candidate transaction proposals and return
a brief plain-text rationale explaining the opportunity, the main risk, and
whether the user should review carefully. Keep responses under 280 characters.
Never include code, JSON, or markdown formatting in your reply.`;

export async function analyzeProposalsWithGemini(
  proposals: Proposal[] = DEMO_PROPOSALS,
): Promise<AnalyzedProposal[]> {
  const model = getGeminiModel();

  const results = await Promise.all(
    proposals.map(async (proposal) => {
      const prompt = `${SYSTEM_INSTRUCTION}

Proposal:
- Type: ${proposal.type}
- Title: ${proposal.title}
- Amount: ${proposal.amount} USDC
- Estimated return: ${proposal.estimatedReturn}
- Time window: ${proposal.timeWindow}
- Confidence: ${proposal.confidenceScore}/100
- Stale: ${proposal.isStale ? "yes" : "no"}
- Context: ${proposal.rationale}

Provide your concise analyst note now.`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return { ...proposal, aiInsight: text };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return {
          ...proposal,
          aiInsight: `Gemini analysis unavailable (${message}).`,
        };
      }
    }),
  );

  return results;
}
