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

export default function RiskAnalyticsCharts() {
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { size: 11, family: 'Inter' },
          boxWidth: 12,
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
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
          color: '#cbd5e1',
          font: { size: 11, family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Chart 1: Hazard Distribution by Category */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Site Risk Distribution by Hazard Category</h3>
          </div>
        </div>
        <div className="h-64 relative flex items-center justify-center">
          <Doughnut data={MOCK_RISK_DISTRIBUTION_BY_TYPE} options={doughnutOptions} />
        </div>
      </div>

      {/* Chart 2: Historical Inherent vs Residual Risk Trend */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Inherent vs. Residual Site Risk Trend</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            -36% Risk Reduction
          </span>
        </div>
        <div className="h-64 relative">
          <Line data={MOCK_HISTORICAL_TREND} options={lineOptions} />
        </div>
      </div>

    </div>
  );
}
