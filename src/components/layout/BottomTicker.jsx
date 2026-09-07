import React from 'react';

/**
 * BottomTicker Component (Exact Google Stitch Layout)
 * Fixed bottom HUD status ticker matching DESIGN.md.
 */
export default function BottomTicker() {
  return (
    <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] h-8 bg-[#101415]/95 backdrop-blur-md border-t border-[#3c494c]/30 z-30 px-6 flex items-center justify-between text-[11px] font-mono text-[#859397]">
      <div className="flex items-center gap-4 truncate">
        <span className="text-[#e0e3e5] font-semibold">BuildSure AI Command Center</span>
        <span>|</span>
        <span>Agent Status: <strong className="text-emerald-400 font-normal">Site Risk (Online)</strong>, <strong className="text-emerald-400 font-normal">Safety (Online)</strong>, <strong className="text-cyan-400 font-normal">Compliance (Standby)</strong></span>
      </div>
      <div className="hidden lg:flex items-center gap-6 text-[10px] text-cyan-400/80">
        <span className="hover:text-cyan-300 cursor-pointer">AGENT NETWORK</span>
        <span className="hover:text-cyan-300 cursor-pointer">SYSTEM HEALTH</span>
        <span className="hover:text-cyan-300 cursor-pointer">SECURITY PROTOCOL</span>
      </div>
    </footer>
  );
}
