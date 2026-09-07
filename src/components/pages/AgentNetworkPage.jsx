import React from 'react';
import { Bot, Video, FileCheck, FolderCheck, ShieldAlert, Cpu, Activity, Sparkles, HardHat, FileText, Scale } from 'lucide-react';

/**
 * AgentNetworkPage Component (Exact Stitch Image 1 Layout)
 * Interactive Multi-Agent Network Topology Graph connecting Central Intelligence Engine,
 * Input Data streams (CCTV, Inspection, Docs), and Autonomous Agents.
 */
export default function AgentNetworkPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Agent Network Architecture</h2>
        <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider">
          AUTONOMOUS MULTI-AGENT TOPOLOGY & ORCHESTRATION GRAPH
        </p>
      </div>

      {/* Network Canvas */}
      <div className="glass-panel p-8 rounded-2xl border border-[#3c494c]/30 min-h-[540px] flex items-center justify-center relative overflow-hidden bg-[#0b121e]/90">
        
        {/* Subtle Connecting SVG Curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-cyan-500/30" fill="none">
          {/* Left Inputs to Center */}
          <path d="M 220 160 Q 360 220 480 270" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
          <path d="M 220 270 Q 350 270 480 270" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 220 380 Q 360 320 480 270" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />

          {/* Center to Right Agents */}
          <path d="M 720 270 Q 820 140 920 140" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 720 270 Q 820 200 920 200" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
          <path d="M 720 270 Q 820 270 920 270" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 720 270 Q 820 340 920 340" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
          <path d="M 720 270 Q 820 400 920 400" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        {/* 3-Column Node Layout */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Data Ingestion Feeds (Span 3) */}
          <div className="col-span-12 md:col-span-3 space-y-5">
            
            <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-[#162032] space-y-1 hover:border-cyan-400 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
                <Video className="h-4 w-4" />
                <span>CCTV Feeds</span>
              </div>
              <p className="text-[11px] font-mono text-emerald-400">Live: 24/24</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-[#162032] space-y-1 hover:border-cyan-400 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
                <FileCheck className="h-4 w-4" />
                <span>Inspection Reports</span>
              </div>
              <p className="text-[11px] font-mono text-cyan-400/80">Sync: 1m ago</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-[#162032] space-y-1 hover:border-cyan-400 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
                <FolderCheck className="h-4 w-4" />
                <span>Compliance Docs</span>
              </div>
              <p className="text-[11px] font-mono text-[#859397]">Status: Current</p>
            </div>

          </div>

          {/* Center Column: Core Engine Hub (Span 5) */}
          <div className="col-span-12 md:col-span-5 flex justify-center">
            <div className="glass-panel p-8 rounded-2xl border-2 border-cyan-400 bg-cyan-950/30 shadow-2xl glow-cyan text-center space-y-4 max-w-sm w-full relative">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mx-auto shadow-md">
                <Cpu className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#e0e3e5] font-sans tracking-tight">
                  Construction Risk Intelligence Engine
                </h3>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  CORE: PROCESSING
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Autonomous Agents (Span 4) */}
          <div className="col-span-12 md:col-span-4 space-y-3">
            
            <div className="glass-panel p-3.5 rounded-xl border border-red-500/40 bg-[#162032] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e0e3e5] font-sans">Site Risk Agent</h4>
                <p className="text-[10px] font-mono text-red-400">Analyzing...</p>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-emerald-500/40 bg-[#162032] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                <HardHat className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e0e3e5] font-sans">Safety Agent</h4>
                <p className="text-[10px] font-mono text-emerald-400">Monitoring PPE</p>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/40 bg-[#162032] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e0e3e5] font-sans">Compliance Agent</h4>
                <p className="text-[10px] font-mono text-cyan-400">Validating Docs</p>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-amber-500/40 bg-[#162032] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-[#ffb77d] shrink-0">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e0e3e5] font-sans">Insurance Agent</h4>
                <p className="text-[10px] font-mono text-amber-400">Calculating Premium</p>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-[#3c494c]/50 bg-[#162032] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-[#859397] shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e0e3e5] font-sans">Reporting Agent</h4>
                <p className="text-[10px] font-mono text-[#859397]">Generating PDF</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
