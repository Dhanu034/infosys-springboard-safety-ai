import React from 'react';
import { Radio, Wind, AlertTriangle, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import BilingualLabel from './ui/BilingualLabel';

/**
 * SimulatorControls Component (Phase 3 Redesign)
 * Tactical command bar for triggering real-time site hazard events,
 * visually styled with Industrial Precision Glassmorphism and HUD indicators.
 */
export default function SimulatorControls({ onTriggerEvent, onReset }) {
  return (
    <div className="glass-panel p-4 lg:p-5 border-accent-cyan mb-6 relative overflow-hidden">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <BilingualLabel
                en="Live Ingestion & Telemetry Simulator"
                ta="நிகழ்நேர தரவு உருவகப்படுத்துதல்"
                enClassName="text-sm font-bold text-slate-100 tracking-tight"
              />
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
                Simulated Prototype
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-400">
          Inject real-time hazards to observe autonomous AI Agent recalculation.
        </p>
      </div>

      {/* Simulator Trigger Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => onTriggerEvent('HIGH_WIND_ALERTS')}
          className="px-3.5 py-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-sm hover:border-amber-400"
        >
          <Wind className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Simulate High Wind (&gt;42 km/h)</span>
        </button>

        <button
          onClick={() => onTriggerEvent('SOIL_VIBRATION_ANOMALY')}
          className="px-3.5 py-2 rounded-lg bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-sm hover:border-red-400"
        >
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span>Simulate Soil Shear Anomaly</span>
        </button>

        <button
          onClick={() => onTriggerEvent('HARNESS_VIOLATION_CLUSTER')}
          className="px-3.5 py-2 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/20 text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-sm hover:border-yellow-400"
        >
          <ShieldCheck className="h-4 w-4 text-yellow-400 shrink-0" />
          <span>Simulate Harness Violation</span>
        </button>

        <button
          onClick={onReset}
          title="Reset telemetry feed to baseline state"
          className="px-3.5 py-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 hover:text-slate-100 hover:border-slate-600 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ml-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset Feed</span>
        </button>
      </div>
    </div>
  );
}
