import { useState } from 'react';
import { Brain, AlertTriangle, Lightbulb, Target, TrendingUp, Filter, ArrowRight } from 'lucide-react';
import PageCard from '../components/ui/PageCard';
// Mock data removed
const mockAIInsights: any[] = [];
import type { AIInsight } from '../types';

const typeConfig: Record<string, { icon: typeof Brain; color: string; bg: string; label: string }> = {
  warning: { icon: AlertTriangle, color: 'text-warning-600', bg: 'bg-warning-50', label: 'Warning' },
  recommendation: { icon: Lightbulb, color: 'text-primary-600', bg: 'bg-primary-50', label: 'Recommendation' },
  opportunity: { icon: Target, color: 'text-success-600', bg: 'bg-success-50', label: 'Opportunity' },
  prediction: { icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50', label: 'Prediction' },
  optimization: { icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50', label: 'Optimization' },
  anomaly: { icon: AlertTriangle, color: 'text-warning-600', bg: 'bg-warning-50', label: 'Anomaly' },
  risk: { icon: AlertTriangle, color: 'text-danger-600', bg: 'bg-danger-50', label: 'Risk' },
};

const impactStyles: Record<string, string> = {
  high: 'bg-danger-50 text-danger-600 border-danger-200',
  medium: 'bg-warning-50 text-warning-600 border-warning-200',
  low: 'bg-surface-100 text-surface-600 border-surface-200',
};

export default function AIInsights() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');

  const filtered = mockAIInsights.filter((i: AIInsight) => {
    const matchesType = typeFilter === 'all' || i.type === typeFilter;
    const matchesImpact = impactFilter === 'all' || i.impact === impactFilter;
    return matchesType && matchesImpact;
  });

  const highImpact = mockAIInsights.filter((i) => i.impact === 'high').length;
  const actionable = mockAIInsights.filter((i) => i.actionable).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-primary-500" />
            <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Total Insights</p>
          </div>
          <p className="text-2xl font-bold text-surface-900 tracking-tight">{mockAIInsights.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">High Impact</p>
          <p className="text-2xl font-bold text-danger-600 mt-1 tracking-tight">{highImpact}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Actionable</p>
          <p className="text-2xl font-bold text-success-600 mt-1 tracking-tight">{actionable}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Categories</p>
          <p className="text-2xl font-bold text-surface-900 mt-1 tracking-tight">
            {new Set(mockAIInsights.map((i) => i.category)).size}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-100 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div>
            <h2 className="text-xl font-bold text-surface-900 tracking-tight">AI Insights Engine</h2>
            <p className="text-[13px] text-surface-500 mt-1">
              Analyzing {mockAIInsights.length} data points to optimize your operations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Engine Active
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-surface-200 flex items-center justify-center shadow-sm">
              <Filter className="w-4 h-4 text-surface-500" />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-4 pr-10 rounded-full border border-surface-200 bg-white text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="all">All Types</option>
              <option value="optimization">Optimization</option>
              <option value="risk">Risk</option>
              <option value="opportunity">Opportunity</option>
              <option value="anomaly">Anomaly</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="h-10 px-4 pr-10 rounded-full border border-surface-200 bg-white text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="all">All Impacts</option>
              <option value="high">High Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="low">Low Impact</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          {filtered.map((insight) => {
            const config = typeConfig[insight.type] || typeConfig.optimization;
            const Icon = config.icon;

            return (
              <div
                key={insight.id}
                className="bg-white rounded-2xl border border-surface-100 p-6 flex flex-col hover:shadow-lg hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} shadow-sm`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-surface-900 group-hover:text-primary-700 transition-colors line-clamp-1">{insight.title}</h3>
                      <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wide mt-0.5">{insight.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${impactStyles[insight.impact]}`}>
                    {insight.impact}
                  </span>
                </div>

                <p className="text-[13px] text-surface-600 flex-1 leading-relaxed">{insight.description}</p>

                <div className="mt-5 pt-4 border-t border-surface-100 flex items-center justify-between">
                  <span className="text-xs text-surface-400">
                    {new Date(insight.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {insight.actionable && (
                    <button className="text-[13px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                      Take Action <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
