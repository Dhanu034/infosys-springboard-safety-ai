import React from 'react';
import { FileText, Download, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * ExecutiveReportsPage Component (Exact Stitch Image 2 Right Layout)
 * Executive Report overview with Overall Health Score 94, Active High Risks 3,
 * Compliance Rate 98.2%, and Export / Generate Report actions.
 */
export default function ExecutiveReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Executive Report</h2>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider">
            Q3 SAFETY & COMPLIANCE OVERVIEW // PROJECT ALPHA
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Audit Summary Exported as CSV/PDF")}
            className="px-3.5 py-2 rounded-lg bg-[#191c1e] text-[#bbc9cd] hover:text-[#e0e3e5] border border-[#3c494c]/40 text-xs font-mono font-bold flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>EXPORT AUDIT SUMMARY</span>
          </button>

          <button
            onClick={() => alert("Generating Daily Executive Report...")}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-mono font-black flex items-center gap-2 shadow-md glow-cyan"
          >
            <FileText className="h-4 w-4" />
            <span>GENERATE DAILY REPORT</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Overall Health Score */}
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 bg-[#162032] space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-emerald-400 font-bold">SYS-HLTH-01</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#bbc9cd] font-sans">Overall Health Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold font-mono text-[#e0e3e5]">94</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">+2.4% MoM</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#101415] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        {/* Card 2: Active High Risks */}
        <div className="glass-panel p-6 rounded-xl border border-amber-500/30 bg-[#162032] space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-[#ffb77d] font-bold">RSK-ACT-02</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#bbc9cd] font-sans">Active High Risks</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold font-mono text-[#e0e3e5]">3</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">-1 from Prev</span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-[#859397]">ZONE A PPC NON-COMP</p>
        </div>

        {/* Card 3: Compliance Rate */}
        <div className="glass-panel p-6 rounded-xl border border-cyan-500/30 bg-[#162032] space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-cyan-300 font-bold">CMP-RTE-03</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#bbc9cd] font-sans">Compliance Rate</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold font-mono text-[#e0e3e5]">98.2%</span>
              <span className="text-xs font-mono text-[#859397]">TARGET: 99%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#101415] rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '98.2%' }}></div>
          </div>
        </div>

      </div>

    </div>
  );
}
