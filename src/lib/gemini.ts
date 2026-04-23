import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_PROPOSALS, type Proposal } from "./proposals";

export const GEMINI_MODEL = "gemini-2.5-flash";
export const FEATHERLESS_MODEL = "meta-llama/Meta-Llama-3-70B-Instruct";
export const FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1";

export type AiSource = "Gemini" | "Llama" | "None";

export interface AnalyzedProposal extends Proposal {
  aiInsight: string;
  aiSource: AiSource;
}

const SYSTEM_INSTRUCTION = `You are NexusArc, a cautious financial-reasoning assistant for a programmable
wallet demo on a testnet. You analyze candidate transaction proposals and return
a brief plain-text rationale explaining the opportunity, the main risk, and
whether the user should review carefully. Keep responses under 280 characters.
Never include code, JSON, or markdown formatting in your reply.`;

function buildPrompt(proposal: Proposal): string {
  return `${SYSTEM_INSTRUCTION}

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
}

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

async function analyzeWithGemini(proposal: Proposal): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(buildPrompt(proposal));
  return result.response.text().trim();
}

async function analyzeWithFeatherless(proposal: Proposal): Promise<string> {
  const apiKey = process.env.FEATHERLESS_API_KEY;
  if (!apiKey) {
    throw new Error("FEATHERLESS_API_KEY is not configured.");
  }

  const res = await fetch(`${FEATHERLESS_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: FEATHERLESS_MODEL,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: buildPrompt(proposal) },
      ],
      max_tokens: 200,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Featherless ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Featherless returned an empty response.");
  }
  return text.trim();
}

async function analyzeOne(proposal: Proposal): Promise<AnalyzedProposal> {
  try {
    const insight = await analyzeWithGemini(proposal);
    return { ...proposal, aiInsight: insight, aiSource: "Gemini" };
  } catch (geminiErr) {
    const geminiMsg =
      geminiErr instanceof Error ? geminiErr.message : "Unknown Gemini error";
    try {
      const insight = await analyzeWithFeatherless(proposal);
      return { ...proposal, aiInsight: insight, aiSource: "Llama" };
    } catch (featherErr) {
      const featherMsg =
        featherErr instanceof Error
          ? featherErr.message
          : "Unknown Featherless error";
      return {
        ...proposal,
        aiInsight: `AI analysis unavailable. Gemini: ${geminiMsg}. Featherless: ${featherMsg}.`,
        aiSource: "None",
      };
    }
  }
}

export async function analyzeProposalsWithGemini(
  proposals: Proposal[] = DEMO_PROPOSALS,
): Promise<AnalyzedProposal[]> {
  return Promise.all(proposals.map(analyzeOne));
}
