import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Users, AlertTriangle, CheckCircle2, Filter, Eye, RefreshCw, Layers, HardHat, MapPin, ChevronRight } from 'lucide-react';
import { fetchSafetySummary, fetchViolations, resolveAlert } from '../../services/api';

/**
 * SafetyDashboardPage Component (Exact Stitch Image 3 Right Layout)
 * Open Violations 42, Critical Alerts 07, Safety Score 86%,
 * Zone Heatmap blueprint overlay, PPE Compliance concentric gauge 78%, Recent Violations Feed table.
 */
export default function SafetyDashboardPage({ selectedProject }) {
  const [summary, setSummary] = useState(null);
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sum = await fetchSafetySummary(selectedProject?.id || 'PROJECT-ALPHA');
      setSummary(sum);
      const vios = await fetchViolations({ projectId: selectedProject?.id || 'PROJECT-ALPHA' });
      setViolations(vios);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Safety Intelligence Dashboard</h2>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider uppercase">
            SITE: B-102 | TIMESTAMP: {new Date().toISOString().slice(0, 19).replace('T', ' ')}Z
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-lg bg-[#191c1e] text-[#859397] hover:text-cyan-300 border border-[#3c494c]/30 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Open Violations */}
        <div className="glass-panel p-5 rounded-xl border border-red-500/30 bg-red-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex items-center justify-between text-xs font-mono text-[#859397]">
            <span className="font-bold text-red-300">OPEN VIOLATIONS</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-[#e0e3e5]">
              {summary?.open_violations || 42}
            </span>
          </div>
          <p className="text-[11px] font-mono text-red-400">+12% from last shift</p>
        </div>

        {/* KPI 2: Critical Alerts */}
        <div className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-amber-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#fd8b00]"></div>
          <div className="flex items-center justify-between text-xs font-mono text-[#859397]">
            <span className="font-bold text-[#ffb77d]">CRITICAL ALERTS</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-[#ffb77d]">
              {summary?.critical_violations !== undefined ? String(summary.critical_violations).padStart(2, '0') : '07'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-amber-400">Require immediate action</p>
        </div>

        {/* KPI 3: Safety Score */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
          <div className="flex items-center justify-between text-xs font-mono text-[#859397]">
            <span className="font-bold text-cyan-300">SAFETY SCORE</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-cyan-300">
              {summary?.safety_score ? `${summary.safety_score}%` : '86%'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#859397]">Target: 95%</p>
        </div>

      </div>

      {/* Middle Row: Zone Heatmap (Span 8) & PPE Compliance Concentric Gauge (Span 4) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Zone Heatmap Floorplan */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between h-[420px]">
          <div className="flex items-center justify-between mb-3 border-l-4 border-cyan-400 pl-3">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Zone Heatmap</h3>
            <span className="text-[10px] font-mono text-[#859397] bg-[#101415] px-2 py-0.5 rounded border border-[#3c494c]/40">
              LEVEL 4 - SECTOR B
            </span>
          </div>

          {/* Blueprint Thermal Overlay Graphic with exact Stitch asset */}
          <div className="relative rounded-lg overflow-hidden border border-[#3c494c]/40 bg-[#0b121e] flex-1 my-1">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg0ICQ82MtPl7Z20Qcn6s_SB1rR-sp35N6IVFaIvLDee99QL0uEfpCC0jY2bjA9SaaKuO5e0XepQC7jBXGIKQW7lQwL9HyPeWUTt9hGcH8bomrI2d-VUp61aBzxOU1CcpUKUfyUTBFgFN48mAEU04hN7kpDAVhQ-0r8Y_UWBrW1KR7XBc89FMhXlyR9TTXl-6nhPvjM0MqfiFwKDW3xkR0qTt-cM-5E5B9PUiRgnutVjLJR9h_R7OA"
              alt="Floorplan Heatmap"
              className="w-full h-full object-cover opacity-85 mix-blend-screen"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-400/30"></div>
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyan-400/30"></div>
            
            {/* Thermal Hotspots */}
            <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-red-500/40 rounded-full blur-xl pointer-events-none animate-pulse"></div>
            <div className="absolute top-2/3 right-1/4 w-28 h-28 bg-amber-500/40 rounded-full blur-xl pointer-events-none"></div>
            
            {/* Tactical Marker */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <MapPin className="h-5 w-5 text-red-500 font-bold" />
              <span className="text-[10px] font-mono bg-red-950/90 text-red-300 px-1.5 py-0.5 border border-red-500/50 rounded mt-0.5 font-bold">
                Z-12
              </span>
            </div>
          </div>
        </div>

        {/* PPE Compliance Concentric Circles Chart */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between h-[420px]">
          <div className="flex items-center gap-2 mb-2 border-l-4 border-cyan-400 pl-3">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">PPE Compliance</h3>
          </div>

          {/* Concentric Progress Graphic */}
          <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
            {/* Outer ring (Hardhats - 92%) */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="44" stroke="rgba(133, 147, 151, 0.15)" strokeWidth="6"></circle>
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="#68f5b8"
                strokeDasharray="276"
                strokeDashoffset="22"
                strokeWidth="6"
                strokeLinecap="round"
              ></circle>
            </svg>

            {/* Middle ring (Vests - 85%) */}
            <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(133, 147, 151, 0.15)" strokeWidth="6"></circle>
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="#fd8b00"
                strokeDasharray="251"
                strokeDashoffset="37"
                strokeWidth="6"
                strokeLinecap="round"
              ></circle>
            </svg>

            {/* Center score */}
            <div className="text-center z-10">
              <span className="text-3xl font-extrabold font-mono text-[#e0e3e5] block leading-none">78%</span>
              <span className="text-[10px] font-mono text-[#859397]">AVG</span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2 font-mono text-xs pt-2 border-t border-[#3c494c]/30">
            <div className="flex justify-between items-center text-[#bbc9cd]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#68f5b8] rounded-full"></span> Hardhats</span>
              <span className="font-bold text-[#e0e3e5]">92%</span>
            </div>
            <div className="flex justify-between items-center text-[#bbc9cd]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#fd8b00] rounded-full"></span> Vests</span>
              <span className="font-bold text-[#e0e3e5]">85%</span>
            </div>
            <div className="flex justify-between items-center text-[#bbc9cd]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-red-500 rounded-full"></span> Harnesses</span>
              <span className="font-bold text-red-400">58%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom: Recent Violations Feed Table */}
      <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#3c494c]/30 pb-3">
          <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-3">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Recent Violations Feed</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 uppercase cursor-pointer">
            VIEW ALL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#3c494c]/30 text-[#859397] text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">EVIDENCE</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ZONE</th>
                <th className="py-2.5 px-3">TYPE</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c494c]/20">
              {(violations.length > 0 ? violations : [
                { violation_id: '1', zone_name: 'Z-12 (SCAFFOLD)', violation_type: 'Missing Harness', risk_category: 'CRITICAL', created_at: new Date().toISOString() },
                { violation_id: '2', zone_name: 'Z-04 (LOADING)', violation_type: 'No Hi-Vis Vest', risk_category: 'MODERATE', created_at: new Date().toISOString() }
              ]).map((v) => (
                <tr key={v.violation_id} className="hover:bg-[#1d2022]/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="w-14 h-10 rounded bg-[#101415] border border-[#3c494c]/40 overflow-hidden">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa1n-e1YtHop7_7rQ_mkV7lOzayANAX2eTcXnDP0Vv9aaKw_ZBSbwT6zSL4uIg9mmJWiYPJrh9pDLu2PCvWemq3dTIkbeyZRRA8L3OHcpoV-fifsSNifDM7Pa7n5yPh_DnBUSyM-nCp9QJ2UuOExeSZ60qn21DOMZuDOdQ89XOtNvHUrIYGdpx7vYkzMCgosmFc8cCztXswjEUhmDtMv2rZFnnwWOobZMPclFumj6mo5LNxLGYIQmx"
                        alt="Evidence frame"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80";
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#bbc9cd]">14:02:45</td>
                  <td className="py-3 px-3 text-[#e0e3e5] font-bold">{v.zone_name}</td>
                  <td className="py-3 px-3 text-cyan-300">{v.violation_type}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                      v.risk_category?.toLowerCase().includes('crit') ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      ★ {v.risk_category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-cyan-400 hover:text-cyan-300 cursor-pointer p-1">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
