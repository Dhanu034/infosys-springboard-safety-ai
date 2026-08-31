export const MOCK_PROJECTS = [
  {
    id: "PRJ-101",
    name: "Skyline Mega Tower — Phase 3",
    location: "Downtown Core, District 4",
    contractor: "BuildCorp Engineering Ltd",
    totalWorkers: 342,
    activeZones: 6,
    overallRiskScore: 72,
    status: "HIGH_MONITORING",
    startDate: "2025-11-15",
  },
  {
    id: "PRJ-102",
    name: "Metro Central Railway Extension",
    location: "North Suburb Sector 9",
    contractor: "Infrastructure Dynamics",
    totalWorkers: 185,
    activeZones: 4,
    overallRiskScore: 48,
    status: "MODERATE",
    startDate: "2026-01-10",
  },
  {
    id: "PRJ-103",
    name: "Harbor Bay Bridge & Viaduct",
    location: "Coastal Port Zone B",
    contractor: "Apex Civil & Marine",
    totalWorkers: 210,
    activeZones: 5,
    overallRiskScore: 34,
    status: "NORMAL",
    startDate: "2025-08-20",
  }
];

export const MOCK_SITE_ZONES = [
  {
    id: "ZONE-A",
    name: "Zone A: Deep Excavation & Foundation",
    riskLevel: "CRITICAL",
    riskScore: 88,
    activeWorkers: 45,
    activeEquipment: ["Hydraulic Excavator EX-04", "Sheet Pile Rig PR-02"],
    sensors: {
      soilVibration: "4.8 mm/s (High)",
      waterTableDepth: "1.2m below trench",
      structuralTilt: "0.08 deg (Warning)"
    },
    primaryHazard: "Trench Wall Collapse & Soil Instability",
    coordinateGrid: { x: 15, y: 25, width: 30, height: 35 }
  },
  {
    id: "ZONE-B",
    name: "Zone B: Tower Crane 1 & Steel Erection",
    riskLevel: "HIGH",
    riskScore: 76,
    activeWorkers: 62,
    activeEquipment: ["Liebherr 280 EC-H Tower Crane", "Rigging Unit R-12"],
    sensors: {
      windGustSpeed: "38.5 km/h (Moderate Risk)",
      hookLoadWeight: "14.2 Tons (85% Limit)",
      boomDeflection: "Normal"
    },
    primaryHazard: "Struck-by Falling Materials & Crane Overload",
    coordinateGrid: { x: 50, y: 15, width: 35, height: 30 }
  },
  {
    id: "ZONE-C",
    name: "Zone C: High-Rise Scaffolding (Floors 18-24)",
    riskLevel: "HIGH",
    riskScore: 72,
    activeWorkers: 84,
    activeEquipment: ["Hoist Lift H-01", "Suspended Platform P-08"],
    sensors: {
      scaffoldTieTension: "92% Capacity",
      harnessLanyardCheck: "3 Violations Detected",
      edgeProtection: "Intact"
    },
    primaryHazard: "Fall from Height & Unanchored Workers",
    coordinateGrid: { x: 20, y: 65, width: 35, height: 30 }
  },
  {
    id: "ZONE-D",
    name: "Zone D: Electrical Substation & Concrete Pouring",
    riskLevel: "MODERATE",
    riskScore: 45,
    activeWorkers: 38,
    activeEquipment: ["Concrete Pump Truck P-03", "33kV Switchgear Unit"],
    sensors: {
      tempIndex: "36°C (Heat Warning)",
      groundingResistance: "0.8 Ohms (Good)",
      vibration: "2.1 mm/s"
    },
    primaryHazard: "Live High-Voltage Exposure & Heat Exhaustion",
    coordinateGrid: { x: 60, y: 55, width: 30, height: 40 }
  }
];

export const MOCK_HAZARDS = [
  {
    id: "HZ-8091",
    title: "Unstable Soil Slope Near Trench Edge",
    category: "Environmental",
    zoneId: "ZONE-A",
    zoneName: "Zone A: Deep Excavation",
    severity: "CRITICAL",
    likelihood: 4, // 1 to 5
    severityRating: 5, // 1 to 5
    exposure: 4, // 1 to 5
    riskScore: 88,
    detectedAt: "10 mins ago",
    sensorSource: "Geotechnical Tiltmeter T-14 & CCTV Cam #03",
    description: "Deep excavation trench edge showing hairline tension cracks following heavy morning rainfall. Continuous soil vibration from heavy excavator nearby.",
    aiRecommendation: "Immediately halt excavation within 15 meters. Install additional trench shoring braces. Evacuate 12 workers from lower trench pit until geotechnical engineer signs off.",
    status: "OPEN_ESCALATED"
  },
  {
    id: "HZ-8092",
    title: "High Wind Gusts Exceeding Crane Safe Operating Limit",
    category: "Equipment",
    zoneId: "ZONE-B",
    zoneName: "Zone B: Tower Crane 1",
    severity: "HIGH",
    likelihood: 4,
    severityRating: 4,
    exposure: 4,
    riskScore: 76,
    detectedAt: "24 mins ago",
    sensorSource: "Anemometer Crane #1 Peak Load Telemetry",
    description: "Wind gust speeds hit 38.5 km/h at 85m hook elevation. Tower crane lifting pre-cast concrete facade panel.",
    aiRecommendation: "Issue automated alert to Crane Operator #1 to suspend blind lifts. Secure suspended load and weather-vane the crane jib if wind exceeds 40 km/h.",
    status: "OPEN"
  },
  {
    id: "HZ-8093",
    title: "Missing Safety Mesh on 22nd Floor Edge",
    category: "Fall Hazard",
    zoneId: "ZONE-C",
    zoneName: "Zone C: High-Rise Scaffolding",
    severity: "HIGH",
    likelihood: 3,
    severityRating: 5,
    exposure: 4,
    riskScore: 72,
    detectedAt: "45 mins ago",
    sensorSource: "Autonomous Site Inspection Drone & Safety Cam #12",
    description: "Perimeter debris netting removed during slab formwork dismantling and not re-attached. 8 workers active on slab edge.",
    aiRecommendation: "Deploy Safety Officer immediately to halt slab edge activity. Enforce 100% 2-point harness tie-off until debris guardrails are re-installed.",
    status: "OPEN"
  },
  {
    id: "HZ-8094",
    title: "Exposed High Voltage Distribution Panel in Wet Zone",
    category: "Electrical",
    zoneId: "ZONE-D",
    zoneName: "Zone D: Electrical Substation",
    severity: "MEDIUM",
    likelihood: 2,
    severityRating: 4,
    exposure: 3,
    riskScore: 45,
    detectedAt: "1 hour ago",
    sensorSource: "Safety Checklist Audit #402",
    description: "Temporary power distribution box door left unlatched near concrete wash-down pit with standing water.",
    aiRecommendation: "De-energize circuit breaker CB-04, seal water-proof enclosure, and elevate distribution box 50cm off ground level.",
    status: "IN_PROGRESS"
  }
];

export const MOCK_RISK_HEATMAP_DATA = {
  // 5x5 Matrix: Impact (1-5, Y-axis) vs Probability (1-5, X-axis)
  matrix: [
    [0, 0, 1, 0, 0], // Probability 5 (Almost Certain)
    [0, 0, 3, 2, 1], // Probability 4 (Likely)
    [0, 2, 4, 3, 1], // Probability 3 (Possible)
    [0, 3, 5, 1, 0], // Probability 2 (Unlikely)
    [0, 4, 1, 0, 0], // Probability 1 (Rare)
  ],
  labels: ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"]
};

export const MOCK_RISK_DISTRIBUTION_BY_TYPE = {
  labels: ["Fall Hazards", "Equipment Risks", "Electrical Hazards", "Environmental/Soil", "Structural Collapse"],
  datasets: [
    {
      label: "Active Site Hazards",
      data: [38, 28, 22, 12, 8],
      backgroundColor: [
        "rgba(239, 68, 68, 0.8)",   // Red
        "rgba(245, 158, 11, 0.8)",  // Amber
        "rgba(59, 130, 246, 0.8)",  // Blue
        "rgba(16, 185, 129, 0.8)",  // Green
        "rgba(168, 85, 247, 0.8)",  // Purple
      ],
      borderColor: [
        "rgba(239, 68, 68, 1)",
        "rgba(245, 158, 11, 1)",
        "rgba(59, 130, 246, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(168, 85, 247, 1)",
      ],
      borderWidth: 1,
    }
  ]
};

export const MOCK_HISTORICAL_TREND = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
  datasets: [
    {
      label: "Inherent Site Risk Score",
      data: [64, 58, 79, 82, 75, 68, 72],
      borderColor: "rgba(239, 68, 68, 1)",
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      fill: true,
      tension: 0.4
    },
    {
      label: "Residual Risk (After AI Mitigations)",
      data: [42, 38, 51, 55, 48, 44, 46],
      borderColor: "rgba(16, 185, 129, 1)",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: true,
      tension: 0.4
    }
  ]
};
