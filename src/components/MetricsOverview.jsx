import React from 'react';
import { AlertTriangle, MapPin, Users, Activity, TrendingUp, ShieldAlert } from 'lucide-react';
import MetricCard from './ui/MetricCard';

/**
 * MetricsOverview Component (Phase 3 Redesign)
 * Key construction risk metrics telemetry cards styled with Industrial Precision Glassmorphism.
 */
export default function MetricsOverview({ project, hazards, zones }) {
  const criticalCount = hazards.filter(h => h.severity === 'CRITICAL').length;
  const highCount = hazards.filter(h => h.severity === 'HIGH').length;
  const totalActiveHazards = hazards.length;
  const highRiskZones = zones.filter(z => z.riskLevel === 'CRITICAL' || z.riskLevel === 'HIGH').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Metric 1: Active Site Risks */}
      <MetricCard
        title="Active Site Hazards"
        titleTa="தள அபாயங்கள்"
        value={totalActiveHazards}
        unit="Hazards"
        icon={AlertTriangle}
        accent={criticalCount > 0 ? "red" : "orange"}
        subtext={`${criticalCount} Critical • ${highCount} High Priority`}
        change={criticalCount > 0 ? `${criticalCount} Urgent` : undefined}
        changePositive={false}
      />

      {/* Metric 2: High-Risk Zones */}
      <MetricCard
        title="High-Risk Site Zones"
        titleTa="அதிக அபாய மண்டலங்கள்"
        value={highRiskZones}
        unit={`/ ${zones.length} Zones`}
        icon={MapPin}
        accent={highRiskZones > 0 ? "orange" : "green"}
        subtext="Zone A: Deep Excavation"
        change={highRiskZones > 1 ? "Elevated" : "Normal"}
        changePositive={highRiskZones <= 1}
      />

      {/* Metric 3: Active Worker Density */}
      <MetricCard
        title="Workers Monitored"
        titleTa="கண்காணிக்கப்படும் தொழிலாளர்கள்"
        value={project.totalWorkers}
        unit="Active On-Site"
        icon={Users}
        accent="cyan"
        subtext="Spatial Density: 107 in High Risk"
        change="Live Feed"
        changePositive={true}
      />

      {/* Metric 4: Site Risk Index */}
      <MetricCard
        title="Site Risk Score Index"
        titleTa="தள அபாயக் குறியீடு"
        value={project.overallRiskScore}
        unit="/ 100"
        icon={Activity}
        accent={project.overallRiskScore >= 80 ? "red" : (project.overallRiskScore >= 60 ? "orange" : "green")}
        subtext={`Status: ${project.status || 'Active Monitoring'}`}
        change={project.overallRiskScore >= 70 ? "Action Required" : "Compliant"}
        changePositive={project.overallRiskScore < 70}
      />

    </div>
  );
}
