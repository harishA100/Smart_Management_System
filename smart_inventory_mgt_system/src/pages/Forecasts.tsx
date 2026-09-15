import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Search, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PageCard from '../components/ui/PageCard';
import DataTable from '../components/ui/DataTable';
// Mock data removed
const mockForecasts: any[] = [];
import type { ForecastData } from '../types';

export default function Forecasts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [trendFilter, setTrendFilter] = useState('all');

  const filtered = mockForecasts.filter((f) => {
    const matchesSearch = f.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrend = trendFilter === 'all' || f.trend === trendFilter;
    return matchesSearch && matchesTrend;
  });

  const chartData = mockForecasts.map((f) => ({
    name: f.productName.length > 15 ? f.productName.substring(0, 15) + '...' : f.productName,
    current: f.currentDemand,
    predicted: f.predictedDemand,
  }));

  const avgConfidence = (mockForecasts.reduce((s, f) => s + f.confidence, 0) / mockForecasts.length).toFixed(1);
  const trendingUp = mockForecasts.filter((f) => f.trend === 'up').length;
  const trendingDown = mockForecasts.filter((f) => f.trend === 'down').length;

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-danger-500" />;
    return <Minus className="w-4 h-4 text-surface-400" />;
  };

  const columns = [
    {
      key: 'productName',
      header: 'Product',
      render: (f: ForecastData) => (
        <div>
          <span className="font-medium text-surface-900">{f.productName}</span>
          <p className="text-xs text-surface-400 mt-0.5">{f.category}</p>
        </div>
      ),
    },
    {
      key: 'currentDemand',
      header: 'Current (units/day)',
      render: (f: ForecastData) => <span className="text-surface-900">{f.currentDemand}</span>,
    },
    {
      key: 'predictedDemand',
      header: 'Predicted (units/day)',
      render: (f: ForecastData) => (
        <span className="font-medium text-primary-600">{f.predictedDemand}</span>
      ),
    },
    {
      key: 'change',
      header: 'Change',
      render: (f: ForecastData) => {
        const change = ((f.predictedDemand - f.currentDemand) / f.currentDemand) * 100;
        const isUp = change > 0;
        return (
          <span className={`font-medium ${isUp ? 'text-success-600' : change < 0 ? 'text-danger-500' : 'text-surface-500'}`}>
            {isUp ? '+' : ''}{change.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (f: ForecastData) => (
        <div className="flex items-center gap-2 w-28">
          <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                f.confidence >= 90
                  ? 'bg-success-500'
                  : f.confidence >= 80
                  ? 'bg-primary-500'
                  : 'bg-warning-500'
              }`}
              style={{ width: `${f.confidence}%` }}
            />
          </div>
          <span className="text-xs text-surface-500 w-8 text-right">{f.confidence}%</span>
        </div>
      ),
    },
    {
      key: 'trend',
      header: 'Trend',
      render: (f: ForecastData) => (
        <div className="flex items-center gap-1.5">
          {trendIcon(f.trend)}
          <span className="text-sm text-surface-600 capitalize">{f.trend}</span>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      render: (f: ForecastData) => <span className="text-surface-500">{f.period}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Avg. Confidence</p>
          <p className="text-2xl font-bold text-success-600 mt-1 tracking-tight">{avgConfidence}%</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Predicted Growth</p>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="w-5 h-5 text-success-500" />
            <p className="text-2xl font-bold text-surface-900 tracking-tight">+14.2%</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Forecast Period</p>
          <p className="text-2xl font-bold text-surface-900 mt-1 tracking-tight">Next 30 Days</p>
        </div>
      </div>

      {/* Chart */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <PageCard
          title="Demand Forecast"
          subtitle="Current vs predicted demand for top categories"
          action={
            <div className="flex items-center gap-2 bg-surface-50 p-1 rounded-lg border border-surface-100">
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white shadow-sm text-surface-900">
                Categories
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-md text-surface-500 hover:text-surface-900">
                Products
              </button>
            </div>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="current" name="Current Demand" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="predicted" name="Predicted Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      {/* Detailed Table */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <PageCard
          title="Detailed Projections"
          subtitle={`${filtered.length} products`}
          noPadding
        >
          <div className="px-5 py-3 border-b border-surface-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-surface-200 bg-surface-50 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-surface-400" />
              <select
                value={trendFilter}
                onChange={(e) => setTrendFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">All Trends</option>
                <option value="up">Trending Up</option>
                <option value="down">Trending Down</option>
                <option value="stable">Stable</option>
              </select>
            </div>
          </div>

          <DataTable columns={columns} data={filtered} keyExtractor={(f) => f.id} />
        </PageCard>
      </div>
    </div>
  );
}
