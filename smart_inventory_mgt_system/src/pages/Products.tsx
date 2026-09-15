import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, AlertTriangle } from 'lucide-react';
import PageCard from '../components/ui/PageCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { productsApi } from '../api/products';
import type { ProductResponse as Product } from '../types/api';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productsApi.getProducts({
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
      });
      
      // Note: If we do client side filtering, pagination total gets messed up.
      // Ideally the backend filters by category name, but since we don't have that yet,
      // we'll filter client side only if the page_size is large enough or disable filter.
      // For this audit, we will just use the backend pagination directly.
      setProducts(data.items);
      setTotalProducts(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Derive unique categories from fetched products for the filter dropdown
  const categories = [...new Set(products.map((p) => p.category?.name).filter(Boolean))] as string[];

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      render: (p: Product) => <span className="font-mono text-surface-500">{p.sku}</span>,
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (p: Product) => <span className="font-medium text-surface-900">{p.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (p: Product) => (
        <span className="text-surface-600">{p.category?.name || 'Uncategorized'}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p: Product) => <span className="text-surface-900">₹{p.selling_price.toFixed(2)}</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (p: Product) => <span className="text-surface-500">₹{p.cost_price.toFixed(2)}</span>,
    },
    {
      key: 'margin',
      header: 'Margin',
      render: (p: Product) => {
        if (p.selling_price === 0) return <span>0%</span>;
        const margin = ((p.selling_price - p.cost_price) / p.selling_price) * 100;
        return (
          <span className={`font-medium ${margin > 30 ? 'text-success-600' : 'text-warning-600'}`}>
            {margin.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: Product) => <StatusBadge status={p.is_active ? 'active' : 'inactive'} />,
    },
  ];

  if (error && products.length === 0) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center h-[50vh]">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-500" />
        <p className="font-semibold text-lg text-red-700">Failed to load products</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Total Products</p>
          <p className="text-2xl font-bold text-surface-900 mt-1 tracking-tight">{totalProducts || products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Active</p>
          <p className="text-2xl font-bold text-success-600 mt-1 tracking-tight">
            {products.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[13px] text-surface-500 font-medium tracking-wide uppercase">Categories</p>
          <p className="text-2xl font-bold text-surface-900 mt-1 tracking-tight">{categories.length}</p>
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <PageCard
          title="Product Catalog"
          subtitle={`${products.length} products found`}
          noPadding
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          }
        >
          {/* Filters */}
          <div className="px-6 py-4 border-b border-surface-100 flex flex-wrap items-center gap-4 bg-surface-50/30">
            <div className="relative flex-1 min-w-[240px] max-w-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-4 pr-10 rounded-full border border-surface-200 bg-white text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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
              data={products} 
              keyExtractor={(p) => String(p.id)} 
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: totalProducts,
                onPageChange: setCurrentPage
              }}
            />
          )}
        </PageCard>
      </div>
    </div>
  );
}
