import React from 'react';

/**
 * RiskBadge Component
 * Renders tactical risk level badges (Critical, High, Medium, Low, Needs Human Review)
 * with clear text labels and Google Stitch status colors from DESIGN.md.
 */
export default function RiskBadge({ severity, score, className = "", size = "md" }) {
  const norm = (severity || "").toLowerCase().trim();

  let styleConfig = {
    bg: "bg-slate-800/60",
    text: "text-slate-300",
    border: "border-slate-700/50",
    dot: "bg-slate-400",
    label: severity || "Unknown"
  };

  if (norm.includes("crit") || norm === "critical") {
    styleConfig = {
      bg: "bg-red-500/15",
      text: "text-red-400",
      border: "border-red-500/40",
      dot: "bg-red-500",
      label: "Critical"
    };
  } else if (norm.includes("high") || norm === "high") {
    styleConfig = {
      bg: "bg-amber-500/15",
      text: "text-amber-300",
      border: "border-amber-500/40",
      dot: "bg-amber-400",
      label: "High"
    };
  } else if (norm.includes("med") || norm === "medium") {
    styleConfig = {
      bg: "bg-yellow-500/15",
      text: "text-yellow-300",
      border: "border-yellow-500/40",
      dot: "bg-yellow-400",
      label: "Medium"
    };
  } else if (norm.includes("low") || norm === "low") {
    styleConfig = {
      bg: "bg-emerald-500/15",
      text: "text-emerald-300",
      border: "border-emerald-500/40",
      dot: "bg-emerald-400",
      label: "Low"
    };
  } else if (norm.includes("review") || norm.includes("human")) {
    styleConfig = {
      bg: "bg-cyan-500/15",
      text: "text-cyan-300",
      border: "border-cyan-500/40",
      dot: "bg-cyan-400",
      label: "Needs Review"
    };
  }

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[10px]"
    : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold tracking-wide uppercase border ${styleConfig.bg} ${styleConfig.text} ${styleConfig.border} ${sizeClasses} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styleConfig.dot}`} />
      <span>{styleConfig.label}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-80 pl-0.5 font-normal">({score})</span>
      )}
    </span>
  );
}
