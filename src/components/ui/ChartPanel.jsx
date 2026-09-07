import React from 'react';
import BilingualLabel from './BilingualLabel';

/**
 * ChartPanel Component
 * Glassmorphic container with 12px rounding, subtle blueprint styling,
 * header title, optional bilingual subtitle, and header action controls.
 */
export default function ChartPanel({
  title,
  titleTa,
  subtitle,
  icon: Icon,
  actions,
  badge,
  children,
  className = "",
  contentClassName = ""
}) {
  return (
    <div className={`glass-panel p-5 lg:p-6 transition-all ${className}`}>
      {/* Panel Header */}
      {(title || actions || Icon) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-start gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mt-0.5 shrink-0">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <BilingualLabel
                  en={title}
                  ta={titleTa}
                  enClassName="text-base font-bold text-slate-100 tracking-tight"
                />
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content Body */}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
}
