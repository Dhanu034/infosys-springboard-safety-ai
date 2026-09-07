import React from 'react';
import BilingualLabel from './BilingualLabel';

/**
 * MetricCard Component
 * Command-center telemetry card with 4px left-border hazard accent,
 * typography hierarchy (Inter + JetBrains Mono), and optional bilingual caption.
 */
export default function MetricCard({
  title,
  titleTa,
  value,
  unit = "",
  change,
  changePositive,
  icon: Icon,
  accent = "cyan", // cyan, orange, red, green, default
  subtext,
  className = ""
}) {
  const accentClasses = {
    cyan: "border-accent-cyan",
    orange: "border-accent-high",
    red: "border-accent-critical",
    green: "border-accent-low",
    default: ""
  }[accent] || "";

  const iconColors = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    orange: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    red: "text-red-400 bg-red-500/10 border-red-500/30",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    default: "text-slate-400 bg-slate-800 border-slate-700"
  }[accent] || "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";

  return (
    <div className={`glass-panel p-5 transition-all glass-panel-hover flex flex-col justify-between ${accentClasses} ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-0.5">
          <BilingualLabel
            en={title}
            ta={titleTa}
            enClassName="text-xs font-semibold text-slate-300 uppercase tracking-wider"
          />
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg border shrink-0 ${iconColors}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-slate-100">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-slate-400">{unit}</span>
        )}
      </div>

      {(change || subtext) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          {subtext && (
            <span className="text-slate-400 truncate">{subtext}</span>
          )}
          {change && (
            <span className={`font-bold ml-auto ${changePositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
