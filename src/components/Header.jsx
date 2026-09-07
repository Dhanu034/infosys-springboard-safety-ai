import React from 'react';
import { ShieldAlert, Cpu, Activity, Building2, Bell, RefreshCw, Layers, HardHat, BarChart3, AlertOctagon } from 'lucide-react';
import BilingualLabel from './ui/BilingualLabel';

/**
 * Header Component (Phase 2 Redesign)
 * Command-center HUD topbar styled according to DESIGN.md
 * (Industrial Precision Glassmorphism, Blueprint Grid Aesthetic, Bilingual Labels, Electric Cyan Accents).
 */
export default function Header({
  selectedProject,
  setSelectedProject,
  projects,
  hazardsCount,
  onRefresh,
  activeTab,
  setActiveTab
}) {
  const tabs = [
    {
      id: 'SITE_RISK',
      label: 'Site Risk Command',
      labelTa: 'தள அபாய மையம்',
      milestone: 'M1',
      icon: Layers
    },
    {
      id: 'PPE_DETECTION',
      label: 'PPE Vision Detection',
      labelTa: 'பாதுகாப்பு கவசம் ஆய்வு',
      milestone: 'M2',
      icon: HardHat
    },
    {
      id: 'SAFETY_DASHBOARD',
      label: 'Safety Intelligence',
      labelTa: 'பாதுகாப்பு பகுப்பாய்வு',
      milestone: 'M2',
      icon: BarChart3
    },
    {
      id: 'SAFETY_ALERTS',
      label: 'Alerts & Audit Feed',
      labelTa: 'எச்சரிக்கைகள் & தணிக்கை',
      milestone: 'M2',
      icon: AlertOctagon
    },
  ];

  return (
    <header className="glass-panel border-b border-slate-800/90 sticky top-0 z-40 px-4 lg:px-8 py-3.5 backdrop-blur-xl bg-[#101415]/90">
      <div className="flex flex-col gap-3.5 max-w-7xl mx-auto w-full">
        
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-slate-900 flex items-center justify-center text-slate-950 font-black shadow-lg glow-cyan shrink-0 border border-cyan-400/40">
              <ShieldAlert className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-1.5 font-sans">
                  <span>BuildSure</span>
                  <span className="text-cyan-400 font-mono font-bold">AI</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Command Center
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  M1 + M2 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Agentic Construction Risk Intelligence & Safety Platform
              </p>
            </div>
          </div>

          {/* Center Telemetry Pulse */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-200 font-semibold">Agents Active</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Cpu className="h-3.5 w-3.5" />
              <span>YOLO Vision & n8n Ready</span>
            </div>
          </div>

          {/* Right Project Selector & Action Controls */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            
            {/* Project Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-[#0b0f10] border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/50 transition-colors">
                <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <select
                  value={selectedProject.id}
                  onChange={(e) => {
                    const prj = projects.find(p => p.id === e.target.value);
                    if (prj) setSelectedProject(prj);
                  }}
                  className="bg-transparent text-xs font-mono font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {projects.map((prj) => (
                    <option key={prj.id} value={prj.id} className="bg-slate-900 text-slate-200">
                      {prj.name} ({prj.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              title="Refresh AI Ingestion Pipeline"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Safety Alerts Button */}
            <button
              onClick={() => setActiveTab('SAFETY_ALERTS')}
              title="View Safety Alerts & Audit Feed"
              className={`p-2 rounded-xl border relative transition-colors flex items-center justify-center ${
                activeTab === 'SAFETY_ALERTS'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40'
              }`}
            >
              <Bell className="h-4 w-4" />
              {hazardsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold font-mono text-white flex items-center justify-center animate-pulse shadow-md">
                  {hazardsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2.5 border-t border-slate-800/80 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50 shadow-sm glow-cyan'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  tab.milestone === 'M1'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {tab.milestone}
                </span>
                <span className="font-sans">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
