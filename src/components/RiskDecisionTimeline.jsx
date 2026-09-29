import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ShieldAlert, 
  HardHat, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { fetchRiskDecisionTimeline } from '../services/api';

/**
 * RiskDecisionTimeline Component (Milestone 4 Creative Enhancement)
 * Renders a real-time chronological event stream of autonomous AI decisions,
 * safety violations, regulatory evaluations, inspection milestones, and insurance audits.
 */
export default function RiskDecisionTimeline({ 
  projectId = "PRJ-101", 
  fromDate = null, 
  toDate = null, 
  onNavigateTab 
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRiskDecisionTimeline(projectId, fromDate, toDate, 30);
      setEvents(data || []);
    } catch (err) {
      console.error("Error loading risk decision timeline:", err);
      setError("Unable to load risk timeline events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [projectId, fromDate, toDate]);

  // Map Agent & Event Type to Icons & Tabs
  const getEventMeta = (event) => {
    switch (event.event_type) {
      case 'PPE_VIOLATION':
      case 'PPE_COMPLIANCE_CHECK':
        return {
          icon: HardHat,
          color: event.severity === 'LOW' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/80' : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/80',
          tabId: 'PPE_DETECTION',
          tabLabel: 'PPE Safety'
        };
      case 'SAFETY_ALERT':
        return {
          icon: AlertTriangle,
          color: event.severity === 'CRITICAL' ? 'text-rose-400 border-rose-500/40 bg-rose-950/80' : 'text-amber-400 border-amber-500/40 bg-amber-950/80',
          tabId: 'SAFETY_ALERTS',
          tabLabel: 'Alert Center'
        };
      case 'COMPLIANCE_EVALUATION':
        return {
          icon: ShieldCheck,
          color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/80',
          tabId: 'COMPLIANCE',
          tabLabel: 'Compliance Hub'
        };
      case 'INSPECTION_SCHEDULE':
        return {
          icon: Calendar,
          color: event.severity === 'CRITICAL' ? 'text-rose-400 border-rose-500/40 bg-rose-950/80' : 'text-blue-400 border-blue-500/40 bg-blue-950/80',
          tabId: 'COMPLIANCE',
          tabLabel: 'Schedules'
        };
      case 'INSURANCE_ASSESSMENT':
        return {
          icon: ShieldAlert,
          color: 'text-amber-400 border-amber-500/40 bg-amber-950/80',
          tabId: 'INSURANCE',
          tabLabel: 'Insurance Intel'
        };
      case 'REPORT_AUDIT':
      default:
        return {
          icon: FileText,
          color: 'text-slate-400 border-slate-700 bg-slate-900',
          tabId: null,
          tabLabel: 'Audit'
        };
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/80 border-rose-500/40';
      case 'HIGH':
        return 'text-amber-400 bg-amber-950/80 border-amber-500/40';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/80 border-yellow-500/40';
      case 'LOW':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
      case 'INFO':
      default:
        return 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4 font-mono">
      
      {/* Timeline Header */}
      <div className="flex items-center justify-between border-b border-[#3c494c]/30 pb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
          <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Risk Decision Timeline</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            REAL-TIME CHRONOLOGY
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">NEWEST FIRST</span>
          <button
            onClick={loadTimeline}
            title="Refresh Timeline"
            className="p-1 rounded bg-[#101415] hover:bg-[#1d2022] text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 text-center space-y-2">
          <RefreshCw className="h-5 w-5 mx-auto animate-spin text-cyan-400" />
          <p className="text-xs text-[#859397]">Aggregating chronological decision traces...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="py-6 text-center space-y-2 text-rose-400 text-xs">
          <AlertTriangle className="h-5 w-5 mx-auto text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && events.length === 0 && (
        <div className="py-8 text-center space-y-2 border border-dashed border-[#3c494c]/40 rounded-xl bg-[#101415]/50">
          <Info className="h-5 w-5 mx-auto text-slate-500" />
          <p className="text-xs text-slate-400">No decision events recorded for the selected project and period.</p>
        </div>
      )}

      {/* Vertical Timeline List */}
      {!loading && !error && events.length > 0 && (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-cyan-500/60 before:via-[#3c494c]/40 before:to-transparent">
          {events.map((ev, index) => {
            const meta = getEventMeta(ev);
            const Icon = meta.icon;

            return (
              <div key={ev.event_id || index} className="relative group animate-in fade-in slide-in-from-left-2 duration-200">
                
                {/* Timeline Dot Icon */}
                <div className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-md ${meta.color}`}>
                  <Icon className="h-3 w-3 shrink-0" />
                </div>

                {/* Event Card */}
                <div className="p-3.5 rounded-xl bg-[#101415] border border-[#3c494c]/40 hover:border-cyan-500/40 transition-all space-y-1.5 shadow-sm">
                  
                  {/* Top Bar: Event Type & Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300">{ev.source_agent}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{ev.event_type?.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-slate-500">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Title & Severity Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-bold text-slate-200 font-sans">
                      {ev.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getSeverityBadge(ev.severity)}`}>
                      {ev.severity || ev.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {ev.description}
                  </p>

                  {/* Drill Down Source Link */}
                  {meta.tabId && onNavigateTab && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onNavigateTab(meta.tabId)}
                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors"
                      >
                        <span>View in {meta.tabLabel}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
