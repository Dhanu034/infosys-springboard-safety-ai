import React from 'react';
import { Radio, Wind, AlertTriangle, ShieldCheck, RefreshCw, Zap, ArrowUpRight, ArrowUp, Thermometer, CloudRain, Activity, Layers, Sparkles, User } from 'lucide-react';

/**
 * CommandCenterPage Component (Exact Stitch Image 4 Left Layout)
 * Displays System Risk Pulse circular gauge, ENV Data Stream, Tactical 3D Overview,
 * Critical Alerts, AI Decision Engine, and Quick Analyze button.
 */
export default function CommandCenterPage({
  project,
  hazards,
  zones,
  onTriggerEvent,
  onReset,
  onNavigateToPPE,
  onNavigateToAlerts
}) {
  const criticalHazards = hazards.filter(h => h.severity === 'CRITICAL');
  const highHazards = hazards.filter(h => h.severity === 'HIGH');
  const riskScore = project?.overallRiskScore || 72;

  // Calculate circle stroke offset for 72/100
  const circumference = 2 * Math.PI * 45; // ~283
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 12-Column Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column (Span 4): System Risk Pulse & Env Stream */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          
          {/* Project Risk Pulse */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-[#3c494c]/30">
            <h3 className="text-xs font-mono font-bold text-[#859397] mb-4 tracking-wider">SYSTEM RISK PULSE</h3>
            
            {/* Circular Gauge */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(133, 147, 151, 0.2)" strokeWidth="2"></circle>
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="#fd8b00"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                ></circle>
              </svg>
              <div className="text-center z-10">
                <span className="text-4xl font-extrabold font-mono text-[#fd8b00] block leading-none">{riskScore}</span>
                <span className="text-xs font-mono text-[#bbc9cd]">/ 100</span>
              </div>
              <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping opacity-25 pointer-events-none"></div>
            </div>

            <div className="mt-6 text-center z-10 w-full">
              <div className="flex justify-between text-xs font-mono text-[#859397] border-b border-[#3c494c]/30 pb-2 mb-2">
                <span>TREND</span>
                <span className="text-red-400 flex items-center gap-0.5 font-bold">
                  <ArrowUp className="h-3 w-3" /> +4.2%
                </span>
              </div>
              <p className="text-sm font-bold text-[#ffb77d] tracking-wide font-sans">ELEVATED RISK DETECTED</p>
              <p className="text-[11px] font-mono text-[#ffb77d]/70 mt-0.5">அதிகரித்த ஆபத்து கண்டறியப்பட்டது</p>
            </div>
          </div>

          {/* Environment/Weather Data Stream */}
          <div className="glass-panel p-4 rounded-xl border border-[#3c494c]/30">
            <div className="flex items-center gap-2 mb-3 border-l-4 border-cyan-400 pl-2">
              <span className="text-xs font-mono font-bold text-cyan-300">ENV_DATA_STREAM</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#1d2022]/60 p-3 rounded-lg border border-[#3c494c]/30">
                <Wind className="h-4 w-4 text-[#859397] mx-auto mb-1" />
                <span className="text-xl font-bold font-mono text-[#e0e3e5] block">14</span>
                <span className="text-[10px] font-mono text-[#859397]">AQI (GOOD)</span>
              </div>
              <div className="bg-[#1d2022]/60 p-3 rounded-lg border border-[#3c494c]/30">
                <CloudRain className="h-4 w-4 text-[#859397] mx-auto mb-1" />
                <span className="text-xl font-bold font-mono text-[#e0e3e5] block">12k</span>
                <span className="text-[10px] font-mono text-[#859397]">WIND (KPH)</span>
              </div>
              <div className="bg-[#1d2022]/60 p-3 rounded-lg border border-[#3c494c]/30">
                <Thermometer className="h-4 w-4 text-[#859397] mx-auto mb-1" />
                <span className="text-xl font-bold font-mono text-[#e0e3e5] block">28°</span>
                <span className="text-[10px] font-mono text-[#859397]">TEMP (C)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Center Column (Span 5): Tactical Overview 3D Map & AI Decisions */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          
          {/* Site Tactical Map */}
          <div className="glass-panel rounded-xl relative overflow-hidden min-h-[400px] border border-[#3c494c]/30 flex flex-col justify-between p-4">
            <div className="flex items-center justify-between z-20 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-mono font-bold text-[#ffb77d] tracking-wider">TACTICAL OVERVIEW</span>
              </div>
              <span className="text-[10px] font-mono text-[#859397] bg-[#101415] px-2 py-0.5 rounded border border-[#3c494c]/40">
                Live 3D Geometry
              </span>
            </div>

            {/* Tactical Render Graphic with exact Stitch 3D asset */}
            <div className="relative rounded-lg overflow-hidden border border-[#3c494c]/40 bg-[#0b121e] my-2 h-72 flex items-center justify-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK_knxhTyyaHb0lyGdg0Nb6NZGBPiL889Mul-briGf5ymB0oqFXUK4IyPC6yj1Xyd_phzgw6d4TjwXKFF4y1u6MBIStGy_L1puyoBVBMQRHeusDXLXojKRa6jHHEwvBXr1bJJxUTxr0LwWgND8ieWnm7tWlfrH-nkXvmed17vtlOmnorBBBPh3E4hV5Hr2Xd0cM9cC_SJjfQpQ9LRp4Zcrfu0M0JuMnmS0LdYH4cy1L0Xq6uQ1PJE0"
                alt="Tactical 3D Construction Model"
                className="w-full h-full object-cover opacity-80 mix-blend-screen"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80";
                }}
              />
              {/* Tactical Crosshairs & Glowing Pins */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-8 h-8 border border-red-500/60 flex items-center justify-center rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-cyan-400/60 flex items-center justify-center rounded-full">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
                <div className="absolute top-4 right-4 text-[10px] font-mono text-cyan-300 bg-[#101415]/90 px-2 py-0.5 rounded border border-cyan-500/40">
                  SECTOR 4: ACTIVE
                </div>
              </div>
            </div>

            {/* Bottom Actions inside map */}
            <div className="flex items-center justify-between pt-2 border-t border-[#3c494c]/30 text-xs font-mono">
              <span className="text-[#bbc9cd]">4 Zones Monitored</span>
              <span className="text-cyan-300 font-semibold cursor-pointer hover:underline">Full Spatial View →</span>
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
              "Safety Agent recommends immediate scaffolding inspection in Zone B-4 based on wind shear data."
            </p>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => onTriggerEvent && onTriggerEvent('HIGH_WIND_ALERTS')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-bold border border-emerald-500/40 transition-colors"
              >
                EXECUTE PROTOCOL
              </button>
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
                <h4 className="text-xs font-mono font-bold text-red-300 tracking-wider">CRITICAL ALERTS (2)</h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#101415]/90 p-3 rounded-lg border border-red-500/40 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-red-400 font-bold">ID: VIO-992</span>
                  <span className="text-[#859397]">10:42 AM</span>
                </div>
                <p className="text-xs font-bold text-[#e0e3e5]">Missing Harness detected at Level 12 Edge.</p>
              </div>

              <div className="bg-[#101415]/90 p-3 rounded-lg border border-amber-500/40 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-amber-400 font-bold">ID: OPS-411</span>
                  <span className="text-[#859397]">11:15 AM</span>
                </div>
                <p className="text-xs font-bold text-[#e0e3e5]">Crane load variance approaching limit.</p>
              </div>
            </div>
          </div>

          {/* Agent Network Log */}
          <div className="glass-panel p-4 rounded-xl border border-[#3c494c]/30">
            <div className="flex items-center gap-2 mb-3 border-b border-[#3c494c]/20 pb-2">
              <span className="text-xs font-mono font-bold text-[#859397]">AGENT_NETWORK_LOG</span>
            </div>
            <div className="space-y-2.5 text-[11px] font-mono text-[#bbc9cd]">
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                <div>
                  <span className="text-cyan-300 font-semibold">14:02:11 | RISK_AGENT:</span>
                  <p className="text-[#859397]">Zone C sweep complete. 0 anomalies detected.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                <div>
                  <span className="text-amber-300 font-semibold">14:01:45 | SAFETY_AGENT:</span>
                  <p className="text-[#859397]">Analyzing video feed CAM-12. Identifying hardhat compliance.</p>
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
