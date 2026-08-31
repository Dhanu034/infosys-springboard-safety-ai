import React from 'react';
import { Grid, HelpCircle, ShieldAlert } from 'lucide-react';

export default function RiskHeatmapMatrix({ hazards }) {
  // 5x5 Matrix: Probability (5 down to 1) vs Impact (1 to 5)
  const probabilityLabels = [
    { level: 5, name: "5 - Almost Certain" },
    { level: 4, name: "4 - Likely" },
    { level: 3, name: "3 - Possible" },
    { level: 2, name: "2 - Unlikely" },
    { level: 1, name: "1 - Rare" }
  ];

  const impactLabels = [
    "1 - Negligible", "2 - Minor", "3 - Moderate", "4 - Major", "5 - Catastrophic"
  ];

  // Helper to calculate count of active hazards in cell
  const getCellHazards = (prob, impact) => {
    return hazards.filter(h => h.likelihood === prob && (h.severityRating || h.severity) === impact);
  };

  // Helper to color 5x5 cell based on Risk Score (Probability x Impact)
  const getCellColor = (prob, impact) => {
    const score = prob * impact;
    if (score >= 20) return "bg-red-950/90 border-red-600 text-red-300 shadow-inner";
    if (score >= 15) return "bg-red-900/70 border-red-500 text-red-200";
    if (score >= 10) return "bg-amber-900/60 border-amber-500 text-amber-200";
    if (score >= 6)  return "bg-yellow-900/50 border-yellow-500 text-yellow-200";
    if (score >= 4)  return "bg-emerald-950/60 border-emerald-600 text-emerald-300";
    return "bg-slate-900/60 border-slate-800 text-slate-400";
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Grid className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">Inherent Risk Heatmap — Probability × Impact Matrix</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Auto-calculated from active site risk register</span>
        </div>
      </div>

      {/* Matrix Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          
          {/* Top Header: Impact X-axis */}
          <div className="grid grid-cols-6 gap-2 mb-2 text-center text-xs font-semibold text-slate-300">
            <div className="flex items-center justify-center text-slate-400 font-mono text-[11px]">
              PROBABILITY ↓ / IMPACT →
            </div>
            {impactLabels.map((imp, idx) => (
              <div key={idx} className="bg-slate-900/80 py-1.5 px-1 rounded border border-slate-800 text-[11px] truncate">
                {imp}
              </div>
            ))}
          </div>

          {/* 5 Rows for Probability Levels */}
          {probabilityLabels.map((probObj) => (
            <div key={probObj.level} className="grid grid-cols-6 gap-2 mb-2">
              
              {/* Row Label (Probability) */}
              <div className="bg-slate-900/80 py-2 px-2 rounded border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-start truncate">
                {probObj.name}
              </div>

              {/* 5 Impact Cells */}
              {[1, 2, 3, 4, 5].map((impactLevel) => {
                const cellHazards = getCellHazards(probObj.level, impactLevel);
                const colorClass = getCellColor(probObj.level, impactLevel);
                const riskVal = probObj.level * impactLevel;

                return (
                  <div
                    key={impactLevel}
                    className={`h-14 rounded-lg border p-1.5 flex flex-col justify-between transition-all relative ${colorClass}`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75 font-mono">
                      <span>Val: {riskVal}</span>
                    </div>

                    {cellHazards.length > 0 ? (
                      <div className="flex items-center justify-center">
                        <span className="h-6 w-6 rounded-full bg-slate-950/90 text-red-400 font-bold text-xs flex items-center justify-center border border-red-500 shadow-md animate-pulse">
                          {cellHazards.length}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-[10px] text-slate-500 font-mono">0</div>
                    )}
                  </div>
                );
              })}

            </div>
          ))}

        </div>
      </div>

      {/* Legend Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Risk Bands:</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-900 border border-emerald-600"></span> Low (1-4)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-yellow-900 border border-yellow-500"></span> Medium (5-9)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-900 border border-amber-500"></span> High (10-14)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-900 border border-red-600"></span> Critical (15-25)</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Formula: Inherent Score = Probability × Impact × Exposure
        </div>
      </div>

    </div>
  );
}
