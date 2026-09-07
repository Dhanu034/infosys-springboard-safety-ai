import React from 'react';
import { X, Cpu, CheckCircle2, ShieldAlert, Sparkles, Terminal, FileCode, Info } from 'lucide-react';
import RiskBadge from './ui/RiskBadge';
import BilingualLabel from './ui/BilingualLabel';

/**
 * AgentReasoningDrawer Component (Phase 3 Redesign)
 * Presentational XAI Decision Trace Drawer styled with Industrial Precision Glassmorphism.
 */
export default function AgentReasoningDrawer({ hazard, onClose }) {
  if (!hazard) return null;

  const hasReasoningTrace = hazard.reasoningTrace && hazard.reasoningTrace.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f10]/80 backdrop-blur-md flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#14181a] border-l border-cyan-500/30 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between blueprint-grid">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/90 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 glow-cyan">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <BilingualLabel
                    en="Site Risk Agent — XAI Decision Trace"
                    ta="முடிவு கண்காணிப்பு விளக்கம்"
                    enClassName="text-base font-bold text-slate-100 font-sans"
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Agent ID: SiteRiskAgent-Alpha (v1.2.0)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Hazard Context Card */}
          <div className="glass-panel p-4 border-accent-cyan mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {hazard.id}
              </span>
              <RiskBadge severity={hazard.severity} score={hazard.riskScore} />
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-1 font-sans">{hazard.title}</h4>
            <p className="text-xs text-slate-400 font-mono">{hazard.zoneName} • Source: {hazard.sensorSource}</p>
          </div>

          {/* Step-by-Step Agent Execution Pipeline */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Autonomous Reasoning Pipeline Steps
            </h4>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Demo Explanation
            </span>
          </div>

          {hasReasoningTrace ? (
            <div className="space-y-3 mb-6">
              {hazard.reasoningTrace.map((stepObj) => (
                <div
                  key={stepObj.step}
                  className="bg-[#101415]/90 p-4 rounded-xl border border-slate-800 relative pl-11"
                >
                  <div className="absolute left-3 top-4 h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
                    {stepObj.step}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 font-sans">{stepObj.phase}</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {stepObj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {stepObj.detail}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center mb-6">
              <p className="text-xs font-mono text-slate-400">
                Reasoning trace unavailable for this event.
              </p>
            </div>
          )}

          {/* Raw Agent Telemetry JSON Box */}
          <div className="glass-panel p-4 border border-slate-800 mb-4">
            <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Terminal className="h-4 w-4" /> Sensor Payload Dump
              </span>
              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">JSON Format</span>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 bg-[#0b0f10] p-3.5 rounded-lg overflow-x-auto border border-slate-800/90 leading-relaxed scrollbar-thin">
{JSON.stringify({
  agent_id: "SiteRiskAgent-Alpha",
  hazard_id: hazard.id,
  yolo_vision_detection: {
    class: hazard.yoloDetection?.class || "hazard_object",
    confidence_score: hazard.yoloDetection?.confidence || 0.92,
    bounding_box_coords: hazard.yoloDetection?.boundingBox || [120, 45, 210, 180],
    zone: hazard.zoneId || "ZONE-A"
  },
  multi_frame_confirmation: {
    consecutive_frames_detected: hazard.multiFrameConfirmation?.consecutiveFramesDetected || 4,
    required_threshold: 3,
    false_positive_filtered: true
  },
  risk_scoring_engine: {
    likelihood_P: hazard.likelihood,
    severity_I: hazard.severityRating || 4,
    exposure_E: hazard.exposure || 4,
    historical_freq_H: hazard.historicalFreq || 3,
    weighted_formula: "0.40*P + 0.30*S + 0.20*E + 0.10*H",
    multiplicative_formula: "(P x I x E) x EnvMultiplier",
    final_score: hazard.riskScore
  },
  regulatory_standard: "OSHA 1926 Subpart P & Subpart L",
  telemetry_type: "Simulated Vision & IoT Feed (Prototype)"
}, null, 2)}
            </pre>
          </div>

          {/* Decision Support Disclaimer */}
          <p className="text-[10px] font-mono text-slate-500 text-center">
            ⚠️ AI detections are decision-support signals and require safety supervisor verification.
          </p>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800/80 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 text-xs font-mono font-semibold hover:bg-slate-800 hover:border-slate-600 transition-colors"
          >
            Close Trace Visualizer
          </button>
        </div>

      </div>
    </div>
  );
}
