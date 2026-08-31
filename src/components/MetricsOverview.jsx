import React from 'react';
import { AlertTriangle, MapPin, Users, Activity, CheckCircle2, TrendingUp } from 'lucide-react';

export default function MetricsOverview({ project, hazards, zones }) {
  const criticalCount = hazards.filter(h => h.severity === 'CRITICAL').length;
  const highCount = hazards.filter(h => h.severity === 'HIGH').length;
  const totalActiveHazards = hazards.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Metric 1: Active Site Risks */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Active Site Hazards</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1 flex items-baseline gap-2">
              {totalActiveHazards}
              <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                {criticalCount} Critical
              </span>
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>Escalated Workflows</span>
          <span className="font-semibold text-slate-200">{criticalCount + highCount} High Priority</span>
        </div>
      </div>

      {/* Metric 2: High-Risk Zones */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">High-Risk Site Zones</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1 flex items-baseline gap-2">
              {zones.filter(z => z.riskLevel === 'CRITICAL' || z.riskLevel === 'HIGH').length}
              <span className="text-xs text-slate-400 font-normal">/ {zones.length} Zones</span>
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MapPin className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>Highest Risk Area</span>
          <span className="font-semibold text-amber-400 truncate max-w-[140px]">Zone A: Excavation</span>
        </div>
      </div>

      {/* Metric 3: Active Worker Density */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Workers Monitored</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1 flex items-baseline gap-2">
              {project.totalWorkers}
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> Live
              </span>
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>High Hazard Exposure</span>
          <span className="font-semibold text-slate-200">107 Workers in Zone A/C</span>
        </div>
      </div>

      {/* Metric 4: Site Risk Index */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all glow-amber">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-300">Site Risk Score Index</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1 flex items-baseline gap-2">
              {project.overallRiskScore}
              <span className="text-xs font-semibold text-amber-300">/ 100</span>
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-amber-300/80 border-t border-amber-500/20 pt-2">
          <span>Status Rating</span>
          <span className="font-bold text-amber-400 uppercase tracking-wider">{project.status}</span>
        </div>
      </div>

    </div>
  );
}
