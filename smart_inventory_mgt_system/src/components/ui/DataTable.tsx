import type { ReactNode } from 'react';

interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  pagination?: PaginationProps;
}

export default function DataTable<T>({ columns, data, keyExtractor, pagination }: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-[11px] font-semibold text-surface-500 uppercase tracking-wider px-6 py-4 ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-surface-50/80 transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 text-sm transition-colors ${col.className || ''}`}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-surface-500 text-sm">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 bg-white">
          <div className="text-sm text-surface-500">
            Showing <span className="font-medium text-surface-900">{(pagination.page - 1) * pagination.pageSize + 1}</span> to <span className="font-medium text-surface-900">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of <span className="font-medium text-surface-900">{pagination.total}</span> entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm font-medium border border-surface-200 rounded-md hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-surface-700"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1 text-sm font-medium border border-surface-200 rounded-md hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-surface-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
