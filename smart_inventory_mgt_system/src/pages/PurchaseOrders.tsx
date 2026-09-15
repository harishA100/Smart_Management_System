import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, AlertTriangle, FileText, CheckCircle, Clock } from 'lucide-react';
import PageCard from '../components/ui/PageCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { purchaseOrdersApi } from '../api/purchaseOrders';
import type { PurchaseOrderResponse as PurchaseOrder, PurchaseOrderSummaryResponse as PurchaseOrderSummary, PaginatedResponse } from '../types/api';

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [totalPOs, setTotalPOs] = useState(0);
  const [summary, setSummary] = useState<PurchaseOrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [posData, summaryData] = await Promise.all([
        purchaseOrdersApi.getPurchaseOrders({
          page: currentPage,
          page_size: pageSize,
          po_number: searchTerm || undefined, // For simple search implementation
          status: statusFilter !== 'all' ? statusFilter : undefined
        }),
        purchaseOrdersApi.getPurchaseOrderSummary()
      ]);
      setPurchaseOrders(posData.items);
      setTotalPOs(posData.total);
      setSummary(summaryData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load purchase orders');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'po_number',
      header: 'Order #',
      render: (po: PurchaseOrder) => (
        <span className="font-mono font-medium text-primary-600">{po.po_number}</span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      render: (po: PurchaseOrder) => <span className="text-surface-900 font-medium">{po.supplier_name}</span>,
    },
    {
      key: 'created_at',
      header: 'Order Date',
      render: (po: PurchaseOrder) => <span className="text-surface-600">{new Date(po.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'expected_delivery_date',
      header: 'Expected Delivery',
      render: (po: PurchaseOrder) => (
        <span className="text-surface-600">
          {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (po: PurchaseOrder) => <span className="text-surface-900">{po.items?.length || 0}</span>,
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (po: PurchaseOrder) => (
        <span className="font-medium text-surface-900">₹{po.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (po: PurchaseOrder) => <StatusBadge status={po.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (po: PurchaseOrder) => (
        <button 
          className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          onClick={() => {/* View Details / Actions */}}
        >
          View
        </button>
      )
    }
  ];

  if (error && purchaseOrders.length === 0) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center h-[50vh]">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-500" />
        <p className="font-semibold text-lg text-red-700">Failed to load purchase orders</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Total Orders</p>
              <p className="text-2xl font-bold text-surface-900 mt-1 tracking-tight">{summary?.total_purchase_orders || 0}</p>
            </div>
            <div className="p-2 bg-surface-100 rounded-lg text-surface-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Pending</p>
              <p className="text-2xl font-bold text-warning-600 mt-1 tracking-tight">
                {summary?.pending_approval || 0}
              </p>
            </div>
            <div className="p-2 bg-warning-50 rounded-lg text-warning-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Delivered</p>
              <p className="text-2xl font-bold text-success-600 mt-1 tracking-tight">
                {summary?.delivered || 0}
              </p>
            </div>
            <div className="p-2 bg-success-50 rounded-lg text-success-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Total Value</p>
              <p className="text-2xl font-bold text-primary-600 mt-1 tracking-tight">₹{(summary?.total_purchase_value || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <PageCard
          title="Purchase Orders"
          subtitle={`${totalPOs} orders found`}
          noPadding
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" />
              Create Order
            </button>
          }
        >
          {/* Filters */}
          <div className="px-6 py-4 border-b border-surface-100 flex flex-wrap items-center gap-4 bg-surface-50/30">
            <div className="relative flex-1 min-w-[240px] max-w-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search orders by PO number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-surface-200 bg-white text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white border border-surface-200 flex items-center justify-center shadow-sm">
                <Filter className="w-4 h-4 text-surface-500" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 pr-10 rounded-full border border-surface-200 bg-white text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="ordered">Ordered</option>
                <option value="partially_delivered">Partially Delivered</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={purchaseOrders} 
              keyExtractor={(po) => String(po.id)} 
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: totalPOs,
                onPageChange: setCurrentPage
              }}
            />
          )}
        </PageCard>
      </div>
    </div>
  );
}
