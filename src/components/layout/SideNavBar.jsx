import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  HardHat,
  BarChart3,
  BellRing,
  Bot,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Settings,
  HelpCircle,
  Building2
} from 'lucide-react';
import { ALL_NAV_ITEMS } from '../../config/demoConfig';

/**
 * SideNavBar Component (BuildSure AI Unified Navigation)
 * Implements the official 64-width fixed sidebar with all 10 modules available.
 */
export default function SideNavBar({ activeTab, setActiveTab }) {
  const iconMap = {
    COMMAND_CENTER: LayoutDashboard,
    SITE_RISK: AlertTriangle,
    PPE_DETECTION: HardHat,
    SAFETY_DASHBOARD: BarChart3,
    SAFETY_ALERTS: BellRing,
    AGENT_NETWORK: Bot,
    COMPLIANCE: ShieldCheck,
    INSURANCE: ShieldAlert,
    REPORTS: FileText,
    SETTINGS: Settings
  };

  return (
    <nav className="bg-[#101415]/95 backdrop-blur-xl h-screen w-64 fixed left-0 top-0 border-r border-[#3c494c]/30 shadow-2xl flex flex-col justify-between py-6 z-50 select-none">
      
      {/* Brand Header */}
      <div>
        <div className="px-6 pb-6 border-b border-[#3c494c]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg glow-cyan shrink-0">
              <Building2 className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-cyan-300 tracking-tight font-sans">BuildSure AI</h2>
              <p className="text-[11px] font-mono text-[#859397] tracking-wide">Risk Intelligence v4.0</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">
          {ALL_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.id] || LayoutDashboard;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'text-cyan-300 font-bold border-r-4 border-cyan-400 bg-cyan-500/10 shadow-sm'
                    : 'text-[#bbc9cd] hover:text-[#e0e3e5] hover:bg-[#1d2022]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-[#859397]'}`} />
                  <span className="font-sans text-[13px]">{item.label}</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                  isActive ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' : 'text-slate-500 border-slate-800'
                }`}>
                  {item.milestone}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Support / System Status Footer */}
      <div className="px-4 pt-4 border-t border-[#3c494c]/30">
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
            activeTab === 'SETTINGS'
              ? 'text-cyan-300 bg-cyan-500/10'
              : 'text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022]/40'
          }`}
        >
          <HelpCircle className="h-4 w-4 text-[#859397]" />
          <span className="font-sans text-[13px]">System Info</span>
        </button>
      </div>

    </nav>
  );
}
