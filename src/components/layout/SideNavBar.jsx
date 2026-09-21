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
  Building2,
  Sparkles
} from 'lucide-react';
import { isHackathonDemoMode, DEMO_ALLOWED_TAB_IDS } from '../../config/demoConfig';

/**
 * SideNavBar Component (Exact Google Stitch Layout)
 * Implements the official 64-width fixed sidebar with dynamic Hackathon Demo Mode filtering.
 */
export default function SideNavBar({ activeTab, setActiveTab }) {
  const isDemo = isHackathonDemoMode();

  const allNavItems = [
    { id: 'COMMAND_CENTER', label: 'Command Center', icon: LayoutDashboard },
    { id: 'SITE_RISK', label: 'Site Risk', icon: AlertTriangle },
    { id: 'PPE_DETECTION', label: 'PPE Safety', icon: HardHat },
    { id: 'SAFETY_DASHBOARD', label: 'Safety Dashboard', icon: BarChart3 },
    { id: 'SAFETY_ALERTS', label: 'Alert Center', icon: BellRing },
    { id: 'AGENT_NETWORK', label: 'Agent Network', icon: Bot },
    { id: 'COMPLIANCE', label: 'Compliance', icon: ShieldCheck },
    { id: 'INSURANCE', label: 'Insurance', icon: ShieldAlert },
    { id: 'REPORTS', label: 'Reports', icon: FileText },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  const visibleNavItems = isDemo 
    ? allNavItems.filter(item => DEMO_ALLOWED_TAB_IDS.includes(item.id))
    : allNavItems;

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
              <p className="text-[11px] font-mono text-[#859397] tracking-wide">Vigilance System v2.4</p>
              {isDemo && (
                <div className="mt-1 flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  <Sparkles className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                  <span>HACKATHON DEMO</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'text-cyan-300 font-bold border-r-4 border-cyan-400 bg-cyan-500/10 shadow-sm'
                    : 'text-[#bbc9cd] hover:text-[#e0e3e5] hover:bg-[#1d2022]/60'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-[#859397]'}`} />
                <span className="font-sans text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Support Footer Link (Shown only in full mode or non-demo) */}
      {!isDemo && (
        <div className="px-4 pt-4 border-t border-[#3c494c]/30">
          <button
            onClick={() => setActiveTab('SUPPORT')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeTab === 'SUPPORT'
                ? 'text-cyan-300 bg-cyan-500/10'
                : 'text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022]/40'
            }`}
          >
            <HelpCircle className="h-4 w-4 shrink-0 text-[#859397]" />
            <span className="font-sans text-[13px]">Support</span>
          </button>
        </div>
      )}

    </nav>
  );
}

