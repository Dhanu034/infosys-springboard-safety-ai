import React, { useState } from 'react';
import { 
  Bot, Video, FileCheck, FolderCheck, ShieldAlert, Cpu, 
  Activity, Sparkles, HardHat, FileText, Scale, Film,
  ArrowRight, CheckCircle2, AlertTriangle, Layers, Radio,
  Info, Zap, BarChart3, Database, Lock
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

/**
 * AgentNetworkPage Component (Multi-Agent Architecture Topology Hub)
 * Interactive topology graph and operations matrix connecting Central Risk Intelligence Engine,
 * Data Ingestion Streams, Specialized Agents, and Decision Pipelines.
 */
export default function AgentNetworkPage() {
  const { selectedProject, selectedProjectId } = useProject();
  const [selectedAgent, setSelectedAgent] = useState('SiteRiskAgent');

  const agents = [
    {
      id: 'SiteRiskAgent',
      name: 'Site Risk Agent',
      icon: AlertTriangle,
      color: 'text-red-400',
      borderColor: 'border-red-500/40',
      bgColor: 'bg-red-950/20',
      milestone: 'M1 Active',
      status: 'MONITORING HAZARDS',
      role: 'Spatial Hazard & Zone Risk Evaluation',
      formula: 'Risk = min(100, round(P × I × E × ZoneMultiplier))',
      metrics: { tasksProcessed: 142, avgLatency: '8ms', confidence: '99.2%' },
      description: 'Ingests spatial site sensor feeds, worker density metrics, and computes multi-factor hazard escalation scores across 5x5 probability-impact matrices.'
    },
    {
      id: 'SafetyAgent',
      name: 'Safety Agent (PPE)',
      icon: HardHat,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/20',
      milestone: 'M2 Active',
      status: 'EVALUATING PPE',
      role: 'Worker PPE Association & Vision Detection',
      formula: 'Risk = min(100, round(BaseRisk × ZoneMultiplier))',
      metrics: { tasksProcessed: 286, avgLatency: '14ms', confidence: '98.4%' },
      description: 'Performs spatial anchoring over detected worker head and torso regions (upper 35% and middle 40% bounding boxes) to verify mandatory hard hats and safety vests.'
    },
    {
      id: 'ComplianceEngine',
      name: 'Compliance Engine',
      icon: ShieldAlert,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/20',
      milestone: 'M3 Active',
      status: 'VERIFYING STANDARDS',
      role: 'Regulatory Standard & Certificate Audits',
      formula: 'Exact Citation Matching (OSHA 1926, BOCW R231/R212)',
      metrics: { tasksProcessed: 108, avgLatency: '18ms', confidence: '99.5%' },
      description: 'Extracts site documentation via pypdf and pytesseract OCR fallback, classifying evidence into compliant, non-compliant, missing, and human-review states.'
    },
    {
      id: 'InsuranceEngine',
      name: 'Insurance Engine',
      icon: Scale,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/20',
      milestone: 'M3 Active',
      status: 'ADJUDICATING CLAIMS',
      role: 'Actuarial Claim Exposure & Dossiers',
      formula: 'Actuarial Completeness Score (0–100) + Risk Tiering',
      metrics: { tasksProcessed: 48, avgLatency: '12ms', confidence: '97.8%' },
      description: 'Read-only ingestion of safety telemetry to generate 5-item claim dossiers with visual telemetry, supervisor logs, and legal disclaimers.'
    },
    {
      id: 'ReportingAgent',
      name: 'Reporting Agent',
      icon: FileText,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/20',
      milestone: 'M4 Active',
      status: 'SYNTHESIZING EXECUTIVE INTEL',
      role: 'Unified Cross-Agent Synthesis & Reports',
      formula: 'Overall Risk = 0.35S + 0.35C + 0.30I',
      metrics: { tasksProcessed: 64, avgLatency: '22ms', confidence: '100%' },
      description: 'Consolidates safety, compliance, and insurance dimensions into unified risk index with audit logs, CSV exports, and printable HTML/PDF dossiers.'
    },
    {
      id: 'VideoSafetyAgent',
      name: 'Video Safety Agent',
      icon: Film,
      color: 'text-cyan-300',
      borderColor: 'border-cyan-400/40',
      bgColor: 'bg-cyan-950/30',
      milestone: 'Post-M4 Active',
      status: 'SAMPLING OFFLINE FOOTAGE',
      role: 'Offline Video Sampling & Cooldown Grouping',
      formula: '10s Temporal Cooldown De-duplication',
      metrics: { tasksProcessed: 32, avgLatency: '45ms/frame', confidence: '98.1%' },
      description: 'Ingests offline construction site footage, samples frames at 1–2 FPS, groups repeated violations within a 10s cooldown, and dispatches consolidated alerts.'
    },
  ];

  const activeAgentData = agents.find(a => a.id === selectedAgent) || agents[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-cyan-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0 glow-cyan">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
                  Autonomous Multi-Agent Topology
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  6 Collaborating Agents Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-Time Orchestration Graph • Deterministic Mathematical Synergy // {selectedProject?.name || "PROJECT ALPHA"} ({selectedProjectId})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#0b0f10] border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Orchestration Bus: Synchronized</span>
        </div>
      </div>

      {/* Main Interactive Network Topology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Data Feeds & Central Engine */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-3">
            <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-2.5">
              <Radio className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">Input Telemetry Streams</h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              
              <div className="p-3 rounded-lg border border-slate-800 bg-[#0b0f10] flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Video className="h-4 w-4 text-cyan-400" />
                  <span>CCTV & Site Feeds</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  24/24 SENSORS
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-[#0b0f10] flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Film className="h-4 w-4 text-cyan-400" />
                  <span>Offline Video Footage</span>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  MP4 / AVI / MOV
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-[#0b0f10] flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <FileCheck className="h-4 w-4 text-cyan-400" />
                  <span>Inspection Reports</span>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  SYNCED
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-[#0b0f10] flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <FolderCheck className="h-4 w-4 text-cyan-400" />
                  <span>Compliance PDFs</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  21 DOCS
                </span>
              </div>

            </div>
          </div>

          {/* Central Risk Hub Card */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-cyan-400/80 bg-cyan-950/20 text-center space-y-3 glow-cyan">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mx-auto shadow-md">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 font-sans tracking-tight">
                Central Risk Intelligence Engine
              </h3>
              <p className="text-[11px] font-mono text-cyan-300 mt-0.5">
                Deterministic Multi-Agent Collaboration Core
              </p>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400">
              Formula: <strong className="text-amber-300">0.35S + 0.35C + 0.30I</strong>
            </div>
          </div>

        </div>

        {/* Middle & Right Column: Autonomous Collaborating Agents Matrix (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-3">
            <div className="flex items-center justify-between border-l-4 border-cyan-400 pl-2.5">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">
                Active Autonomous AI Agents (Click to Inspect)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Select agent for live telemetry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedAgent === agent.id;

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`p-4 rounded-xl border glass-panel transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-lg glow-cyan ring-1 ring-cyan-400 scale-[1.01]'
                        : `${agent.borderColor} ${agent.bgColor} hover:border-cyan-400/60`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-slate-900 border border-slate-700 ${agent.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 font-sans">{agent.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">{agent.milestone}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-slate-300 line-clamp-2">
                      {agent.role}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800">
                      <span>Tasks: <strong className="text-slate-200">{agent.metrics.tasksProcessed}</strong></span>
                      <span>Latency: <strong className="text-cyan-300">{agent.metrics.avgLatency}</strong></span>
                      <span>Conf: <strong className="text-emerald-300">{agent.metrics.confidence}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Agent Detailed Telemetry & XAI Trace */}
          <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/15 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-cyan-300 uppercase">
                  Agent XAI Decision Logic: {activeAgentData.name}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                100% Deterministic Engine
              </span>
            </div>

            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {activeAgentData.description}
            </p>

            <div className="p-3 rounded-lg bg-[#0b0f10] border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] mb-1">MATHEMATICAL FORMULA & RULESET:</span>
              <span className="text-amber-300 font-bold">{activeAgentData.formula}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">PROCESSED EVENTS</span>
                <span className="font-bold text-slate-100">{activeAgentData.metrics.tasksProcessed}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">AVERAGE LATENCY</span>
                <span className="font-bold text-cyan-300">{activeAgentData.metrics.avgLatency}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ACCURACY RATE</span>
                <span className="font-bold text-emerald-300">{activeAgentData.metrics.confidence}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#0b0f10] border border-[#3c494c]/40 text-center">
        <p className="text-xs font-mono text-[#859397]">
          BuildSure AI Multi-Agent Architecture • Real-Time Synchronization Across Perception, Decision, and Adjudication Agents
        </p>
      </div>

    </div>
  );
}
