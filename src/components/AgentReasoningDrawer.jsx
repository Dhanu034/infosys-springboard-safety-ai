import React from 'react';
import { X, Cpu, CheckCircle2, ShieldAlert, Sparkles, Terminal, FileCode } from 'lucide-react';

export default function AgentReasoningDrawer({ hazard, onClose }) {
  if (!hazard) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">Site Risk Agent — XAI Decision Trace</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Agent ID: SiteRiskAgent-Alpha (v1.2.0)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Hazard Context Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-bold">{hazard.id}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                Score: {hazard.riskScore}/100 ({hazard.severity})
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-1">{hazard.title}</h4>
            <p className="text-xs text-slate-400">{hazard.zoneName} • {hazard.sensorSource}</p>
          </div>

          {/* Step-by-Step Agent Execution Pipeline */}
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Autonomous Reasoning Pipeline Steps
          </h4>

          <div className="space-y-3 mb-6">
            {hazard.reasoningTrace?.map((stepObj) => (
              <div
                key={stepObj.step}
                className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 relative pl-10"
              >
                <div className="absolute left-3 top-4 h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center">
                  {stepObj.step}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">{stepObj.phase}</span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {stepObj.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {stepObj.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Raw Agent Telemetry JSON Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-cyan-400" /> Sensor Payload Dump
              </span>
              <span>JSON Payload</span>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-800/80">
{JSON.stringify({
  agent_id: "SiteRiskAgent-Alpha",
  hazard_id: hazard.id,
  likelihood: hazard.likelihood,
  severity_rating: hazard.severityRating || 4,
  exposure_index: hazard.exposure || 4,
  environmental_multiplier: 1.15,
  calculated_score: hazard.riskScore,
  osha_matched_standard: "OSHA 1926 Subpart P",
  confidence_rating: 0.946
}, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Close Trace Visualizer
          </button>
        </div>

      </div>
    </div>
  );
}
