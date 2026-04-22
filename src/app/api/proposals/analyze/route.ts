import { NextResponse } from "next/server";
import { analyzeProposalsWithGemini, GEMINI_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const proposals = await analyzeProposalsWithGemini();
    return NextResponse.json({
      model: GEMINI_MODEL,
      generatedAt: new Date().toISOString(),
      proposals,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message, model: GEMINI_MODEL },
      { status: 500 },
    );
  }
}
