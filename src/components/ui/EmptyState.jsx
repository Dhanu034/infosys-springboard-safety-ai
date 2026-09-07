import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import BilingualLabel from './BilingualLabel';

/**
 * EmptyState Component
 * Honest, clear empty state placeholder adhering to DESIGN.md.
 */
export default function EmptyState({
  title = "No Data Recorded",
  titleTa,
  message = "No active records found matching the current criteria.",
  icon: Icon = ShieldCheck,
  action,
  className = ""
}) {
  return (
    <div className={`glass-panel p-10 lg:p-12 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
        <Icon className="h-7 w-7 opacity-75" />
      </div>

      <div className="space-y-1 max-w-sm">
        <BilingualLabel
          en={title}
          ta={titleTa}
          enClassName="text-sm font-bold text-slate-200"
        />
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          {message}
        </p>
      </div>

      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}
