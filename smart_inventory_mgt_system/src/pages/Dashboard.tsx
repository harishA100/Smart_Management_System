import { useState, useEffect } from 'react';
import {
  Package,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Plus,
  PlusCircle,
  FileText,
  Brain,
  ChevronDown,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { inventoryApi } from '../api/inventory';
import { salesApi } from '../api/sales';
import { InventorySummaryResponse, SalesSummaryResponse } from '../types/api';
import { Link } from 'react-router-dom';

// Mock data removed, we'll use empty arrays for now until backend provides these metrics
const topProducts: any[] = [];
const mockDailySales: any[] = [];

export default function Dashboard() {
  const [salesTimeframe, setSalesTimeframe] = useState<'7d' | '30d' | '3m'>('7d');
  
  const [inventorySummary, setInventorySummary] = useState<InventorySummaryResponse | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [invData, salesData] = await Promise.all([
          inventoryApi.getInventorySummary(),
          salesApi.getSalesSummary()
        ]);
        setInventorySummary(invData);
        setSalesSummary(salesData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-surface-600 font-medium">Loading Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center h-[50vh]">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-500" />
        <p className="font-semibold text-lg text-red-700">Failed to load dashboard data</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const inStockCount = inventorySummary ? inventorySummary.total_products - inventorySummary.low_stock_products - inventorySummary.out_of_stock_products : 0;
  
  const inventoryStatusData = [
    { status: 'In Stock', count: inStockCount, color: '#2563eb' },
    { status: 'Low Stock', count: inventorySummary?.low_stock_products || 0, color: '#f59e0b' },
    { status: 'Out of Stock', count: inventorySummary?.out_of_stock_products || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[14px] text-surface-500 mt-1">
            Here's what's happening with your supermarket today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-surface-600 bg-white px-3.5 py-2 rounded-xl border border-surface-200 shadow-xs shrink-0 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-surface-400" />
          <span className="text-[13px] font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. KPI Cards (1 Row of 4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-surface-500">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-[32px] font-bold text-surface-900 tracking-tight leading-none">{inventorySummary?.total_products || 0}</p>
            <p className="text-[13px] text-surface-500 mt-2 font-medium">Active products</p>
          </div>
        </div>

        {/* Card 2: Inventory Value */}
        <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-surface-500">Inventory Value</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-[32px] font-bold text-surface-900 tracking-tight leading-none">
              ₹{((inventorySummary?.inventory_value || 0)).toLocaleString()}
            </p>
            <p className="text-[13px] text-surface-500 mt-2 font-medium">
              Based on cost price
            </p>
          </div>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-surface-500">Low Stock Items</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-[32px] font-bold text-surface-900 tracking-tight leading-none">{inventorySummary?.low_stock_products || 0}</p>
            <p className="text-[13px] text-amber-600 mt-2 font-semibold flex items-center gap-1">
              <span>Needs reorder</span>
            </p>
          </div>
        </div>

        {/* Card 4: Today's Sales */}
        <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-surface-500">Total Sales (All Time)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-[32px] font-bold text-surface-900 tracking-tight leading-none">₹{((salesSummary?.total_revenue || 0)).toLocaleString()}</p>
            <p className="text-[13px] text-purple-600 mt-2 font-semibold flex items-center gap-1">
              <span>{salesSummary?.total_orders || 0} orders</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Analytics Section (2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left: Sales Overview Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-semibold text-surface-900 tracking-tight">
                Sales Overview
              </h2>
              <p className="text-[13px] text-surface-500 mt-1">
                Daily sales performance & revenue trend
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-100/70 p-1 rounded-lg border border-surface-200 text-xs font-medium">
              <button
                onClick={() => setSalesTimeframe('7d')}
                className={`px-3 py-1 rounded-md transition-all ${
                  salesTimeframe === '7d'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setSalesTimeframe('30d')}
                className={`px-3 py-1 rounded-md transition-all ${
                  salesTimeframe === '30d'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setSalesTimeframe('3m')}
                className={`px-3 py-1 rounded-md transition-all ${
                  salesTimeframe === '3m'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Last 3 months
              </button>
            </div>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDailySales} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Inventory Status Donut Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-surface-900 tracking-tight">
              Inventory Status
            </h2>
            <span className="text-[12px] font-semibold text-surface-600 bg-surface-100 px-2.5 py-1 rounded-full">
              {inventorySummary?.total_products || 0} total
            </span>
          </div>

          <div className="h-44 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  stroke="none"
                >
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-surface-100">
            {inventoryStatusData.map((item) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-surface-600 font-medium">{item.status}</span>
                </div>
                <span className="font-bold text-surface-900">{item.count} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Top Selling Products & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left: Top Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-semibold text-surface-900 tracking-tight">
                Top Selling Products
              </h2>
              <p className="text-[13px] text-surface-500 mt-1">
                Highest performing items by revenue this week
              </p>
            </div>
            <div className="relative">
              <select className="appearance-none text-xs border border-surface-200 rounded-lg px-3 py-1.5 pr-7 bg-surface-50 text-surface-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option>5–7 products</option>
                <option>Top 10 products</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="py-3 px-4 text-[12px] font-semibold text-surface-500 uppercase tracking-wider text-left">
                    Product
                  </th>
                  <th className="py-3 px-4 text-[12px] font-semibold text-surface-500 uppercase tracking-wider text-center">
                    Units Sold
                  </th>
                  <th className="py-3 px-4 text-[12px] font-semibold text-surface-500 uppercase tracking-wider text-right">
                    Revenue
                  </th>
                  <th className="py-3 px-4 text-[12px] font-semibold text-surface-500 uppercase tracking-wider text-center">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-surface-50/60 transition-colors">
                    <td className="py-4 px-4 text-[14px] font-semibold text-surface-900 text-left whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="py-4 px-4 text-[14px] text-surface-600 font-medium text-center">
                      {p.sold}
                    </td>
                    <td className="py-4 px-4 text-[14px] font-semibold text-surface-900 text-right whitespace-nowrap">
                      ₹{p.revenue}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Actions Card */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-surface-900 tracking-tight mb-1">
              Quick Actions
            </h2>
            <p className="text-[13px] text-surface-500 mb-6">
              Common operational tasks
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Link to="/products" className="h-[104px] p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[13px] flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-sm group">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span>Add Product</span>
              </Link>

              <Link to="/inventory" className="h-[104px] p-3 bg-white border border-surface-200 hover:bg-surface-50 text-surface-800 rounded-xl font-semibold text-[13px] flex flex-col items-center justify-center text-center gap-2.5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-surface-100 group-hover:bg-surface-200/60 flex items-center justify-center text-surface-600 shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span>Receive Stock</span>
              </Link>

              <Link to="/purchase-orders" className="h-[104px] p-3 bg-white border border-surface-200 hover:bg-surface-50 text-surface-800 rounded-xl font-semibold text-[13px] flex flex-col items-center justify-center text-center gap-2.5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-surface-100 group-hover:bg-surface-200/60 flex items-center justify-center text-surface-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <span>Purchase Order</span>
              </Link>

              <Link to="/insights" className="h-[104px] p-3 bg-white border border-surface-200 hover:bg-surface-50 text-surface-800 rounded-xl font-semibold text-[13px] flex flex-col items-center justify-center text-center gap-2.5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <span>View Insights</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. AI Insights / Alerts Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-[16px] font-semibold text-surface-900 tracking-tight">
              AI Insights & Alerts
            </h2>
          </div>
          <span className="text-[12px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            Real-time recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Low Stock Alert */}
          <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-[12px] font-bold uppercase tracking-wider">Low Stock Alert</span>
                </div>
                <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  AI Insight
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-surface-900">Maggi Noodles</h3>
              <p className="text-[14px] text-surface-600 mt-1 font-medium">
                Only 8 units remaining
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-surface-100 flex items-center justify-between">
              <span className="text-[13px] text-surface-500 font-medium">Auto-reorder suggested</span>
              <button className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                Review Reorder
              </button>
            </div>
          </div>

          {/* Card 2: Expiry Alert */}
          <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-[12px] font-bold uppercase tracking-wider">Expiry Alert</span>
                </div>
                <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  AI Insight
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-surface-900">Yogurt</h3>
              <p className="text-[14px] text-surface-600 mt-1 font-medium">
                45 units may remain unsold
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-surface-100 flex items-center justify-between">
              <span className="text-[13px] text-surface-500 font-medium">Discount recommended</span>
              <button className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                Apply Discount
              </button>
            </div>
          </div>

          {/* Card 3: Demand Increase */}
          <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-[12px] font-bold uppercase tracking-wider">Demand Increase</span>
                </div>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  AI Insight
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-surface-900">Coca-Cola 750ml</h3>
              <p className="text-[14px] text-surface-600 mt-1 font-medium">
                Expected demand increase: 25%
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-surface-100 flex items-center justify-between">
              <span className="text-[13px] text-surface-500 font-medium">Stock boost advised</span>
              <button className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                Increase Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
