import React, { useState } from 'react';
import { AlertTriangle, MapPin, Sparkles, Clock, Check, BarChart2, CheckCircle2, ChevronRight, Layers, HelpCircle } from 'lucide-react';

/**
 * SiteRiskPage Component (Exact Stitch Image 3 Left Layout)
 * Site Risk Monitoring with High-Risk 3D blueprint render, interactive Risk Matrix,
 * AI Recommendations, Hazard Distribution, and Agent Timeline.
 */
export default function SiteRiskPage({
  project,
  hazards,
  zones,
  onInspectReasoning
}) {
  const [selectedPin, setSelectedPin] = useState(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Site Risk Monitoring</h2>
        <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider uppercase">
          Active Monitoring: Site B-102 | Current Status: <span className="text-[#ffb77d] font-bold">Elevated Risk</span>
        </p>
      </div>

      {/* Top Row: High-Risk Zones (Left) & Risk Matrix (Right) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* High-Risk Zones 3D Blueprint Panel (Span 8) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between h-[500px]">
          <div className="flex items-center justify-between mb-3 border-l-4 border-red-500 pl-3">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">High-Risk Zones</h3>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
              ID: MAP-A102
            </span>
          </div>

          {/* 3D Blueprint Interactive Canvas */}
          <div className="relative rounded-lg overflow-hidden border border-[#3c494c]/40 bg-[#0b121e] flex-1 my-1">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuyryG-6JaC6DDD7PGQZjOhVk9ppE_r8Ygf8Yx2_s6-6WGfVQ8A90CvJE5-fYLJNBCED12iZvs1AQIgBMhbkjttnsdCVqYuGW0rNnerbn7u7T8q9uJBJsSUQLsykYK2ZVexhFZLX0obitlBB7GvSPNNtIcOqWBnhgMNtHDdZZrdJvZKmp8j7oI7C1CSESIuoT5hpRd2Rg9IWVaLMMUPRCz_xfkA1K4Bp-pNu8WNkmisX-ohlxUinY8"
              alt="High-Risk 3D Blueprint Map"
              className="w-full h-full object-cover opacity-80 mix-blend-screen"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80";
              }}
            />

            {/* Tactical Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-400/20 pointer-events-none"></div>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-400/20 pointer-events-none"></div>

            {/* Tactical Interactive Callout Pins */}
            <div
              onClick={() => setSelectedPin('FALL')}
              className="absolute top-1/4 left-1/3 bg-red-950/90 border border-red-500 text-red-300 px-2.5 py-1 rounded text-[10px] font-mono font-bold shadow-xl animate-pulse flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
            >
              <span>FALL HAZARD</span>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </div>

            <div
              onClick={() => setSelectedPin('ELECTRICAL')}
              className="absolute bottom-1/3 right-1/4 bg-amber-950/90 border border-amber-500 text-amber-300 px-2.5 py-1 rounded text-[10px] font-mono font-bold shadow-xl flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
            >
              <span>ELECTRICAL</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            </div>

            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#859397] bg-[#101415]/95 px-2.5 py-1 rounded border border-[#3c494c]/40">
              GRID ACCURACY: ±0.15m • GPS SYNC ACTIVE
            </div>
          </div>
        </div>

        {/* Risk Matrix Scatter Plot (Span 4) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between h-[500px]">
          <div className="flex items-center justify-between mb-2 border-l-4 border-cyan-400 pl-3">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Risk Matrix</h3>
            <span className="text-[10px] font-mono text-[#859397]">Probability vs. Impact</span>
          </div>

          {/* 3x3 Grid Matrix Visualization with Axis */}
          <div className="flex-1 flex flex-col justify-between my-2">
            <div className="grid grid-cols-3 grid-rows-3 gap-1.5 flex-1 p-2 bg-[#0b121e] rounded-lg border border-[#3c494c]/40 relative">
              {/* Row 1 (High Prob) */}
              <div className="border border-yellow-500/20 bg-yellow-950/20 rounded flex items-center justify-center relative">
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-md"></div>
              </div>
              <div className="border border-amber-500/20 bg-amber-950/20 rounded flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#ffb77d]"></div>
              </div>
              <div className="border border-red-500/40 bg-red-950/40 rounded flex items-center justify-center relative">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg animate-pulse"></div>
              </div>

              {/* Row 2 (Med Prob) */}
              <div className="border border-emerald-500/20 bg-emerald-950/20 rounded"></div>
              <div className="border border-yellow-500/20 bg-yellow-950/20 rounded flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              </div>
              <div className="border border-amber-500/20 bg-amber-950/20 rounded"></div>

              {/* Row 3 (Low Prob) */}
              <div className="border border-emerald-500/20 bg-emerald-950/20 rounded"></div>
              <div className="border border-emerald-500/20 bg-emerald-950/20 rounded"></div>
              <div className="border border-yellow-500/20 bg-yellow-950/20 rounded"></div>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-[#859397] pt-2 px-1">
              <span>IMPACT →</span>
              <span>PROBABILITY ↑</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom 3 Columns: AI Recommendations (Span 5), Hazard Dist (Span 4), Agent Timeline (Span 3) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* AI Recommendations */}
        <div className="col-span-12 lg:col-span-5 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-l-4 border-cyan-400 pl-3">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">AI Recommendations</h3>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="bg-[#101415]/90 p-3.5 rounded-lg border border-[#3c494c]/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="font-bold text-[#e0e3e5]">IMMEDIATE ACTION REQUIRED</span>
                </div>
                <p className="text-[#bbc9cd] text-[11px] leading-relaxed font-sans">
                  Deploy supervisor to Sector 4. Predictive model indicates 85% probability of fall incident within next 2 hours based on wind shear data.
                </p>
                <div className="pt-1 flex gap-2 font-mono text-[10px]">
                  <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded">Sector 4</span>
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Fall Risk</span>
                </div>
              </div>

              <div className="bg-[#101415]/90 p-3 rounded-lg border border-[#3c494c]/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  <span className="font-bold text-[#e0e3e5]">REVIEW EQUIPMENT LOGS</span>
                </div>
                <p className="text-[#859397] text-[11px] font-sans">
                  Crane C-2 showing irregular vibration patterns. Schedule maintenance window before next shift.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#3c494c]/30">
            <button
              onClick={() => onInspectReasoning && onInspectReasoning(hazards[0])}
              className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40 transition-colors uppercase cursor-pointer"
            >
              Acknowledge All & View Trace
            </button>
          </div>
        </div>

        {/* Hazard Dist. */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-l-4 border-cyan-400 pl-3">
              <BarChart2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Hazard Dist.</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[#bbc9cd] mb-1">
                  <span>FALL HAZARDS</span>
                  <span className="font-bold text-[#e0e3e5]">42%</span>
                </div>
                <div className="w-full h-1.5 bg-[#101415] rounded-full overflow-hidden border border-[#3c494c]/30">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#bbc9cd] mb-1">
                  <span>ELECTRICAL / EQUIP</span>
                  <span className="font-bold text-[#e0e3e5]">36%</span>
                </div>
                <div className="w-full h-1.5 bg-[#101415] rounded-full overflow-hidden border border-[#3c494c]/30">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '36%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#bbc9cd] mb-1">
                  <span>ENVIRONMENTAL</span>
                  <span className="font-bold text-[#e0e3e5]">14%</span>
                </div>
                <div className="w-full h-1.5 bg-[#101415] rounded-full overflow-hidden border border-[#3c494c]/30">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '14%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#bbc9cd] mb-1">
                  <span>OTHER</span>
                  <span className="font-bold text-[#e0e3e5]">8%</span>
                </div>
                <div className="w-full h-1.5 bg-[#101415] rounded-full overflow-hidden border border-[#3c494c]/30">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Timeline */}
        <div className="col-span-12 lg:col-span-3 glass-panel p-5 rounded-xl border border-[#3c494c]/30">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-cyan-400 pl-3">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Agent Timeline</h3>
          </div>

          <div className="space-y-4 font-mono text-[11px]">
            <div className="border-l-2 border-amber-500/50 pl-3 relative">
              <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-amber-400"></span>
              <span className="text-[#859397] text-[10px]">09:42 AM • Site Risk Agent</span>
              <p className="text-[#e0e3e5] font-bold mt-0.5">Flagged high wind speed anomaly near Scaffold D.</p>
            </div>

            <div className="border-l-2 border-emerald-500/50 pl-3 relative">
              <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-[#859397] text-[10px]">09:15 AM • Compliance Agent</span>
              <p className="text-[#bbc9cd] mt-0.5">Verified morning safety brief attendance. 2 missing.</p>
            </div>

            <div className="border-l-2 border-cyan-500/50 pl-3 relative">
              <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-cyan-400"></span>
              <span className="text-[#859397] text-[10px]">09:00 AM • System</span>
              <p className="text-[#bbc9cd] mt-0.5">Daily risk baseline established. Routine monitoring active.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
