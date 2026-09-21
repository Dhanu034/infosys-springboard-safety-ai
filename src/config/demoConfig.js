/**
 * BuildSure AI — Hackathon Presentation Configuration
 * Controls presentation feature flags, clean navigation sets, and safe fallbacks.
 */

// Reads VITE_HACKATHON_DEMO_MODE from environment; defaults to true if set to 'true' or not explicitly 'false'
export const isHackathonDemoMode = () => {
  const envFlag = import.meta.env.VITE_HACKATHON_DEMO_MODE;
  if (envFlag === 'false') return false;
  return true; // Default enabled for hackathon presentation mode
};

export const ALL_NAV_ITEMS = [
  { id: 'COMMAND_CENTER', label: 'Command Center', iconName: 'LayoutDashboard', milestone: 'Core' },
  { id: 'SITE_RISK', label: 'Site Risk', iconName: 'AlertTriangle', milestone: 'M1' },
  { id: 'PPE_DETECTION', label: 'PPE Safety', iconName: 'HardHat', milestone: 'M2' },
  { id: 'SAFETY_DASHBOARD', label: 'Safety Dashboard', iconName: 'BarChart3', milestone: 'M2' },
  { id: 'SAFETY_ALERTS', label: 'Alert Center', iconName: 'BellRing', milestone: 'M2' },
  { id: 'AGENT_NETWORK', label: 'Agent Network', iconName: 'Bot', milestone: 'Architecture' },
  { id: 'COMPLIANCE', label: 'Compliance', iconName: 'ShieldCheck', milestone: 'M3' },
  { id: 'INSURANCE', label: 'Insurance', iconName: 'ShieldAlert', milestone: 'M3' },
  { id: 'REPORTS', label: 'Reports', iconName: 'FileText', milestone: 'M4' },
  { id: 'SETTINGS', label: 'Settings', iconName: 'Settings', milestone: 'Config' },
];

export const DEMO_ALLOWED_TAB_IDS = [
  'COMMAND_CENTER',
  'SITE_RISK',
  'PPE_DETECTION',
  'SAFETY_DASHBOARD',
  'SAFETY_ALERTS',
  'COMPLIANCE',
  'INSURANCE'
];

/**
 * Returns active navigation items based on current demo mode flag.
 */
export const getActiveNavItems = () => {
  if (isHackathonDemoMode()) {
    return ALL_NAV_ITEMS.filter(item => DEMO_ALLOWED_TAB_IDS.includes(item.id));
  }
  return ALL_NAV_ITEMS;
};

/**
 * Validates active tab; if a tab is hidden in demo mode, returns fallback 'COMMAND_CENTER'
 */
export const sanitizeActiveTab = (tabId) => {
  if (isHackathonDemoMode()) {
    if (!DEMO_ALLOWED_TAB_IDS.includes(tabId)) {
      return 'COMMAND_CENTER';
    }
  }
  return tabId;
};
