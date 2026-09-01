import React from 'react';
import { ShieldAlert, Cpu, Activity, Building2, Bell, RefreshCw } from 'lucide-react';

export default function Header({ selectedProject, setSelectedProject, projects, hazardsCount, onRefresh, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'SITE_RISK', label: 'Site Risk Command Center', milestone: 'M1' },
    { id: 'PPE_DETECTION', label: 'PPE Safety Detection', milestone: 'M2' },
    { id: 'SAFETY_DASHBOARD', label: 'Safety Intelligence Dashboard', milestone: 'M2' },
    { id: 'SAFETY_ALERTS', label: 'Safety Alerts & Audits', milestone: 'M2' },
  ];

  return (
    <header className="glass-panel border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="flex flex-col gap-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Brand Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 glow-cyan">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  BuildSure <span className="text-cyan-400">AI</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Agent Network
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Milestone 1 + 2 Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Agentic Construction Risk Intelligence & Safety Command Center
              </p>
            </div>
          </div>

          {/* Center Active Milestone & Agent Status Indicator */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">Site & Safety Agents Live</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono">
              <Cpu className="h-3.5 w-3.5" />
              <span>YOLOv8 + FastAPI Active</span>
            </div>
          </div>

          {/* Right Select Project & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <select
                  value={selectedProject.id}
                  onChange={(e) => {
                    const prj = projects.find(p => p.id === e.target.value);
                    if (prj) setSelectedProject(prj);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-2"
                >
                  {projects.map((prj) => (
                    <option key={prj.id} value={prj.id} className="bg-slate-900 text-slate-200">
                      {prj.name} ({prj.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={onRefresh}
              title="Refresh AI Ingestion Pipeline"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setActiveTab('SAFETY_ALERTS')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors flex items-center justify-center"
              >
                <Bell className="h-4 w-4" />
                {hazardsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {hazardsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                tab.milestone === 'M1' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {tab.milestone}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

      </div>
    </header>
  );
}
