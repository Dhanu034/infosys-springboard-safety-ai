import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import BilingualLabel from './BilingualLabel';

/**
 * LoadingState Component
 * Command-center telemetry loading indicator with spinning HUD radar.
 */
export default function LoadingState({
  message = "Ingesting Telemetry & Evaluating Safety Rules...",
  messageTa = "தரவு பெறப்படுகிறது...",
  className = ""
}) {
  return (
    <div className={`glass-panel p-10 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative flex items-center justify-center p-3.5 rounded-2xl bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>

      <div className="space-y-1">
        <BilingualLabel
          en={message}
          ta={messageTa}
          enClassName="text-xs font-mono font-bold text-cyan-300"
          taClassName="text-[10px] text-cyan-400/60"
        />
        <p className="text-[10px] font-mono text-slate-500">BuildSure AI Pipeline Active</p>
      </div>
    </div>
  );
}
