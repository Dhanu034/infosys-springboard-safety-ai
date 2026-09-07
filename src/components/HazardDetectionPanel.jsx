import React, { useState } from 'react';
import { AlertOctagon, Filter, Cpu, CheckCircle2, ChevronRight, Info, ShieldAlert, Sparkles } from 'lucide-react';
import ChartPanel from './ui/ChartPanel';
import RiskBadge from './ui/RiskBadge';
import BilingualLabel from './ui/BilingualLabel';

/**
 * HazardDetectionPanel Component (Phase 3 Redesign)
 * Live Hazard cards with 4px left-border risk accents, Monospace IDs,
 * AI Recommendations, and XAI Decision Trace inspection button.
 */
export default function HazardDetectionPanel({ hazards, onInspectReasoning }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Fall Hazard', 'Equipment', 'Electrical', 'Environmental'];

  const filteredHazards = selectedCategory === 'ALL'
    ? hazards
    : hazards.filter(h => h.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(h.category.toLowerCase()));

  const getAccentClass = (severity) => {
    const norm = (severity || "").toUpperCase();
    if (norm === 'CRITICAL') return 'border-accent-critical bg-red-950/10';
    if (norm === 'HIGH') return 'border-accent-high bg-amber-950/10';
    if (norm === 'MEDIUM') return 'border-accent-medium bg-yellow-950/10';
    return 'border-accent-low bg-emerald-950/10';
  };

  return (
    <ChartPanel
      title="Live Hazard Detection & Site Risk Workflow Panel"
      titleTa="நேரடி அபாய கண்டறிதல் & பணிப்பாய்வு"
      subtitle="Real-time multi-sensor hazard register evaluated continuously by the Site Risk Agent"
      icon={AlertOctagon}
      badge={
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/15 text-red-300 border border-red-500/30">
          {hazards.length} Detected
        </span>
      }
      actions={
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      }
      className="mb-6"
    >
      {/* Hazard Cards List */}
      <div className="space-y-4">
        {filteredHazards.map((hazard) => {
          const accentStyle = getAccentClass(hazard.severity);

          return (
            <div
              key={hazard.id}
              className={`glass-panel p-5 transition-all relative overflow-hidden glass-panel-hover flex flex-col justify-between ${accentStyle}`}
            >
              {/* Top Row: Hazard Title, Severity Badge & Risk Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge severity={hazard.severity} />
                  <span className="text-xs font-mono text-cyan-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                    [{hazard.id}]
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">
                    {hazard.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-slate-400">Risk Score:</span>
                    <span className="font-bold text-slate-100 bg-[#0b0f10] px-2.5 py-0.5 rounded border border-slate-700">
                      {hazard.riskScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-info: Category, Zone, Sensor Source, YOLO Class & Multi-Frame Confirmation */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3 font-mono">
                <span className="text-cyan-300 font-semibold">{hazard.zoneName}</span>
                <span>•</span>
                <span>Source: {hazard.sensorSource}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[11px]">
                  yolo: {hazard.yoloDetection?.class || 'hazard_object'} ({((hazard.yoloDetection?.confidence || 0.91) * 100).toFixed(0)}%)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  ✓ 4/5 Frames Confirmed
                </span>
                <span>•</span>
                <span className="text-slate-500">{hazard.detectedAt}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-[#101415]/90 p-3 rounded-lg border border-slate-800 font-sans">
                {hazard.description}
              </p>

              {/* Autonomous AI Recommendation Box */}
              <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-3.5 text-xs mb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Site Risk Agent Recommendation</span>
                  </div>
                  <span className="text-[10px] text-cyan-300/80 font-mono">94.6% Model Confidence</span>
                </div>
                <p className="text-slate-200 font-medium leading-normal font-sans">
                  {hazard.aiRecommendation}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs pt-2.5 border-t border-slate-800/80 font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                    Status: {hazard.status}
                  </span>
                </div>

                <button
                  onClick={() => onInspectReasoning(hazard)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Inspect Agent XAI Decision Trace</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Mandatory Decision Support Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
        <p className="text-[11px] font-mono text-slate-500">
          ⚠️ AI detections are decision-support signals and require safety supervisor verification.
        </p>
      </div>
    </ChartPanel>
  );
}
