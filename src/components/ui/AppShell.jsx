import React from 'react';

/**
 * AppShell Component
 * Blueprint-grid canvas wrapper with dark command-center aesthetic,
 * architectural header framing, and responsive grid layout.
 */
export default function AppShell({ header, children, footer, className = "" }) {
  return (
    <div className="min-h-screen bg-[#101415] text-[#e0e3e5] blueprint-grid flex flex-col font-sans relative selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Ambient Tactical Atmosphere Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Slot */}
      {header}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 ${className}`}>
        {children}
      </main>

      {/* Footer Slot */}
      {footer}
    </div>
  );
}
