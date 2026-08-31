import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsOverview from './components/MetricsOverview';
import SiteMapGrid from './components/SiteMapGrid';
import RiskHeatmapMatrix from './components/RiskHeatmapMatrix';
import HazardDetectionPanel from './components/HazardDetectionPanel';
import RiskAnalyticsCharts from './components/RiskAnalyticsCharts';
import SimulatorControls from './components/SimulatorControls';
import AgentReasoningDrawer from './components/AgentReasoningDrawer';
import { MOCK_PROJECTS, MOCK_SITE_ZONES, MOCK_HAZARDS } from './data/mockSiteData';
import { siteRiskAgent } from './agents/SiteRiskAgent';
import { ShieldAlert, AlertCircle, Info, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [projects] = useState(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);
  const [zones, setZones] = useState(MOCK_SITE_ZONES);
  const [hazards, setHazards] = useState([]);
  const [selectedHazardForTrace, setSelectedHazardForTrace] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize and evaluate hazards with Site Risk Agent on mount or project change
  useEffect(() => {
    const evaluated = siteRiskAgent.evaluateHazards(MOCK_HAZARDS);
    setHazards(evaluated);
  }, [selectedProject]);

  // Handle Refresh
  const handleRefreshPipeline = () => {
    const freshEvaluated = siteRiskAgent.evaluateHazards(hazards);
    setHazards(freshEvaluated);
    showToast("Site Risk Agent re-evaluated all active hazards against OSHA standards.");
  };

  // Handle Event Simulation
  const handleTriggerSimulatedEvent = (eventType) => {
    const result = siteRiskAgent.processSimulatedEvent(eventType, hazards);
    if (result && result.newHazard) {
      const updatedHazardList = [result.newHazard, ...hazards];
      const newlyEvaluated = siteRiskAgent.evaluateHazards(updatedHazardList);
      setHazards(newlyEvaluated);
      showToast(result.logMessage);

      // Dynamically bump project overall risk score
      setSelectedProject(prev => ({
        ...prev,
        overallRiskScore: Math.min(98, prev.overallRiskScore + 5)
      }));
    }
  };

  // Handle Reset
  const handleResetFeed = () => {
    const initialEvaluated = siteRiskAgent.evaluateHazards(MOCK_HAZARDS);
    setHazards(initialEvaluated);
    setZones(MOCK_SITE_ZONES);
    setSelectedProject(MOCK_PROJECTS[0]);
    showToast("Reset simulation feed to baseline site telemetry state.");
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Header
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
        hazardsCount={hazards.length}
        onRefresh={handleRefreshPipeline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center justify-between shadow-lg glow-cyan animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <span className="text-[10px] font-mono opacity-75">SiteRiskAgent Alert</span>
          </div>
        )}

        {/* Live Simulator Trigger Bar */}
        <SimulatorControls
          onTriggerEvent={handleTriggerSimulatedEvent}
          onReset={handleResetFeed}
        />

        {/* Top Key Metrics Overview */}
        <MetricsOverview
          project={selectedProject}
          hazards={hazards}
          zones={zones}
        />

        {/* Interactive Spatial Site Map Grid */}
        <SiteMapGrid
          zones={zones}
          onSelectZone={(zone) => {
            showToast(`Inspecting ${zone.name}. Active Risk Score: ${zone.riskScore}`);
          }}
        />

        {/* 5x5 Probability vs Impact Risk Heatmap Matrix */}
        <RiskHeatmapMatrix
          hazards={hazards}
        />

        {/* Live Hazard Detection & AI Recommendation Cards */}
        <HazardDetectionPanel
          hazards={hazards}
          onInspectReasoning={(hazard) => setSelectedHazardForTrace(hazard)}
        />

        {/* Risk Distribution & Historical Trend Charts */}
        <RiskAnalyticsCharts />

      </main>

      {/* Slide-out Agent XAI Decision Trace Drawer */}
      <AgentReasoningDrawer
        hazard={selectedHazardForTrace}
        onClose={() => setSelectedHazardForTrace(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 lg:px-8 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BuildSure AI — Agentic Construction Risk Intelligence Platform</span>
          <span className="font-mono text-[11px]">Infosys Springboard Internship • Milestone 1 (Week 1–2 Release)</span>
        </div>
      </footer>

    </div>
  );
}
