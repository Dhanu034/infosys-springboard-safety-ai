import React from 'react';

/**
 * StatusPill Component
 * Renders status pills for workflows (Open, Acknowledged, Resolved, Logged, Not Configured, etc.)
 * adhering to DESIGN.md pill radius (9999px) and semantic color mappings.
 */
export default function StatusPill({ status, channel, className = "" }) {
  const norm = (status || "").toLowerCase().trim();

  let style = "bg-slate-800/80 text-slate-300 border-slate-700/60";

  if (norm === "open") {
    style = "bg-red-500/15 text-red-300 border-red-500/40";
  } else if (norm === "acknowledged") {
    style = "bg-amber-500/15 text-amber-300 border-amber-500/40";
  } else if (norm === "resolved") {
    style = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  } else if (norm === "supervisor notified") {
    style = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  } else if (norm === "logged") {
    style = "bg-cyan-500/15 text-cyan-300 border-cyan-500/40";
  } else if (norm === "urgent review required") {
    style = "bg-orange-500/15 text-orange-300 border-orange-500/40";
  } else if (norm === "failed") {
    style = "bg-red-500/20 text-red-300 border-red-500/40";
  } else if (norm === "not required" || norm === "not configured") {
    style = "bg-slate-800/50 text-slate-400 border-slate-700/40";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${style} ${className}`}>
      <span>{status || "Unknown"}</span>
      {channel && channel !== "None" && (
        <span className="opacity-75 font-normal">[{channel}]</span>
      )}
    </span>
  );
}
