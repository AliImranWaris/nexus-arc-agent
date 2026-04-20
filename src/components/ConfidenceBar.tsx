"use client";

interface ConfidenceBarProps {
  score: number; // 0–100
}

function scoreToColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function scoreToLabel(score: number): string {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

export default function ConfidenceBar({ score }: ConfidenceBarProps) {
  const color = scoreToColor(score);
  const label = scoreToLabel(score);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Confidence</span>
        <span className="text-xs font-semibold text-slate-300">
          {score}%{" "}
          <span
            className={`font-normal ${
              score >= 80
                ? "text-emerald-400"
                : score >= 60
                ? "text-amber-400"
                : "text-rose-400"
            }`}
          >
            ({label})
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
