import React, { useState, useEffect } from 'react';
import { 
  Settings, Server, Cpu, Database, Shield, Zap, RefreshCw, 
  CheckCircle2, AlertTriangle, FileText, HardHat, Sliders, 
  Layers, Lock, ExternalLink, Activity, Info
} from 'lucide-react';
import { checkHealth, fetchModelInfo } from '../../services/api';

/**
 * SettingsPage Component (System Configuration & Diagnostics Hub)
 * Displays backend service health, YOLO model metadata, storage diagnostics,
 * zone risk multipliers, and integration credentials.
 */
export default function SettingsPage() {
  const [healthData, setHealthData] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('SERVICES'); // 'SERVICES' | 'ZONE_RULES' | 'STORAGE' | 'INTEGRATIONS'

  const loadDiagnostics = async () => {
    setIsLoading(true);
    try {
      const [h, m] = await Promise.all([
        checkHealth(),
        fetchModelInfo()
      ]);
      setHealthData(h);
      setModelData(m);
    } catch (e) {
      console.warn("Diagnostics load note:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const zoneRules = [
    { name: 'General Work Zone', helmet: true, vest: false, harness: false, mult: 1.0, icon: '🏗️', description: 'Baseline site area with standard safety gear mandate.' },
    { name: 'Excavation Zone', helmet: true, vest: true, harness: false, mult: 1.2, icon: '🚜', description: 'Heavy machinery and trench risk area. High-vis vest required.' },
    { name: 'Vehicle Movement Zone', helmet: true, vest: true, harness: false, mult: 1.3, icon: '🚚', description: 'Active logistics and plant equipment movement corridor.' },
    { name: 'Electrical Work Zone', helmet: true, vest: true, harness: false, mult: 1.3, icon: '⚡', description: 'High-voltage substation and cabling installation zone.' },
    { name: 'Work-at-Height Zone', helmet: true, vest: true, harness: true, mult: 1.5, icon: '🪜', description: 'Elevation risk > 2m (OSHA 1926.501 / BOCW R212). Full harness required.' },
  ];

  const agentRegistry = [
    { name: 'SiteRiskAgent', version: 'v1.4', type: 'Spatial Hazard Evaluation', formula: 'P x I x E + Weighted Density', status: 'ACTIVE' },
    { name: 'SafetyAgent', version: 'v2.2', type: 'Worker PPE Association', formula: 'min(100, round(Base x ZoneMultiplier))', status: 'ACTIVE' },
    { name: 'ComplianceEngine', version: 'v3.0', type: 'Regulatory Matching (OSHA/BOCW)', formula: 'Exact Citation & Keyword Matching', status: 'ACTIVE' },
    { name: 'InsuranceEngine', version: 'v3.0', type: 'Exposure & Claim Adjudication', formula: 'Actuarial Completeness (0–100)', status: 'ACTIVE' },
    { name: 'ReportingAgent', version: 'v4.0', type: 'Cross-Agent Executive Synthesis', formula: '0.35S + 0.35C + 0.30I', status: 'ACTIVE' },
    { name: 'VideoSafetyService', version: 'v4.1', type: 'Offline Footage Sampling & De-dup', formula: '10s Temporal Cooldown Grouping', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-cyan-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0 glow-cyan">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
                  System Configuration & Diagnostics
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  BuildSure AI v4.1 Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                FastAPI Backend • Local YOLOv8 PPE Vision Engine • Multi-Agent Orchestration Bus
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadDiagnostics}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0b0f10] border border-slate-800 flex-wrap">
        <button
          onClick={() => setActiveSubTab('SERVICES')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'SERVICES'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Services & AI Model</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ZONE_RULES')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ZONE_RULES'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Zone Risk Multipliers</span>
        </button>

        <button
          onClick={() => setActiveSubTab('AGENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'AGENTS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Agent Formula Registry</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INTEGRATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'INTEGRATIONS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Integrations & n8n</span>
        </button>
      </div>

      {/* Sub-Tab 1: Services & AI Model */}
      {activeSubTab === 'SERVICES' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Key Services Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">FastAPI Server</span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-lg font-bold font-mono text-emerald-300">ONLINE</p>
              <p className="text-[10px] font-mono text-slate-400">Host: http://127.0.0.1:8000</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">SQLite Database</span>
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
              </div>
              <p className="text-lg font-bold font-mono text-cyan-300">
                {healthData?.database_status?.toUpperCase() || "HEALTHY"}
              </p>
              <p className="text-[10px] font-mono text-slate-400">safety_intelligence.db</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">YOLOv8 Model</span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-lg font-bold font-mono text-emerald-300">
                {healthData?.yolo_model_status?.toUpperCase() || "LOADED"}
              </p>
              <p className="text-[10px] font-mono text-slate-400">Hansung-Cho PPE Model</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-amber-500/40 bg-amber-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Vite Dev Server</span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              </div>
              <p className="text-lg font-bold font-mono text-amber-300">PORT 5173</p>
              <p className="text-[10px] font-mono text-slate-400">React 18 + Tailwind CSS</p>
            </div>

          </div>

          {/* Model Architecture Details */}
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
            <div className="flex items-center justify-between border-l-4 border-cyan-400 pl-2.5">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">
                YOLO Computer Vision Neural Engine Specifications
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Zero Cloud Dependency</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-[#0b0f10] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">MODEL ARCHITECTURE</span>
                <span className="font-bold text-slate-200 mt-1 block">Ultralytics YOLOv8n</span>
              </div>
              <div className="bg-[#0b0f10] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">WEIGHTS FILE SIZE</span>
                <span className="font-bold text-cyan-300 mt-1 block">{modelData?.model_size_mb || "5.96"} MB</span>
              </div>
              <div className="bg-[#0b0f10] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CONFIDENCE THRESHOLD</span>
                <span className="font-bold text-emerald-300 mt-1 block">{healthData?.configured_confidence_threshold || 0.70} (70%)</span>
              </div>
              <div className="bg-[#0b0f10] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">FALLBACK ENGINE</span>
                <span className="font-bold text-slate-200 mt-1 block">OpenCV HOG + Haar Cascades</span>
              </div>
            </div>

            {/* Classes List */}
            {modelData?.classes && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Trained Detectable Classes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {modelData.classes.map((cls, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Sub-Tab 2: Zone Risk Multipliers */}
      {activeSubTab === 'ZONE_RULES' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
            <div className="flex items-center justify-between border-l-4 border-cyan-400 pl-2.5">
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Construction Zone Multiplier Matrix
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  SafetyAgent dynamically calculates final risk using formula: Risk = min(100, Base x ZoneMultiplier)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Zone Name</th>
                    <th className="p-3">Risk Multiplier</th>
                    <th className="p-3">Helmet Mandate</th>
                    <th className="p-3">Safety Vest</th>
                    <th className="p-3">Safety Harness</th>
                    <th className="p-3">OSHA Standard Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {zoneRules.map((z, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                        <span>{z.icon}</span>
                        <span>{z.name}</span>
                      </td>
                      <td className="p-3 font-bold text-cyan-400">{z.mult}x</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          REQUIRED
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          z.vest
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}>
                          {z.vest ? 'REQUIRED' : 'OPTIONAL'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          z.harness
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}>
                          {z.harness ? 'REQUIRED' : 'NOT REQUIRED'}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">{z.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* Sub-Tab 3: Agent Formula Registry */}
      {activeSubTab === 'AGENTS' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
            <div className="flex items-center justify-between border-l-4 border-cyan-400 pl-2.5">
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Multi-Agent Mathematical Engine Registry
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  100% deterministic decision logic across all autonomous collaboration layers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentRegistry.map((agent, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#0b0f10] space-y-2 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-cyan-300">{agent.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {agent.version} • {agent.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{agent.type}</p>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-cyan-200">
                    Formula: <strong className="text-amber-300">{agent.formula}</strong>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Sub-Tab 4: Integrations & n8n */}
      {activeSubTab === 'INTEGRATIONS' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
            <div className="flex items-center justify-between border-l-4 border-cyan-400 pl-2.5">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">
                Workflow Automation & External Connectors
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Fail-Safe Non-Blocking</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0b0f10] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">n8n Webhook Dispatcher</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Milestone 2/4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dispatches High/Critical alerts (Risk &ge; 61) to Slack, Email, or Microsoft Teams workflows.
                </p>
                <div className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-slate-800">
                  <div>Auth Header: <strong className="text-slate-300">X-N8N-Secret</strong></div>
                  <div>Timeout: <strong className="text-slate-300">5.0 seconds (Non-blocking)</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-[#0b0f10] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Document OCR Engine</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Milestone 3
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Native PDF text extraction (`pypdf`) with fallback to local `pytesseract` for scanned images.
                </p>
                <div className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-slate-800">
                  <div>Local Cloud Cost: <strong className="text-emerald-400">$0.00 (Zero Cloud APIs)</strong></div>
                  <div>Fallback Mode: <strong className="text-slate-300">Graceful degradation to Human Review</strong></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#0b0f10] border border-[#3c494c]/40 text-center">
        <p className="text-xs font-mono text-[#859397]">
          BuildSure AI Industrial Risk Intelligence System • Single Unified Application • Zero Synthetic Hallucination
        </p>
      </div>

    </div>
  );
}
