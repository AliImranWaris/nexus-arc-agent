import { NextResponse } from "next/server";
import {
  analyzeProposalsWithGemini,
  GEMINI_MODEL,
  FEATHERLESS_MODEL,
} from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const proposals = await analyzeProposalsWithGemini();
    return NextResponse.json({
      primaryModel: GEMINI_MODEL,
      fallbackModel: FEATHERLESS_MODEL,
      generatedAt: new Date().toISOString(),
      proposals,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: message,
        primaryModel: GEMINI_MODEL,
        fallbackModel: FEATHERLESS_MODEL,
      },
      { status: 500 },
    );
  }
}
