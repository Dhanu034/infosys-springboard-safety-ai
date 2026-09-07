import React, { useState } from 'react';
import { Map, AlertCircle, ShieldCheck, Activity, Eye, Compass, HardHat, Wind, Gauge } from 'lucide-react';
import ChartPanel from './ui/ChartPanel';
import RiskBadge from './ui/RiskBadge';
import BilingualLabel from './ui/BilingualLabel';

/**
 * SiteMapGrid Component (Phase 3 Redesign)
 * Spatial 2D construction site zones with live telemetry, sensor indicators,
 * and HUD blueprint styling adhering to DESIGN.md.
 */
export default function SiteMapGrid({ zones, onSelectZone }) {
  const [activeHoverZone, setActiveHoverZone] = useState(null);

  const getAccentClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-accent-critical hover:border-red-400/60 bg-red-950/10';
      case 'HIGH':
        return 'border-accent-high hover:border-amber-400/60 bg-amber-950/10';
      case 'MODERATE':
        return 'border-accent-medium hover:border-yellow-400/60 bg-yellow-950/10';
      default:
        return 'border-accent-low hover:border-emerald-400/60 bg-emerald-950/10';
    }
  };

  return (
    <ChartPanel
      title="Interactive Spatial Site Map & Risk Zones"
      titleTa="இடஞ்சார்ந்த தள வரைபடம் & அபாய மண்டலங்கள்"
      subtitle="2D Architectural site zone layout with live spatial worker density and multi-sensor feeds"
      icon={Map}
      badge={
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          Spatial Telemetry Active
        </span>
      }
      actions={
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span> Critical
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span> High Risk
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Normal
          </span>
        </div>
      }
      className="mb-6"
    >
      {/* Grid Layout of Construction Site */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const accentStyle = getAccentClass(zone.riskLevel);

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone)}
              onMouseEnter={() => setActiveHoverZone(zone.id)}
              onMouseLeave={() => setActiveHoverZone(null)}
              className={`glass-panel p-5 transition-all cursor-pointer relative overflow-hidden glass-panel-hover flex flex-col justify-between ${accentStyle}`}
            >
              {/* Top Row: Zone Title & Risk Score */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    {zone.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1.5 font-sans">{zone.name}</h3>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-100 shadow-sm">
                    Score: {zone.riskScore}
                  </span>
                  <RiskBadge severity={zone.riskLevel} size="sm" />
                </div>
              </div>

              {/* Primary Hazard Alert */}
              <div className="bg-[#101415]/90 p-3 rounded-lg border border-slate-800 mb-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="truncate">{zone.primaryHazard}</span>
                </div>
              </div>

              {/* Sensor Telemetry Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-cyan-400" /> Vibration
                  </span>
                  <span className="text-slate-200 font-semibold">{zone.sensors.soilVibration || zone.sensors.vibration || "Normal"}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-cyan-400" /> Wind/Tilt
                  </span>
                  <span className="text-slate-200 font-semibold truncate max-w-[90px]">{zone.sensors.windGustSpeed || zone.sensors.structuralTilt || "Normal"}</span>
                </div>
              </div>

              {/* Footer: Worker Count & Action */}
              <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800/80 font-mono">
                <span className="flex items-center gap-1.5">
                  <HardHat className="h-3.5 w-3.5 text-slate-300" />
                  <strong className="text-slate-200">{zone.activeWorkers}</strong> Workers Active
                </span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 hover:text-cyan-300 transition-colors">
                  Inspect Zone <Eye className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ChartPanel>
  );
}
