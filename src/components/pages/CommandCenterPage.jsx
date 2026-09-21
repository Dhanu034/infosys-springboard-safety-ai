import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  ArrowUp, 
  Thermometer, 
  CloudRain, 
  Activity, 
  Layers, 
  Sparkles, 
  Database,
  CheckCircle2,
  MapPin,
  Clock
} from 'lucide-react';
import { fetchSafetySummary, fetchSafetyAlerts } from '../../services/api';
import { useProject } from '../../context/ProjectContext';

/**
 * CommandCenterPage Component
 * Displays live aggregated project metrics, dynamic System Risk Pulse,
 * project-specific tactical overview, live critical alerts, and agent status.
 */
export default function CommandCenterPage({
  project,
  hazards = [],
  zones = [],
  onTriggerEvent,
  onReset,
  onNavigateToPPE,
  onNavigateToAlerts
}) {
  const { selectedProjectId, isSimulationMode } = useProject();
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const [sumData, alertData] = await Promise.all([
        fetchSafetySummary(selectedProjectId).catch(() => null),
        fetchSafetyAlerts(selectedProjectId).catch(() => [])
      ]);
      setSummary(sumData);
      setAlerts(alertData || []);
    } catch (e) {
      console.error("Command center load error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSummary(null);
    setAlerts([]);
    loadData();
  }, [selectedProjectId]);

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'OPEN');
  const hasData = summary && summary.has_data && summary.safety_score !== null;
  const scoreDisplay = hasData ? summary.safety_score : (isSimulationMode ? (project?.overallRiskScore || 72) : 'N/A');
  const numericScore = typeof scoreDisplay === 'number' ? scoreDisplay : 0;

  // Calculate circle stroke offset for gauge
  const circumference = 2 * Math.PI * 45; // ~283
  const strokeDashoffset = hasData || isSimulationMode ? circumference - (numericScore / 100) * circumference : circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 12-Column Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column (Span 4): System Risk Pulse & Env Stream */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          
          {/* Project Risk Pulse */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-[#3c494c]/30">
            <div className="flex items-center justify-between w-full mb-3">
              <h3 className="text-xs font-mono font-bold text-[#859397] tracking-wider">SYSTEM SAFETY PULSE</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                hasData ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' : (isSimulationMode ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-700')
              }`}>
                {hasData ? 'DATABASE' : (isSimulationMode ? 'SIMULATOR' : 'NO RECORDS')}
              </span>
            </div>
            
            {/* Circular Gauge */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(133, 147, 151, 0.2)" strokeWidth="2"></circle>
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke={hasData ? (numericScore >= 80 ? '#38bdf8' : (numericScore >= 60 ? '#fd8b00' : '#ef4444')) : '#64748b'}
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                ></circle>
              </svg>
              <div className="text-center z-10">
                <span className={`text-4xl font-extrabold font-mono block leading-none ${hasData ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {scoreDisplay}
                </span>
                {hasData && <span className="text-xs font-mono text-[#bbc9cd]">/ 100</span>}
              </div>
              {hasData && numericScore < 70 && (
                <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping opacity-25 pointer-events-none"></div>
              )}
            </div>

            <div className="mt-6 text-center z-10 w-full">
              <div className="flex justify-between text-xs font-mono text-[#859397] border-b border-[#3c494c]/30 pb-2 mb-2">
                <span>PROJECT</span>
                <span className="text-cyan-300 font-bold truncate max-w-[180px]">
                  {project?.name || selectedProjectId}
                </span>
              </div>
              <p className="text-sm font-bold text-[#ffb77d] tracking-wide font-sans">
                {hasData 
                  ? (numericScore >= 80 ? "OPTIMAL SITE VIGILANCE" : (numericScore >= 60 ? "MODERATE RISK OBSERVED" : "ELEVATED HAZARD DETECTED"))
                  : (isSimulationMode ? "SIMULATED TELEMETRY ACTIVE" : "NO SAFETY OBSERVATIONS YET")}
              </p>
              <p className="text-[11px] font-mono text-[#859397] mt-0.5">
                {hasData ? `${summary.open_violations} open violation(s) currently registered` : "Upload inspection image to compute score"}
              </p>
            </div>
          </div>

          {/* Environment/Weather Data Stream */}
          <div className="glass-panel p-4 rounded-xl border border-[#3c494c]/30">
            <div className="flex items-center justify-between mb-3 border-l-4 border-cyan-400 pl-2">
              <span className="text-xs font-mono font-bold text-cyan-300">SITE_CONDITIONS</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                {isSimulationMode ? "SIMULATOR" : "REFERENCE"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#1d2022]/60 p-3 rounded-lg border border-[#3c494c]/30">
                <Wind className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-[#e0e3e5] block">
                  {isSimulationMode ? "38 km/h" : "18 km/h"}
                </span>
                <span className="text-[10px] font-mono text-[#859397]">WIND SPEED</span>
              </div>
              <div className="bg-[#1d2022]/60 p-3 rounded-lg border border-[#3c494c]/30">
                <Thermometer className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-[#e0e3e5] block">
                  {isSimulationMode ? "36°C" : "28°C"}
                </span>
                <span className="text-[10px] font-mono text-[#859397]">HEAT INDEX</span>
              </div>
              <div className="bg-[#1d2022]/60 p-3 rounded-lg border border-[#3c494c]/30">
                <Activity className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-[#e0e3e5] block">
                  {zones.length}
                </span>
                <span className="text-[10px] font-mono text-[#859397]">ACTIVE ZONES</span>
              </div>
            </div>
          </div>

        </div>

        {/* Center Column (Span 5): Tactical Overview & AI Decisions */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          
          {/* Site Tactical Map Overview */}
          <div className="glass-panel rounded-xl relative overflow-hidden min-h-[400px] border border-[#3c494c]/30 flex flex-col justify-between p-4">
            <div className="flex items-center justify-between z-20 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">PROJECT ZONES & SECTORS</span>
              </div>
              <span className="text-[10px] font-mono text-[#859397] bg-[#101415] px-2 py-0.5 rounded border border-[#3c494c]/40">
                {selectedProjectId}
              </span>
            </div>

            {/* Zone List Representation */}
            <div className="space-y-2.5 my-2 flex-1">
              {zones.length > 0 ? (
                zones.map((z) => (
                  <div key={z.id} className="bg-[#101415]/90 p-3 rounded-lg border border-[#3c494c]/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                          {z.id}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{z.name}</span>
                      </div>
                      <p className="text-[11px] font-mono text-[#859397] mt-1">{z.primaryHazard}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      z.riskLevel === 'CRITICAL' ? 'bg-red-950/80 text-red-300 border-red-500/40' :
                      z.riskLevel === 'HIGH' ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                      'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {z.riskLevel}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-[#3c494c]/40 rounded-lg">
                  <p className="text-xs font-mono text-slate-400">No spatial zones configured for {selectedProjectId}.</p>
                </div>
              )}
            </div>

            {/* Bottom Actions inside map */}
            <div className="flex items-center justify-between pt-2 border-t border-[#3c494c]/30 text-xs font-mono">
              <span className="text-[#bbc9cd]">{zones.length} Zones Monitored</span>
              <button 
                onClick={onNavigateToPPE}
                className="text-cyan-300 font-semibold cursor-pointer hover:underline"
              >
                Inspect PPE Vision →
              </button>
            </div>
          </div>

          {/* AI Decision Engine Box */}
          <div className="glass-panel p-4 rounded-xl border-l-4 border-emerald-400 border border-[#3c494c]/30 bg-emerald-950/10">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>AI_DECISION_ENGINE</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Autonomous</span>
            </div>
            <p className="text-xs text-[#e0e3e5] leading-relaxed font-mono">
              {hazards.length > 0 
                ? `"${hazards[0].aiRecommendation || 'Safety Agent actively auditing site rules and zone multipliers.'}"`
                : `"Safety Agent actively standing by for ${project?.name || selectedProjectId}. All baseline standards active."`}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              {onTriggerEvent && (
                <button
                  onClick={() => onTriggerEvent('HIGH_WIND_ALERTS')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-bold border border-emerald-500/40 transition-colors cursor-pointer"
                >
                  SIMULATE EVENT
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Span 3): Critical Alerts & Agent Network Log */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          
          {/* Critical Alerts Card */}
          <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-950/10">
            <div className="flex items-center justify-between mb-3 border-b border-red-500/20 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h4 className="text-xs font-mono font-bold text-red-300 tracking-wider">
                  CRITICAL ALERTS ({criticalAlerts.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/40">
                DATABASE
              </span>
            </div>

            <div className="space-y-3">
              {criticalAlerts.length > 0 ? (
                criticalAlerts.slice(0, 3).map((a) => (
                  <div key={a.alert_id} className="bg-[#101415]/90 p-3 rounded-lg border border-red-500/40 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-red-400 font-bold truncate max-w-[120px]">{a.alert_id.slice(0, 8)}</span>
                      <span className="text-[#859397]">
                        {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#e0e3e5] line-clamp-2">{a.title}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#101415]/80 rounded-lg border border-[#3c494c]/30 text-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-mono text-slate-300">0 Critical Alerts</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">All monitored parameters safe</p>
                </div>
              )}
            </div>

            {onNavigateToAlerts && (
              <button
                onClick={onNavigateToAlerts}
                className="w-full mt-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-mono font-bold border border-red-500/40 transition-colors cursor-pointer text-center"
              >
                VIEW ALL ALERTS →
              </button>
            )}
          </div>

          {/* Agent Network Log */}
          <div className="glass-panel p-4 rounded-xl border border-[#3c494c]/30">
            <div className="flex items-center justify-between mb-3 border-b border-[#3c494c]/20 pb-2">
              <span className="text-xs font-mono font-bold text-[#859397]">AGENT_STATUS_LOG</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">ONLINE</span>
            </div>
            <div className="space-y-2.5 text-[11px] font-mono text-[#bbc9cd]">
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                <div>
                  <span className="text-cyan-300 font-semibold">YOLOv8_VISION_AGENT:</span>
                  <p className="text-[#859397]">PPE model active on models/ppe_model.pt</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                <div>
                  <span className="text-amber-300 font-semibold">SAFETY_AGENT:</span>
                  <p className="text-[#859397]">Zone multipliers synced for {selectedProjectId}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <div>
                  <span className="text-emerald-300 font-semibold">COMPLIANCE_ENGINE:</span>
                  <p className="text-[#859397]">BOCW & OSHA rules loaded</p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Quick Action Button */}
          <button
            onClick={onNavigateToPPE}
            className="w-full py-3.5 rounded-xl bg-[#fd8b00] hover:bg-[#e07b00] text-slate-950 font-black font-sans text-sm flex items-center justify-center gap-2 shadow-lg glow-orange transition-all uppercase tracking-wider cursor-pointer"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Analyze Site Image</span>
          </button>

        </div>

      </div>

    </div>
  );
}
