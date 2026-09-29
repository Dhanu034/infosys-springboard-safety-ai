import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';

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
import CompliancePage from './components/pages/CompliancePage';
import InsurancePage from './components/pages/InsurancePage';
import SettingsPage from './components/pages/SettingsPage';

// Agent Reasoning Drawer
import AgentReasoningDrawer from './components/AgentReasoningDrawer';

import { getProjectZones, getProjectHazards } from './data/mockSiteData';
import { siteRiskAgent } from './agents/SiteRiskAgent';
import { sanitizeActiveTab } from './config/demoConfig';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { selectedProject, selectedProjectId, isSimulationMode } = useProject();
  const [zones, setZones] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [selectedHazardForTrace, setSelectedHazardForTrace] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Active Tab State (Exact Stitch Navigation Keys)
  const [rawActiveTab, setRawActiveTab] = useState('COMMAND_CENTER');
  const activeTab = sanitizeActiveTab(rawActiveTab);
  const setActiveTab = (tabId) => setRawActiveTab(tabId);

  // Initialize and evaluate hazards with Site Risk Agent on project change
  useEffect(() => {
    const projHazards = getProjectHazards(selectedProjectId);
    const evaluated = siteRiskAgent.evaluateHazards(projHazards);
    setHazards(evaluated);
    setZones(getProjectZones(selectedProjectId));
  }, [selectedProjectId]);

  // Handle Refresh
  const handleRefreshPipeline = () => {
    const projHazards = getProjectHazards(selectedProjectId);
    const freshEvaluated = siteRiskAgent.evaluateHazards(hazards.length > 0 ? hazards : projHazards);
    setHazards(freshEvaluated);
    showToast(`Site Risk Agent re-evaluated hazards for ${selectedProject.name}.`);
  };

  // Handle Event Simulation
  const handleTriggerSimulatedEvent = (eventType) => {
    const result = siteRiskAgent.processSimulatedEvent(eventType, hazards);
    if (result && result.newHazard) {
      const newSimHazard = {
        ...result.newHazard,
        projectId: selectedProjectId,
        source: 'simulator'
      };
      const updatedHazardList = [newSimHazard, ...hazards];
      const newlyEvaluated = siteRiskAgent.evaluateHazards(updatedHazardList);
      setHazards(newlyEvaluated);
      showToast(result.logMessage);
    }
  };

  // Handle Reset
  const handleResetFeed = () => {
    const projHazards = getProjectHazards(selectedProjectId);
    const initialEvaluated = siteRiskAgent.evaluateHazards(projHazards);
    setHazards(initialEvaluated);
    setZones(getProjectZones(selectedProjectId));
    showToast(`Reset simulation feed to baseline state for ${selectedProject.name}.`);
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
            onNavigateTab={setActiveTab}
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
          <CompliancePage
            selectedProject={selectedProject}
          />
        )}

        {/* Tab 8: Insurance */}
        {activeTab === 'INSURANCE' && (
          <InsurancePage
            selectedProject={selectedProject}
          />
        )}

        {/* Tab 9: Executive Reports (Milestone 4) */}
        {activeTab === 'REPORTS' && (
          <ExecutiveReportsPage
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 10: Settings / Support */}
        {(activeTab === 'SETTINGS' || activeTab === 'SUPPORT') && (
          <SettingsPage />
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

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

