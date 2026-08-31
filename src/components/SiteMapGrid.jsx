import React, { useState } from 'react';
import { Map, AlertCircle, ShieldCheck, Activity, Eye, Compass, HardHat, Wind, Gauge } from 'lucide-react';

export default function SiteMapGrid({ zones, onSelectZone }) {
  const [activeHoverZone, setActiveHoverZone] = useState(null);

  const getRiskStyle = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/10 border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 border-amber-500/50 text-amber-400 hover:border-amber-400 hover:bg-amber-500/20';
      case 'MODERATE':
        return 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/20';
      default:
        return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">Interactive Spatial Site Map & Risk Zones</h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span> Critical Zone
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span> High Risk
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Normal
          </span>
        </div>
      </div>

      {/* Grid Layout of Construction Site */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const style = getRiskStyle(zone.riskLevel);
          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone)}
              onMouseEnter={() => setActiveHoverZone(zone.id)}
              onMouseLeave={() => setActiveHoverZone(null)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${style}`}
            >
              {/* Top Row: Zone Title & Risk Score */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
                    {zone.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">{zone.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-950/80 border border-current shadow-sm">
                    Score: {zone.riskScore}
                  </span>
                  <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide">{zone.riskLevel}</p>
                </div>
              </div>

              {/* Primary Hazard Alert */}
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{zone.primaryHazard}</span>
                </div>
              </div>

              {/* Sensor Telemetry Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-cyan-400" /> Vibration
                  </span>
                  <span className="text-slate-200 font-semibold">{zone.sensors.soilVibration || zone.sensors.vibration || "Normal"}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind className="h-3 w-3 text-cyan-400" /> Wind/Tilt
                  </span>
                  <span className="text-slate-200 font-semibold truncate max-w-[90px]">{zone.sensors.windGustSpeed || zone.sensors.structuralTilt || "Normal"}</span>
                </div>
              </div>

              {/* Footer: Worker Count & Action */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <HardHat className="h-3.5 w-3.5 text-slate-300" />
                  <strong className="text-slate-200">{zone.activeWorkers}</strong> Workers Active
                </span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 hover:underline">
                  Inspect Zone <Eye className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
