"use client";

import { useEffect, useState } from "react";
import { DEMO_PROPOSALS, PROPOSAL_TYPE_META, type Proposal } from "@/lib/proposals";
import ConfidenceBar from "./ConfidenceBar";

export interface PrefillData {
  destinationAddress: string;
  amount: string;
}

interface ProposalsPanelProps {
  onPropose: (data: PrefillData) => void;
}

type AiSource = "Gemini" | "Llama" | "None";

interface AnalyzedProposal extends Proposal {
  aiInsight?: string;
  aiSource?: AiSource;
}

type AiStatus = "idle" | "analyzing" | "ready" | "error";

export default function ProposalsPanel({ onPropose }: ProposalsPanelProps) {
  const [proposals, setProposals] = useState<AnalyzedProposal[]>(DEMO_PROPOSALS);
  const [expandedId, setExpandedId] = useState<string | null>(DEMO_PROPOSALS[0].id);
  const [proposedId, setProposedId] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const [primaryModel, setPrimaryModel] = useState<string | null>(null);
  const [fallbackModel, setFallbackModel] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  async function loadAnalysis() {
    setAiStatus("analyzing");
    setAiError(null);
    try {
      const res = await fetch("/api/proposals/analyze", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setProposals(data.proposals as AnalyzedProposal[]);
      setPrimaryModel(data.primaryModel ?? null);
      setFallbackModel(data.fallbackModel ?? null);
      setAiStatus("ready");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Unknown error");
      setAiStatus("error");
    }
  }

  useEffect(() => {
    loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePropose(proposal: Proposal) {
    setProposedId(proposal.id);
    onPropose({
      destinationAddress: proposal.destinationAddress,
      amount: proposal.amount,
    });
    document.getElementById("transfer-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const statusBadge = (() => {
    switch (aiStatus) {
      case "analyzing":
        return {
          dot: "bg-cyan-400 animate-pulse",
          text: "text-cyan-300",
          border: "border-cyan-700/50",
          bg: "bg-cyan-950/40",
          label: "Hybrid AI · analyzing…",
        };
      case "ready":
        return {
          dot: "bg-emerald-400",
          text: "text-emerald-300",
          border: "border-emerald-700/50",
          bg: "bg-emerald-950/40",
          label: `Hybrid AI · ${primaryModel ?? "Gemini"} → ${fallbackModel?.split("/").pop() ?? "Llama"}`,
        };
      case "error":
        return {
          dot: "bg-rose-400",
          text: "text-rose-300",
          border: "border-rose-700/50",
          bg: "bg-rose-950/40",
          label: "Gemini analysis unavailable",
        };
      default:
        return {
          dot: "bg-slate-500",
          text: "text-slate-400",
          border: "border-slate-700/50",
          bg: "bg-slate-900/40",
          label: "Hybrid AI · idle",
        };
    }
  })();

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-2 gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-white">Transaction Proposals</h2>
            <span className="rounded-full border border-amber-600/50 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
              Simulated Demo
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${statusBadge.border} ${statusBadge.bg} ${statusBadge.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Suggestions reasoned over by{" "}
            <span className="text-cyan-300 font-medium">Gemini</span>, with{" "}
            <span className="text-amber-300 font-medium">Llama 3 70B</span> as automatic fallback.{" "}
            <span className="text-slate-500">You review and approve every transfer.</span>
          </p>
        </div>
        <button
          onClick={loadAnalysis}
          disabled={aiStatus === "analyzing"}
          className="shrink-0 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-600/60 hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {aiStatus === "analyzing" ? "Analyzing…" : "Re-analyze"}
        </button>
      </div>

      {aiStatus === "error" && aiError && (
        <div className="mb-3 mt-2 rounded-lg border border-rose-800/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
          Gemini analysis failed: {aiError}
        </div>
      )}

      {/* Safety notice */}
      <div className="mb-5 mt-3 flex items-start gap-2.5 rounded-lg border border-indigo-800/40 bg-indigo-950/30 px-3 py-2.5">
        <svg
          className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-xs text-indigo-300">
          No transaction is ever initiated automatically. Selecting "Propose" only pre-fills the
          form below — you must review, then sign via Circle's secure challenge flow to authorise.
        </p>
      </div>

      {/* Proposal list */}
      <div className="space-y-3">
        {proposals.map((proposal) => {
          const meta = PROPOSAL_TYPE_META[proposal.type];
          const isExpanded = expandedId === proposal.id;
          const isProposed = proposedId === proposal.id;

          return (
            <div
              key={proposal.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isProposed
                  ? "border-indigo-500/70 bg-indigo-950/40"
                  : proposal.isStale
                  ? "border-slate-700/50 bg-slate-900/30 opacity-60"
                  : "border-slate-700 bg-slate-900/40 hover:border-slate-600"
              }`}
            >
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-3"
                onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
              >
                <span
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.border} ${meta.color}`}
                >
                  {proposal.type}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200 truncate">{proposal.title}</p>
                    {proposal.isStale && (
                      <span className="shrink-0 text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
                        Stale
                      </span>
                    )}
                    {isProposed && (
                      <span className="shrink-0 text-xs text-indigo-400 border border-indigo-700/50 rounded px-1.5 py-0.5">
                        Proposed ↓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">{proposal.amount} USDC</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{proposal.estimatedReturn}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{proposal.timeWindow}</span>
                  </div>
                </div>

                <div
                  className={`shrink-0 text-xs font-bold rounded-full px-2.5 py-1 ${
                    proposal.confidenceScore >= 80
                      ? "bg-emerald-900/60 text-emerald-300"
                      : proposal.confidenceScore >= 60
                      ? "bg-amber-900/60 text-amber-300"
                      : "bg-rose-900/60 text-rose-300"
                  }`}
                >
                  {proposal.confidenceScore}%
                </div>

                <svg
                  className={`h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-700/60 px-4 pt-4 pb-4 space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed">{proposal.rationale}</p>

                  {/* Hybrid AI insight */}
                  {(() => {
                    const source = proposal.aiSource ?? "None";
                    const isLlama = source === "Llama";
                    const isGemini = source === "Gemini";
                    const wrapTone = isGemini
                      ? "border-cyan-800/40 bg-cyan-950/20"
                      : isLlama
                      ? "border-amber-800/40 bg-amber-950/20"
                      : "border-slate-700/60 bg-slate-900/40";
                    const labelTone = isGemini
                      ? "text-cyan-300"
                      : isLlama
                      ? "text-amber-300"
                      : "text-slate-400";
                    const bodyTone = isGemini
                      ? "text-cyan-100/90"
                      : isLlama
                      ? "text-amber-100/90"
                      : "text-slate-400";

                    return (
                      <div className={`rounded-lg border px-3 py-2.5 ${wrapTone}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <svg className={`h-3 w-3 ${labelTone}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l2.39 4.84L20 8.27l-4 3.9.95 5.53L12 15.1l-4.95 2.6L8 12.17l-4-3.9 5.61-.43z" />
                          </svg>
                          <span className={`text-[10px] font-semibold uppercase tracking-widest ${labelTone}`}>
                            AI Insight: {source === "None" ? "Unavailable" : source}
                          </span>
                          {isLlama && (
                            <span className="text-[9px] text-amber-400/70 italic">via Featherless fallback</span>
                          )}
                        </div>
                        {aiStatus === "analyzing" && !proposal.aiInsight ? (
                          <p className="text-xs text-cyan-300/70 italic">Analyzing this proposal…</p>
                        ) : proposal.aiInsight ? (
                          <p className={`text-xs leading-relaxed ${bodyTone}`}>{proposal.aiInsight}</p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No AI insight available yet.</p>
                        )}
                      </div>
                    );
                  })()}

                  <ConfidenceBar score={proposal.confidenceScore} />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "Amount", value: `${proposal.amount} USDC` },
                      { label: "Est. Return", value: proposal.estimatedReturn },
                      { label: "Window", value: proposal.timeWindow },
                      { label: "Destination", value: `${proposal.destinationAddress.slice(0, 8)}…` },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-slate-800/60 px-3 py-2">
                        <p className="text-slate-500 mb-0.5">{label}</p>
                        <p className="text-slate-200 font-mono font-medium">{value}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={proposal.isStale}
                    onClick={() => handlePropose(proposal)}
                    className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                      proposal.isStale
                        ? "border border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
                        : isProposed
                        ? "bg-indigo-700 text-indigo-200 focus:ring-indigo-500"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500"
                    }`}
                  >
                    {proposal.isStale
                      ? "Opportunity Expired"
                      : isProposed
                      ? "Pre-filled below — awaiting your signature"
                      : "Propose Transfer →"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
