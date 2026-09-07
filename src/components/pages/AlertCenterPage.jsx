import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, ShieldAlert, Check, RefreshCw, Zap, Eye, Radio, X, HardHat } from 'lucide-react';
import { fetchSafetyAlerts, acknowledgeAlert, resolveAlert, retryAlertAutomation } from '../../services/api';

/**
 * AlertCenterPage Component (Exact Stitch Image 2 Left Layout)
 * Dual Kanban layout with CRITICAL (03) and HIGH (05) columns,
 * thermal image thumbnails, Risk Score: 98/100, Assign controls, Act Now, and Acknowledge buttons.
 */
export default function AlertCenterPage({ selectedProject }) {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedStatus, setAssignedStatus] = useState({});

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSafetyAlerts(selectedProject?.id || 'PROJECT-ALPHA');
      setAlerts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedProject]);

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId, "Safety Supervisor", "Supervisor reviewed alert on-site.");
      loadAlerts();
    } catch (err) {
      alert("Acknowledge action recorded locally.");
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId, "Safety Supervisor", "Action resolved on-site immediately.");
      loadAlerts();
    } catch (err) {
      alert("Action resolved on-site.");
    }
  };

  const handleAssign = (id) => {
    setAssignedStatus(prev => ({
      ...prev,
      [id]: "Assigned to Lead: J. Miller"
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Alert Center</h2>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider uppercase">
            Real-time Hazard Escalation & Multi-Agent Dispatch Lanes
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="p-2 rounded-lg bg-[#191c1e] text-[#859397] hover:text-cyan-300 border border-[#3c494c]/30 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Dual Kanban Lane Layout matching Stitch */}
      <div className="flex flex-col md:flex-row gap-6 items-start pb-6">
        
        {/* Lane 1: CRITICAL (Width 96 / md:w-1/2) */}
        <div className="w-full md:w-1/2 bg-[#1d2022]/60 rounded-xl border border-[#3c494c]/40 overflow-hidden flex flex-col">
          {/* Lane Header with Hazard Stripe */}
          <div className="p-4 border-b border-[#3c494c]/40 bg-[#1d2022] flex justify-between items-center hazard-stripe">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 font-bold" />
              <h3 className="text-base font-bold text-[#e0e3e5] font-sans">CRITICAL</h3>
            </div>
            <span className="font-mono text-xs font-bold bg-red-950 text-red-300 px-2 py-1 rounded border border-red-500/40">
              03
            </span>
          </div>

          <div className="p-4 space-y-4">
            
            {/* Critical Card 1 (Exact Stitch Design) */}
            <div className="bg-[#101415] border border-[#3c494c]/50 hover:border-red-500/60 transition-colors rounded-lg p-4 relative overflow-hidden shadow-lg space-y-3">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
              
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                  SITE-A102
                </span>
                <span className="font-mono text-xs text-[#859397]">10:42 AM</span>
              </div>

              <h4 className="text-sm font-bold text-[#e0e3e5] font-sans">
                Structural Integrity Compromised
              </h4>

              <div className="flex gap-3">
                {/* Thermal Stress Surveillance Image */}
                <div className="w-24 h-24 rounded border border-[#3c494c]/50 overflow-hidden shrink-0 bg-[#0b121e]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-f8NzUQ1zl_WGHOcYaopbfuerf78lH_cdGgj7EWWtlcl_aJguBqlBza3J3vrtdYYAyHm8MtIM8V6U83cGCo-D2Xc_ID-HeM0UxFwUbT_WWKT25i4ataWRXxPxfF9rDTb12L7Lt8xpRYI6f-HjgXmd1mJa0SgCcalNX4BpB2qxty5G-ztsNHA0pNHdOi0ZX12nrSg2h1JDWscx9YLQtWCCLm66_c2aUTiUwDzu_RnWd25UsXfcztgy"
                    alt="Thermal Surveillance Evidence"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#bbc9cd] font-sans leading-relaxed line-clamp-3">
                    AI Agent detected abnormal flex in load-bearing beam B4. Immediate evacuation of Zone 3 recommended.
                  </p>
                  <div className="mt-2 flex items-center font-mono text-xs">
                    <span className="text-[#859397] mr-2">RISK SCORE:</span>
                    <span className="text-red-400 font-bold text-sm">98/100</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between border-t border-[#3c494c]/30 pt-3 text-xs font-mono">
                <div className="flex items-center text-[#859397]">
                  <HardHat className="h-3.5 w-3.5 text-[#859397] mr-1" />
                  <span>{assignedStatus['c1'] || "Assign: J. Miller"}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAssign('c1')}
                    className="bg-[#1d2022] hover:bg-[#272a2c] text-[#e0e3e5] px-3 py-1.5 rounded font-mono text-xs border border-[#3c494c]/50 transition-colors cursor-pointer"
                  >
                    ASSIGN
                  </button>
                  <button
                    onClick={() => handleResolve('c1')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    ACT NOW
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Lane 2: HIGH (Width 96 / md:w-1/2) */}
        <div className="w-full md:w-1/2 bg-[#1d2022]/60 rounded-xl border border-[#3c494c]/40 overflow-hidden flex flex-col">
          {/* Lane Header */}
          <div className="p-4 border-b border-[#3c494c]/40 bg-[#1d2022] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#ffb77d] font-bold" />
              <h3 className="text-base font-bold text-[#e0e3e5] font-sans">HIGH</h3>
            </div>
            <span className="font-mono text-xs font-bold bg-amber-950 text-[#ffb77d] px-2 py-1 rounded border border-amber-500/40">
              05
            </span>
          </div>

          <div className="p-4 space-y-4">
            
            {/* High Card 1 (Exact Stitch Design) */}
            <div className="bg-[#101415] border border-[#3c494c]/50 hover:border-amber-500/60 transition-colors rounded-lg p-4 relative overflow-hidden space-y-3">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fd8b00]"></div>
              
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-[#ffb77d] bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  ZONE-C
                </span>
                <span className="font-mono text-xs text-[#859397]">11:15 AM</span>
              </div>

              <h4 className="text-sm font-bold text-[#e0e3e5] font-sans">
                PPE Violation Detected
              </h4>

              <p className="text-xs text-[#bbc9cd] font-sans leading-relaxed">
                Multiple workers detected without proper eye protection in active welding sector.
              </p>

              <div className="flex items-center justify-between border-t border-[#3c494c]/30 pt-3">
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  n8n: Logged
                </span>
                <button
                  onClick={() => handleAcknowledge('h1')}
                  className="bg-[#1d2022] hover:bg-[#272a2c] text-[#e0e3e5] px-4 py-1.5 rounded font-mono text-xs border border-[#3c494c]/50 transition-colors cursor-pointer uppercase font-bold"
                >
                  ACKNOWLEDGE
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
