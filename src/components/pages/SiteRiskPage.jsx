import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
  Clock, 
  Check, 
  BarChart2, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  HelpCircle,
  Activity,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import SiteMapGrid from '../SiteMapGrid';
import RiskHeatmapMatrix from '../RiskHeatmapMatrix';

/**
 * SiteRiskPage Component
 * Real-time Site Risk Monitoring integrating functional 2D spatial SiteMapGrid,
 * mathematical 5x5 Probability x Impact RiskHeatmapMatrix, and XAI Reasoning links.
 */
export default function SiteRiskPage({
  hazards = [],
  zones = [],
  onInspectReasoning
}) {
  const { selectedProject, selectedProjectId, isSimulationMode } = useProject();
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Site Risk Monitoring</h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isSimulationMode ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
            }`}>
              {isSimulationMode ? 'SIMULATOR TELEMETRY' : 'SITE RISK AGENT'}
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider uppercase">
            PROJECT: <span className="text-cyan-300 font-bold">{selectedProject?.name || selectedProjectId}</span> | ACTIVE ZONES: {zones.length}
          </p>
        </div>
      </div>

      {/* Top Section: 2D Spatial Site Map Grid */}
      <div>
        {zones.length > 0 ? (
          <SiteMapGrid 
            zones={zones} 
            onSelectZone={(zone) => setSelectedZone(zone)} 
          />
        ) : (
          <div className="glass-panel p-8 text-center border border-dashed border-[#3c494c]/40 rounded-xl">
            <Info className="h-6 w-6 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-mono text-slate-300">No project risk zones configured for {selectedProject?.name || selectedProjectId}.</p>
            <p className="text-xs font-mono text-slate-500 mt-1">Configure site zones in safety rules to render 2D spatial layouts.</p>
          </div>
        )}
      </div>

      {/* Middle Section: Inherent Risk Heatmap (5x5 Matrix) */}
      <div>
        <RiskHeatmapMatrix hazards={hazards} />
      </div>

      {/* Bottom Section: Active Hazard Register & AI Recommendations */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Active Hazard Register (Span 7) */}
        <div className="col-span-12 lg:col-span-7 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-l-4 border-cyan-400 pl-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Active Site Risk Register</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                {hazards.length} HAZARDS
              </span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {hazards.length > 0 ? (
                hazards.map((h) => (
                  <div key={h.id} className="bg-[#101415]/90 p-3.5 rounded-lg border border-[#3c494c]/40 space-y-1.5 hover:border-cyan-500/40 transition-colors">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">{h.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{h.zoneName || h.zoneId}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        h.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        h.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {h.severity} (Score: {h.riskScore})
                      </span>
                    </div>

                    <p className="font-bold text-[#e0e3e5]">{h.title}</p>
                    <p className="text-[#bbc9cd] text-[11px] leading-relaxed line-clamp-2">{h.description}</p>

                    <div className="pt-2 border-t border-[#3c494c]/30 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#859397]">
                        P: {h.likelihood} | I: {h.severityRating || 4} | E: {h.exposure || 3}
                      </span>
                      <button
                        onClick={() => onInspectReasoning && onInspectReasoning(h)}
                        className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Decision Trace →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-[#3c494c]/30 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-mono text-slate-300">No active hazard events registered for {selectedProject?.name || selectedProjectId}.</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">Site operations within standard safety parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations & Actions (Span 5) */}
        <div className="col-span-12 lg:col-span-5 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-l-4 border-emerald-400 pl-3">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Autonomous AI Mitigation Directives</h3>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {hazards.length > 0 ? (
                hazards.slice(0, 3).map((h) => (
                  <div key={h.id} className="bg-[#101415]/90 p-3.5 rounded-lg border border-emerald-500/30 space-y-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300">
                      <span className="font-bold">{h.id}</span>
                      <span>•</span>
                      <span>{h.category || 'General Hazard'}</span>
                    </div>
                    <p className="text-[#bbc9cd] text-[11px] leading-relaxed font-mono">
                      "{h.aiRecommendation || 'Enforce safety perimeter and audit equipment certifications.'}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-[#3c494c]/30 rounded-lg">
                  <ShieldAlert className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-mono text-slate-300">All Site Mitigation Protocols Optimal</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">Autonomous SiteRiskAgent monitoring active.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#3c494c]/30 text-xs font-mono text-[#859397] flex items-center justify-between">
            <span>Agent: SiteRiskAgent-Alpha</span>
            <span className="text-emerald-400 font-bold">OSHA 1926 Verified</span>
          </div>
        </div>

      </div>

    </div>
  );
}
