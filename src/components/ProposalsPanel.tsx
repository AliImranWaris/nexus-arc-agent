"use client";

import { useState } from "react";
import { DEMO_PROPOSALS, PROPOSAL_TYPE_META, type Proposal } from "@/lib/proposals";
import ConfidenceBar from "./ConfidenceBar";

export interface PrefillData {
  destinationAddress: string;
  amount: string;
}

interface ProposalsPanelProps {
  onPropose: (data: PrefillData) => void;
}

export default function ProposalsPanel({ onPropose }: ProposalsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(DEMO_PROPOSALS[0].id);
  const [proposedId, setProposedId] = useState<string | null>(null);

  function handlePropose(proposal: Proposal) {
    setProposedId(proposal.id);
    onPropose({
      destinationAddress: proposal.destinationAddress,
      amount: proposal.amount,
    });
    // Scroll to the transfer form smoothly
    document.getElementById("transfer-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Transaction Proposals</h2>
            {/* Clearly marked demo badge */}
            <span className="rounded-full border border-amber-600/50 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
              Simulated Demo
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            AI-generated suggestions based on simulated Arc testnet data.{" "}
            <span className="text-slate-500">You review and approve every transfer.</span>
          </p>
        </div>
      </div>

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
        {DEMO_PROPOSALS.map((proposal) => {
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
              {/* Card header — always visible */}
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-3"
                onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
              >
                {/* Type badge */}
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

                {/* Score pill */}
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

                {/* Chevron */}
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

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-slate-700/60 px-4 pt-4 pb-4 space-y-4">
                  {/* Rationale */}
                  <p className="text-sm text-slate-400 leading-relaxed">{proposal.rationale}</p>

                  {/* Confidence bar */}
                  <ConfidenceBar score={proposal.confidenceScore} />

                  {/* Detail grid */}
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

                  {/* Propose button */}
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
