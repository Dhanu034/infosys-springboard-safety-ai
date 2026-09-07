import React, { useState, useEffect } from 'react';

// Layout Components
import SideNavBar from './components/layout/SideNavBar';
import TopNavBar from './components/layout/TopNavBar';
import BottomTicker from './components/layout/BottomTicker';

// Page Views (Exact Google Stitch Layouts)
import CommandCenterPage from './components/pages/CommandCenterPage';
import SiteRiskPage from './components/pages/SiteRiskPage';
import PPESafetyPage from './components/pages/PPESafetyPage';
import SafetyDashboardPage from './components/pages/SafetyDashboardPage';
import AlertCenterPage from './components/pages/AlertCenterPage';
import AgentNetworkPage from './components/pages/AgentNetworkPage';
import ExecutiveReportsPage from './components/pages/ExecutiveReportsPage';

// Agent Reasoning Drawer
import AgentReasoningDrawer from './components/AgentReasoningDrawer';

import { MOCK_PROJECTS, MOCK_SITE_ZONES, MOCK_HAZARDS } from './data/mockSiteData';
import { siteRiskAgent } from './agents/SiteRiskAgent';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [projects] = useState(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);
  const [zones, setZones] = useState(MOCK_SITE_ZONES);
  const [hazards, setHazards] = useState([]);
  const [selectedHazardForTrace, setSelectedHazardForTrace] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Active Tab State (Exact Stitch Navigation Keys)
  const [activeTab, setActiveTab] = useState('COMMAND_CENTER');

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
    <div className="min-h-screen bg-[#101415] text-[#e0e3e5] blueprint-grid flex font-sans antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. Left Fixed Sidebar Navigation */}
      <SideNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Top Navigation Bar */}
      <TopNavBar
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
        hazardsCount={hazards.length}
        onRefresh={handleRefreshPipeline}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 3. Main Content Area */}
      <main className="ml-64 mt-16 pb-16 min-h-screen p-6 lg:p-8 w-[calc(100%-16rem)]">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center justify-between shadow-lg glow-cyan animate-in fade-in slide-in-from-top-2 font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <span className="text-[10px] opacity-75">BuildSure AI System Alert</span>
          </div>
        )}

        {/* Tab 1: Command Center (Image 4 Left) */}
        {activeTab === 'COMMAND_CENTER' && (
          <CommandCenterPage
            project={selectedProject}
            hazards={hazards}
            zones={zones}
            onTriggerEvent={handleTriggerSimulatedEvent}
            onReset={handleResetFeed}
            onNavigateToPPE={() => setActiveTab('PPE_DETECTION')}
            onNavigateToAlerts={() => setActiveTab('SAFETY_ALERTS')}
          />
        )}

        {/* Tab 2: Site Risk Monitoring (Image 3 Left) */}
        {activeTab === 'SITE_RISK' && (
          <SiteRiskPage
            project={selectedProject}
            hazards={hazards}
            zones={zones}
            onInspectReasoning={(hazard) => setSelectedHazardForTrace(hazard || hazards[0])}
          />
        )}

        {/* Tab 3: PPE Safety Detection (Image 4 Right) */}
        {activeTab === 'PPE_DETECTION' && (
          <PPESafetyPage
            selectedProject={selectedProject}
          />
        )}

        {/* Tab 4: Safety Intelligence Dashboard (Image 3 Right) */}
        {activeTab === 'SAFETY_DASHBOARD' && (
          <SafetyDashboardPage
            selectedProject={selectedProject}
          />
        )}

        {/* Tab 5: Alert Center (Image 2 Left) */}
        {activeTab === 'SAFETY_ALERTS' && (
          <AlertCenterPage
            selectedProject={selectedProject}
          />
        )}

        {/* Tab 6: Agent Network Topology (Image 1) */}
        {activeTab === 'AGENT_NETWORK' && (
          <AgentNetworkPage />
        )}

        {/* Tab 7: Compliance */}
        {activeTab === 'COMPLIANCE' && (
          <div className="glass-panel p-8 rounded-2xl border border-cyan-500/30 text-center space-y-3">
            <h3 className="text-lg font-bold text-[#e0e3e5] font-sans">Compliance & Regulatory Intelligence</h3>
            <p className="text-xs font-mono text-[#859397]">
              Milestone 3 OSHA 1926 automated regulatory checking module.
            </p>
          </div>
        )}

        {/* Tab 8: Reports (Image 2 Right) */}
        {activeTab === 'REPORTS' && (
          <ExecutiveReportsPage />
        )}

        {/* Tab 9: Settings / Support */}
        {(activeTab === 'SETTINGS' || activeTab === 'SUPPORT') && (
          <div className="glass-panel p-8 rounded-2xl border border-[#3c494c]/30 text-center space-y-3">
            <h3 className="text-lg font-bold text-[#e0e3e5] font-sans">BuildSure AI System Configuration</h3>
            <p className="text-xs font-mono text-[#859397]">
              Vigilance System v2.4 • FastAPI & YOLOv8 Inference Active
            </p>
          </div>
        )}

      </main>

      {/* 4. Slide-out Agent XAI Decision Trace Drawer */}
      <AgentReasoningDrawer
        hazard={selectedHazardForTrace}
        onClose={() => setSelectedHazardForTrace(null)}
      />

      {/* 5. Fixed Bottom Status Ticker */}
      <BottomTicker />

    </div>
  );
}
