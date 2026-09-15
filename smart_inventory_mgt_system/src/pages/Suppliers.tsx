import { useState, useEffect } from 'react';
import { Plus, Search, Star, Mail, Phone, Loader2, AlertTriangle } from 'lucide-react';
import PageCard from '../components/ui/PageCard';
import StatusBadge from '../components/ui/StatusBadge';
import { suppliersApi } from '../api/suppliers';
import type { SupplierResponse as Supplier } from '../types/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm, statusFilter]);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await suppliersApi.getSuppliers({
        page: 1,
        page_size: 100,
        name: searchTerm || undefined,
        is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined
      });
      setSuppliers(data.items);
      setTotalSuppliers(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  const activeCount = suppliers.filter((s) => s.is_active).length;
  // Calculate average rating based on reliability_score
  const avgRating = suppliers.length > 0 
    ? (suppliers.reduce((sum, sup) => sum + (sup.reliability_score || 0), 0) / suppliers.length).toFixed(1) 
    : '0.0';

  if (error && suppliers.length === 0) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center h-[50vh]">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-500" />
        <p className="font-semibold text-lg text-red-700">Failed to load suppliers</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchSuppliers}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Total Suppliers</p>
          <p className="text-2xl font-bold text-surface-900 mt-1 tracking-tight">{totalSuppliers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Active</p>
          <p className="text-2xl font-bold text-success-600 mt-1 tracking-tight">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Avg. Reliability</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-5 h-5 text-warning-500 fill-warning-500" />
            <p className="text-2xl font-bold text-surface-900 tracking-tight">{avgRating}</p>
          </div>
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <PageCard
          title="Supplier Directory"
          subtitle={`${suppliers.length} suppliers`}
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          }
        >
          {/* Search / Filter */}
          <div className="mb-6 flex flex-wrap items-center gap-4 bg-surface-50/30 p-2 rounded-2xl border border-surface-100/50">
            <div className="relative flex-1 min-w-[240px] max-w-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search suppliers by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-surface-200 bg-white text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 pr-10 rounded-full border border-surface-200 bg-white text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white border border-surface-100 rounded-2xl p-5 hover:shadow-md hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[15px] font-bold text-surface-900 group-hover:text-primary-700 transition-colors">{supplier.name}</h3>
                      <p className="text-[13px] text-surface-500 mt-0.5">{supplier.contact_person || 'N/A'}</p>
                    </div>
                    <StatusBadge status={supplier.is_active ? 'active' : 'inactive'} />
                  </div>

                  <div className="space-y-2.5 mb-4 p-3 bg-surface-50/50 rounded-xl">
                    <div className="flex items-center gap-2.5 text-[13px] text-surface-600">
                      <Mail className="w-4 h-4 text-surface-400 shrink-0" />
                      <span className="truncate">{supplier.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[13px] text-surface-600">
                      <Phone className="w-4 h-4 text-surface-400 shrink-0" />
                      <span>{supplier.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                    <div className="flex items-center gap-1 bg-warning-50 px-2 py-1 rounded-md">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(supplier.reliability_score || 0)
                              ? 'text-warning-500 fill-warning-500'
                              : 'text-surface-200'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-bold text-warning-700 ml-1">{supplier.reliability_score || '0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>
    </div>
  );
}
