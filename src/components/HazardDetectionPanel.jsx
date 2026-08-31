import React, { useState } from 'react';
import { AlertOctagon, Filter, Cpu, CheckCircle2, ChevronRight, Info, ShieldAlert, Sparkles } from 'lucide-react';

export default function HazardDetectionPanel({ hazards, onInspectReasoning }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Fall Hazard', 'Equipment', 'Electrical', 'Environmental'];

  const filteredHazards = selectedCategory === 'ALL'
    ? hazards
    : hazards.filter(h => h.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(h.category.toLowerCase()));

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/50 glow-red';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 mb-6">
      
      {/* Header & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-red-400" />
          <h2 className="text-base font-bold text-slate-100">Live Hazard Detection & Site Risk Workflow Panel</h2>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            {hazards.length} Detected
          </span>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hazard Cards List */}
      <div className="space-y-4">
        {filteredHazards.map((hazard) => {
          const badgeClass = getSeverityBadge(hazard.severity);
          return (
            <div
              key={hazard.id}
              className="bg-slate-900/70 rounded-xl p-4 border border-slate-800/90 hover:border-slate-700 transition-all relative overflow-hidden group"
            >
              {/* Top Row: Hazard Title, Severity Badge & Risk Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase border ${badgeClass}`}>
                    {hazard.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-medium">[{hazard.id}]</span>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {hazard.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-slate-400">Risk Score:</span>
                    <span className="font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                      {hazard.riskScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-info: Category, Zone, Sensor Source */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3 font-mono">
                <span className="text-cyan-400 font-semibold">{hazard.zoneName}</span>
                <span>•</span>
                <span>Source: {hazard.sensorSource}</span>
                <span>•</span>
                <span className="text-slate-400">{hazard.detectedAt}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                {hazard.description}
              </p>

              {/* Autonomous AI Recommendation Box */}
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Sparkles className="h-4 w-4" />
                    <span>Site Risk Agent Recommendation</span>
                  </div>
                  <span className="text-[10px] text-cyan-300/80 font-mono">94.6% Confidence</span>
                </div>
                <p className="text-slate-200 font-medium leading-normal">
                  {hazard.aiRecommendation}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    Status: {hazard.status}
                  </span>
                </div>

                <button
                  onClick={() => onInspectReasoning(hazard)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Inspect Agent XAI Decision Trace</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
