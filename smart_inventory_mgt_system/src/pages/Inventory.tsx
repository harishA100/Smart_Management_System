import { useState, useEffect } from 'react';
import { Search, Filter, Download, Loader2, AlertTriangle, ArrowRightLeft, PackagePlus, ShieldAlert } from 'lucide-react';
import PageCard from '../components/ui/PageCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { inventoryApi } from '../api/inventory';
import type { InventoryResponse as InventoryType } from '../types/api';

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchInventory();
  }, [searchTerm, statusFilter, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryApi.getInventory({
        page: currentPage,
        page_size: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setInventory(data.items);
      setTotalItems(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  // We should ideally fetch these stats from the summary API instead of calculating on the current page
  const inStock = inventory.filter((i) => i.stock_status === 'in_stock').length;
  const lowStock = inventory.filter((i) => i.stock_status === 'low_stock').length;
  const outOfStock = inventory.filter((i) => i.stock_status === 'out_of_stock').length;

  const columns = [
    {
      key: 'productName',
      header: 'Product',
      render: (item: InventoryType) => (
        <div>
          <span className="font-medium text-surface-900">{item.product.name}</span>
          <p className="text-xs text-surface-400 mt-0.5">SKU: {item.product.sku}</p>
        </div>
      ),
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      render: (item: InventoryType) => (
        <div>
          <span className="font-medium text-surface-900">{item.current_stock}</span>
          <span className="text-surface-400 text-xs ml-1">units</span>
        </div>
      ),
    },
    {
      key: 'stockLevel',
      header: 'Stock Level',
      render: (item: InventoryType) => {
        const minStock = item.reorder_level || 10;
        const maxStock = Math.max(item.current_stock, minStock * 3);
        const pct = Math.min((item.current_stock / maxStock) * 100, 100);
        const barColor =
          item.stock_status === 'out_of_stock'
            ? 'bg-danger-500'
            : item.stock_status === 'low_stock'
            ? 'bg-warning-500'
            : 'bg-success-500';
        return (
          <div className="w-28">
            <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-surface-400">
              <span>Min: {minStock}</span>
              <span>Max: {maxStock}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'lastRestocked',
      header: 'Last Updated',
      render: (item: InventoryType) => (
        <span className="text-surface-600">
          {new Date(item.updated_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: InventoryType) => <StatusBadge status={item.stock_status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: InventoryType) => (
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 text-surface-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Receive Stock"
            onClick={() => {/* Open Receive Modal */}}
          >
            <PackagePlus className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 text-surface-400 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors" 
            title="Adjust Stock"
            onClick={() => {/* Open Adjust Modal */}}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" 
            title="Report Damage"
            onClick={() => {/* Open Damage Modal */}}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (error && inventory.length === 0) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center h-[50vh]">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-500" />
        <p className="font-semibold text-lg text-red-700">Failed to load inventory</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchInventory}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Total Items</p>
          <p className="text-2xl font-bold text-surface-900 mt-1 tracking-tight">{totalItems}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">In Stock</p>
          <p className="text-2xl font-bold text-success-600 mt-1 tracking-tight">{inStock}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Low Stock</p>
          <p className="text-2xl font-bold text-warning-600 mt-1 tracking-tight">{lowStock}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Out of Stock</p>
          <p className="text-2xl font-bold text-danger-600 mt-1 tracking-tight">{outOfStock}</p>
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <PageCard
          title="Inventory Management"
          subtitle={`${inventory.length} items`}
          noPadding
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-sm font-semibold text-surface-700 rounded-xl hover:bg-surface-50 hover:shadow-sm transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          }
        >
          <div className="px-6 py-4 border-b border-surface-100 flex flex-wrap items-center gap-4 bg-surface-50/30">
            <div className="relative flex-1 min-w-[240px] max-w-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search inventory by name..."
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
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
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
              data={inventory} 
              keyExtractor={(item) => String(item.product.id)} 
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: totalItems,
                onPageChange: setCurrentPage
              }}
            />
          )}
        </PageCard>
      </div>
    </div>
  );
}
