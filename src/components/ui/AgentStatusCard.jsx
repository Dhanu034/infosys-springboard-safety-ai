import React from 'react';
import { Cpu, Terminal, Sparkles, ChevronRight, Activity } from 'lucide-react';
import BilingualLabel from './BilingualLabel';

/**
 * AgentStatusCard Component
 * Presentational HUD card displaying active AI agent telemetry,
 * pulse status indicator, model version, and XAI inspection action.
 */
export default function AgentStatusCard({
  agentName = "SiteRiskAgent-v2",
  agentRole = "Autonomous Hazard & Spatial Reasoning Engine",
  status = "Active & Monitoring",
  model = "OSHA-1926 + Multi-Factor Formula",
  lastEvaluationTime,
  onInspectReasoning,
  className = ""
}) {
  return (
    <div className={`glass-panel p-4 border-accent-cyan flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
          <Cpu className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-cyan-300">{agentName}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">{agentRole}</p>
          <p className="text-[10px] font-mono text-slate-400">
            Model: <span className="text-slate-300">{model}</span>
            {lastEvaluationTime && ` • Evaluated: ${lastEvaluationTime}`}
          </p>
        </div>
      </div>

      {onInspectReasoning && (
        <button
          onClick={onInspectReasoning}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
        >
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span>Inspect Reasoning</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
        </button>
      )}
    </div>
  );
}
