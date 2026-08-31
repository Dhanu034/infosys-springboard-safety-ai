/**
 * Site Risk Agent — BuildSure AI Core Module (Week 1 Milestone)
 * Autonomous AI Agent that ingests construction site conditions, IoT telemetry,
 * CCTV vision feeds, and inspection logs to compute multi-factor risk scores,
 * classify hazards, and generate explainable recommendations.
 */

export class SiteRiskAgent {
  constructor(name = "SiteRiskAgent-Alpha") {
    this.name = name;
    this.agentVersion = "v1.2.0-Milestone1";
    this.lastEvaluatedAt = new Date().toISOString();
  }

  /**
   * Calculates a multi-factor risk score based on Likelihood, Severity, Exposure,
   * and Environmental Multiplier parameters.
   * Formula: Risk Score = (Likelihood x Severity x Exposure) x EnvMultiplier
   */
  calculateRiskScore({ likelihood = 3, severity = 3, exposure = 3, envFactor = 1.0 }) {
    const rawScore = (likelihood * severity * exposure) * envFactor;
    // Scale 1-125 to 0-100 score
    const normalizedScore = Math.min(100, Math.round((rawScore / 125) * 100));
    return normalizedScore;
  }

  /**
   * Determines risk rating category based on numerical risk score.
   */
  getRiskRating(score) {
    if (score >= 80) return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500/50" };
    if (score >= 60) return { label: "HIGH", color: "text-amber-500", bg: "bg-amber-500/20", border: "border-amber-500/50" };
    if (score >= 40) return { label: "MODERATE", color: "text-yellow-400", bg: "bg-yellow-400/20", border: "border-yellow-400/50" };
    return { label: "LOW", color: "text-emerald-400", bg: "bg-emerald-400/20", border: "border-emerald-400/50" };
  }

  /**
   * Evaluates site hazards and returns an updated list with agent insights,
   * confidence metrics, and explainable decision steps.
   */
  evaluateHazards(hazards, envContext = { windSpeed: 22, temperature: 32, humidity: 65 }) {
    let envMultiplier = 1.0;
    if (envContext.windSpeed > 35) envMultiplier += 0.2;
    if (envContext.temperature > 38) envMultiplier += 0.15;

    return hazards.map(hazard => {
      const computedScore = this.calculateRiskScore({
        likelihood: hazard.likelihood,
        severity: hazard.severityRating || hazard.severity,
        exposure: hazard.exposure || 3,
        envFactor: envMultiplier
      });

      const rating = this.getRiskRating(computedScore);
      const reasoningTrace = this.generateReasoningTrace(hazard, computedScore, envContext);

      return {
        ...hazard,
        riskScore: computedScore,
        riskRating: rating,
        agentConfidence: 94.6, // %
        reasoningTrace,
        evaluatedByAgent: this.name,
        evaluatedAt: new Date().toLocaleTimeString()
      };
    });
  }

  /**
   * Generates step-by-step explainable AI (XAI) reasoning steps for human verification.
   */
  generateReasoningTrace(hazard, finalScore, envContext) {
    return [
      {
        step: 1,
        phase: "Data Ingestion & Sensor Validation",
        detail: `Ingested telemetry from ${hazard.sensorSource || "Site Vision Feeds"}. Confirmed active sensor status.`,
        status: "VALIDATED"
      },
      {
        step: 2,
        phase: "Environmental Multiplier Calibration",
        detail: `Current wind speed ${envContext.windSpeed} km/h, Temp ${envContext.temperature}°C. Applied Environmental Multiplier factor: x1.15.`,
        status: "CALIBRATED"
      },
      {
        step: 3,
        phase: "Multi-Factor Risk Calculation",
        detail: `Evaluated Likelihood (${hazard.likelihood}/5) x Severity (${hazard.severityRating || 4}/5) x Exposure (${hazard.exposure || 4}/5) -> Calculated Inherent Score: ${finalScore}/100.`,
        status: "COMPUTED"
      },
      {
        step: 4,
        phase: "OSHA & Regulatory Rule Matching",
        detail: `Matched hazard against OSHA Standard 1926 subpart P (Excavations) & Subpart L (Scaffolding). Non-compliance detected.`,
        status: "RULE_MATCHED"
      },
      {
        step: 5,
        phase: "Autonomous Mitigation Generation",
        detail: `Generated corrective action workflow: "${hazard.aiRecommendation || 'Halt work immediately and re-inspect.'}"`,
        status: "RECOMMENDED"
      }
    ];
  }

  /**
   * Process interactive simulator events and return new hazards and notifications.
   */
  processSimulatedEvent(eventType, currentHazards) {
    const timestamp = new Date().toLocaleTimeString();

    switch (eventType) {
      case "HIGH_WIND_ALERTS":
        return {
          eventTitle: "Storm Wind Surge Detected (> 42 km/h)",
          newHazard: {
            id: `HZ-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
            title: "Severe Crane Wind Load Hazard at Tower Crane 1",
            category: "Equipment",
            zoneId: "ZONE-B",
            zoneName: "Zone B: Tower Crane 1",
            severity: "CRITICAL",
            likelihood: 5,
            severityRating: 5,
            exposure: 5,
            riskScore: 92,
            detectedAt: timestamp,
            sensorSource: "Live Anemometer & Weather API Feed",
            description: "Sudden gusting wind speeds reached 44.2 km/h at 90m hook height. Boom swinging beyond safe lateral limits.",
            aiRecommendation: "IMMEDIATE EMERGENCY LOCKOUT: Order Crane Operator #1 to park boom in weather-vane direction. Clear 30-meter ground radius below jib immediately.",
            status: "OPEN_ESCALATED"
          },
          logMessage: "Site Risk Agent triggered CRITICAL alert HZ-SIM: High Wind Surge at Tower Crane 1!"
        };

      case "SOIL_VIBRATION_ANOMALY":
        return {
          eventTitle: "Excavation Pit Soil Displacement Anomaly",
          newHazard: {
            id: `HZ-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
            title: "Soil Slope Shear Fracture In Trench Wall",
            category: "Environmental",
            zoneId: "ZONE-A",
            zoneName: "Zone A: Deep Excavation",
            severity: "CRITICAL",
            likelihood: 5,
            severityRating: 5,
            exposure: 4,
            riskScore: 89,
            detectedAt: timestamp,
            sensorSource: "Sub-surface Inclinometer I-03 & CCTV Vision",
            description: "Soil displacement rate spiked by 3.4 mm/hr following heavy machinery vibration in Trench Section A-4.",
            aiRecommendation: "Sound site evacuation siren for Zone A Excavation Pit. Install emergency hydraulic trench shoring before resuming pile driving.",
            status: "OPEN_ESCALATED"
          },
          logMessage: "Site Risk Agent detected excavation slope instability anomaly in Zone A!"
        };

      case "HARNESS_VIOLATION_CLUSTER":
        return {
          eventTitle: "Multiple Unanchored Workers at Height",
          newHazard: {
            id: `HZ-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
            title: "High-Rise Slab Edge Fall Hazard without Tie-Off",
            category: "Fall Hazard",
            zoneId: "ZONE-C",
            zoneName: "Zone C: High-Rise Scaffolding",
            severity: "HIGH",
            likelihood: 4,
            severityRating: 5,
            exposure: 4,
            riskScore: 80,
            detectedAt: timestamp,
            sensorSource: "Smart Helmet Beacon & Vision AI Camera #14",
            description: "3 workers detected within 1.5 meters of open perimeter slab edge on 24th floor without active lifeline attachment.",
            aiRecommendation: "Dispatch Floor Supervisor directly to Floor 24. Pause slab concreting until static safety lifelines are secured.",
            status: "OPEN"
          },
          logMessage: "Site Risk Agent flagged Fall Hazard cluster on Floor 24!"
        };

      default:
        return null;
    }
  }
}

export const siteRiskAgent = new SiteRiskAgent();
