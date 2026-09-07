import React from 'react';
import { Bell, RefreshCw, User, ShieldCheck } from 'lucide-react';

/**
 * TopNavBar Component (Exact Google Stitch Layout)
 * Implements the fixed topbar from Stitch DESIGN.md with live telemetry and project switcher.
 */
export default function TopNavBar({
  selectedProject,
  setSelectedProject,
  projects,
  hazardsCount,
  onRefresh,
  activeTab,
  setActiveTab
}) {
  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 z-40 bg-[#101415]/90 backdrop-blur-md border-b border-[#3c494c]/20 flex justify-between items-center px-6 lg:px-8">
      
      {/* Left: Project Selector / Breadcrumbs */}
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-black text-cyan-300 md:hidden font-sans">BuildSure AI</h1>
        <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
          <span className="text-cyan-300 font-bold border-b-2 border-cyan-400 pb-0.5">Project Alpha</span>
          <select
            value={selectedProject.id}
            onChange={(e) => {
              const prj = projects.find(p => p.id === e.target.value);
              if (prj) setSelectedProject(prj);
            }}
            className="bg-transparent text-xs font-mono text-[#bbc9cd] hover:text-cyan-300 focus:outline-none cursor-pointer border border-[#3c494c]/40 px-2.5 py-1 rounded-lg bg-[#191c1e]/60"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#101415] text-[#e0e3e5]">
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: AI Heartbeat, Notifications, User */}
      <div className="flex items-center gap-4">
        {/* Heartbeat Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wider">AI HEARTBEAT: ACTIVE</span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          title="Refresh Ingestion Pipeline"
          className="p-2 rounded-lg text-[#bbc9cd] hover:text-cyan-300 hover:bg-[#1d2022] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Notifications Bell */}
        <button
          onClick={() => setActiveTab('SAFETY_ALERTS')}
          className="relative p-2 rounded-lg text-[#bbc9cd] hover:text-cyan-300 hover:bg-[#1d2022] transition-colors"
        >
          <Bell className="h-4 w-4" />
          {hazardsCount > 0 && (
            <span className="absolute 1 top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
          <User className="h-4 w-4" />
        </div>
      </div>

    </header>
  );
}
