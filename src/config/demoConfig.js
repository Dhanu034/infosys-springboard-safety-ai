/**
 * BuildSure AI — Unified Application Configuration
 * Single source of truth for College Presentation, Infosys Review, Hackathon, and Continuous Development.
 */

export const isHackathonDemoMode = () => {
  return false;
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
  { id: 'REPORTS', label: 'Executive Reports', iconName: 'FileText', milestone: 'M4' },
  { id: 'SETTINGS', label: 'Settings', iconName: 'Settings', milestone: 'Config' },
];

export const DEMO_ALLOWED_TAB_IDS = ALL_NAV_ITEMS.map(item => item.id);

/**
 * Returns active navigation items for the unified application.
 */
export const getActiveNavItems = () => {
  return ALL_NAV_ITEMS;
};

/**
 * Validates active tab; supports all registered navigation keys.
 */
export const sanitizeActiveTab = (tabId) => {
  const validIds = ALL_NAV_ITEMS.map(item => item.id);
  if (!validIds.includes(tabId)) {
    return 'COMMAND_CENTER';
  }
  return tabId;
};

