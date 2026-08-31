import React from 'react';
import { Radio, Wind, AlertTriangle, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

export default function SimulatorControls({ onTriggerEvent, onReset }) {
  return (
    <div className="glass-panel rounded-xl p-4 border border-cyan-500/30 bg-cyan-500/5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-100">Live Ingestion & Telemetry Simulator</h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Interactive Testbed
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Simulate real-time site hazards to observe autonomous AI Agent recalculations
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onTriggerEvent('HIGH_WIND_ALERTS')}
          className="px-3.5 py-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 font-medium text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <Wind className="h-4 w-4 text-amber-400" />
          <span>Simulate High Wind Surge (&gt;42 km/h)</span>
        </button>

        <button
          onClick={() => onTriggerEvent('SOIL_VIBRATION_ANOMALY')}
          className="px-3.5 py-2 rounded-lg bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 font-medium text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span>Simulate Excavation Soil Shear Anomaly</span>
        </button>

        <button
          onClick={() => onTriggerEvent('HARNESS_VIOLATION_CLUSTER')}
          className="px-3.5 py-2 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/20 font-medium text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <ShieldCheck className="h-4 w-4 text-yellow-400" />
          <span>Simulate Harness Tie-off Violation Cluster</span>
        </button>

        <button
          onClick={onReset}
          className="px-3 py-2 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Feed</span>
        </button>
      </div>
    </div>
  );
}
