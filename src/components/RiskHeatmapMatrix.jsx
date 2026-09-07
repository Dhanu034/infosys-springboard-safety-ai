import React from 'react';
import { Grid, HelpCircle, ShieldAlert } from 'lucide-react';
import ChartPanel from './ui/ChartPanel';

/**
 * RiskHeatmapMatrix Component (Phase 3 Redesign)
 * 5x5 Probability vs Impact Risk Matrix styled with Industrial Precision Glassmorphism.
 */
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
    if (score >= 20) return "bg-red-950/80 border-red-500/80 text-red-300 shadow-inner";
    if (score >= 15) return "bg-red-900/60 border-red-500/60 text-red-200";
    if (score >= 10) return "bg-amber-900/50 border-amber-500/60 text-amber-200";
    if (score >= 6)  return "bg-yellow-900/40 border-yellow-500/50 text-yellow-200";
    if (score >= 4)  return "bg-emerald-950/50 border-emerald-500/50 text-emerald-300";
    return "bg-slate-900/60 border-slate-800 text-slate-500";
  };

  return (
    <ChartPanel
      title="Inherent Risk Heatmap — Probability × Impact Matrix"
      titleTa="அபாய மேட்ரிக்ஸ் (நிகழ்தகவு × தாக்கம்)"
      subtitle="5×5 Actuarial risk assessment matrix auto-calculated from active site risk register"
      icon={Grid}
      badge={
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          OSHA Matrix Model
        </span>
      }
      className="mb-6"
    >
      {/* Matrix Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          
          {/* Top Header: Impact X-axis */}
          <div className="grid grid-cols-6 gap-2 mb-2 text-center text-xs font-semibold text-slate-300">
            <div className="flex items-center justify-center text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              PROBABILITY ↓ / IMPACT →
            </div>
            {impactLabels.map((imp, idx) => (
              <div key={idx} className="bg-slate-900/90 py-2 px-1 rounded-lg border border-slate-800 text-[11px] font-mono truncate">
                {imp}
              </div>
            ))}
          </div>

          {/* 5 Rows for Probability Levels */}
          {probabilityLabels.map((probObj) => (
            <div key={probObj.level} className="grid grid-cols-6 gap-2 mb-2">
              
              {/* Row Label (Probability) */}
              <div className="bg-slate-900/90 py-2 px-2.5 rounded-lg border border-slate-800 text-[11px] font-mono font-semibold text-slate-300 flex items-center justify-start truncate">
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
                    <div className="flex justify-between items-center text-[10px] font-mono opacity-75">
                      <span>Val: {riskVal}</span>
                    </div>

                    {cellHazards.length > 0 ? (
                      <div className="flex items-center justify-center">
                        <span className="h-6 w-6 rounded-full bg-slate-950 text-red-300 font-bold font-mono text-xs flex items-center justify-center border border-red-500 shadow-md animate-pulse">
                          {cellHazards.length}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-[10px] text-slate-600 font-mono">0</div>
                    )}
                  </div>
                );
              })}

            </div>
          ))}

        </div>
      </div>

      {/* Legend Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Risk Bands:</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-950 border border-emerald-500"></span> Low (1-4)</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-yellow-950 border border-yellow-500"></span> Medium (5-9)</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-950 border border-amber-500"></span> High (10-14)</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-950 border border-red-500"></span> Critical (15-25)</span>
        </div>
        <div className="text-[11px] text-cyan-400/80">
          Formula: Risk Score = Probability × Impact × Exposure Factor
        </div>
      </div>
    </ChartPanel>
  );
}
