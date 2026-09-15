import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, BarChart3, Loader2, AlertTriangle, Plus } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import PageCard from '../components/ui/PageCard';
import DataTable from '../components/ui/DataTable';
import { salesApi } from '../api/sales';
import type { SaleResponse as Sale, SalesSummaryResponse as SalesSummary } from '../types/api';

// Mock data removed, waiting for backend to support chart endpoints
const mockDailySales: any[] = [];
const mockCategorySales: any[] = [];

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchSalesData();
  }, [currentPage]);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      const [salesData, summaryData] = await Promise.all([
        salesApi.getSales({ page: currentPage, page_size: pageSize }),
        salesApi.getSalesSummary()
      ]);
      setSales(salesData.items);
      setTotalSales(salesData.total);
      setSummary(summaryData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales data');
    } finally {
      setIsLoading(false);
    }
  };

  const salesColumns = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (s: Sale) => <span className="font-mono text-surface-600">{s.invoice_number}</span>,
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (s: Sale) => (
        <span className="text-surface-600">{new Date(s.created_at).toLocaleString()}</span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (s: Sale) => (
        <span className="text-surface-600">{s.sale_items?.length || 0} items</span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (s: Sale) => (
        <span className="font-medium text-surface-900">₹{s.total_amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'payment_method',
      header: 'Payment Method',
      render: (s: Sale) => (
        <span className="text-surface-600 capitalize">{s.payment_method}</span>
      ),
    },
    {
      key: 'sales_channel',
      header: 'Channel',
      render: (s: Sale) => (
        <span className="text-surface-600 capitalize">{s.sales_channel}</span>
      ),
    },
  ];

  const categoryColumns = [
    {
      key: 'category',
      header: 'Category',
      render: (c: any) => (
        <span className="font-medium text-surface-900">{c.category}</span>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (c: any) => (
        <span className="text-surface-900">₹{c.revenue.toLocaleString()}</span>
      ),
    },
    {
      key: 'percentage',
      header: 'Share',
      render: (c: any) => (
        <div className="flex items-center gap-2 w-32">
          <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${c.percentage}%` }}
            />
          </div>
          <span className="text-xs text-surface-500 w-8 text-right">{c.percentage}%</span>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-surface-600 font-medium">Loading Sales Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center h-[50vh]">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-500" />
        <p className="font-semibold text-lg text-red-700">Failed to load sales</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchSalesData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Sales Dashboard</h1>
          <p className="text-surface-500 text-sm mt-1">Monitor your sales performance and revenue.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          New POS Sale
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <StatCard
          title="Total Revenue (All Time)"
          value={`₹${(summary?.total_revenue || 0).toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          change={{ value: 0, label: 'All records' }}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          title="30-Day Revenue"
          value={`₹${(summary?.last_30_days_sales || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          change={{ value: 8, label: 'vs previous 30 days' }}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Items Sold Today"
          value={(summary?.items_sold || 0).toLocaleString()}
          icon={<ShoppingCart className="w-5 h-5" />}
          change={{ value: 5, label: 'vs yesterday' }}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Avg. Order Value"
          value={`₹${(summary?.average_order_value || 0).toFixed(2)}`}
          icon={<BarChart3 className="w-5 h-5" />}
          change={{ value: -2, label: 'vs yesterday' }}
          iconBg="bg-surface-100"
          iconColor="text-surface-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <PageCard title="Revenue Trend" subtitle="Daily revenue this week">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDailySales}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        <PageCard title="Sales by Category" subtitle="Revenue distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategorySales} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <PageCard title="Recent Transactions" subtitle="Latest sales records" noPadding className="lg:col-span-2">
          {sales.length > 0 ? (
            <DataTable 
              columns={salesColumns} 
              data={sales} 
              keyExtractor={(s) => String(s.id)} 
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: totalSales,
                onPageChange: setCurrentPage
              }}
            />
          ) : (
            <div className="p-8 text-center text-surface-500">No recent transactions found.</div>
          )}
        </PageCard>

        <PageCard title="Category Breakdown" noPadding>
          <DataTable columns={categoryColumns} data={mockCategorySales} keyExtractor={(c) => c.category} />
        </PageCard>
      </div>
    </div>
  );
}
