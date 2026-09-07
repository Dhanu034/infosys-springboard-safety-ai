import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { PieChart, TrendingUp } from 'lucide-react';
import { MOCK_RISK_DISTRIBUTION_BY_TYPE, MOCK_HISTORICAL_TREND } from '../data/mockSiteData';
import ChartPanel from './ui/ChartPanel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * RiskAnalyticsCharts Component (Phase 3 Redesign)
 * Visualizes risk category breakdown and historical trends using Industrial Precision Glassmorphism.
 */
export default function RiskAnalyticsCharts() {
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e0e3e5',
          font: { size: 11, family: 'Inter' },
          boxWidth: 12,
          padding: 14,
        }
      },
      tooltip: {
        backgroundColor: '#101415',
        titleColor: '#8aebff',
        bodyColor: '#e0e3e5',
        borderColor: 'rgba(34, 211, 238, 0.3)',
        borderWidth: 1,
        padding: 10,
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e0e3e5',
          font: { size: 11, family: 'Inter' },
          boxWidth: 12,
        }
      },
      tooltip: {
        backgroundColor: '#101415',
        titleColor: '#8aebff',
        bodyColor: '#e0e3e5',
        borderColor: 'rgba(34, 211, 238, 0.3)',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#859397', font: { size: 11, family: 'JetBrains Mono' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#859397', font: { size: 11, family: 'JetBrains Mono' } },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Chart 1: Hazard Distribution by Category */}
      <ChartPanel
        title="Site Risk Distribution by Hazard Category"
        titleTa="அபாய வகைப்பாடு விநியோகம்"
        subtitle="Categorical cluster of detected hazards across structural, electrical, and fall risks"
        icon={PieChart}
      >
        <div className="h-64 relative flex items-center justify-center pt-2">
          <Doughnut data={MOCK_RISK_DISTRIBUTION_BY_TYPE} options={doughnutOptions} />
        </div>
      </ChartPanel>

      {/* Chart 2: Historical Inherent vs Residual Risk Trend */}
      <ChartPanel
        title="Inherent vs. Residual Site Risk Trend"
        titleTa="இடர் குறைப்பு போக்கு வரைபடம்"
        subtitle="Historical impact of agentic intervention and safety control enforcement"
        icon={TrendingUp}
        badge={
          <span className="text-xs font-mono font-semibold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            -36% Risk Reduction
          </span>
        }
      >
        <div className="h-64 relative pt-2">
          <Line data={MOCK_HISTORICAL_TREND} options={lineOptions} />
        </div>
      </ChartPanel>

    </div>
  );
}
