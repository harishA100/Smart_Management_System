import { apiClient } from './client';
import { 
  SupplierResponse, SupplierCreate, SupplierUpdate, SupplierProductResponse, SupplierProductCreate,
  SupplierProductUpdate, SupplierComparisonItem, SupplierComparisonResponse, PaginatedResponse 
} from '../types/api';

export const suppliersApi = {
  getSuppliers: (params?: { page?: number; page_size?: number; name?: string; contact_person?: string; is_active?: boolean }) => {
    return apiClient.get<PaginatedResponse<SupplierResponse>>('/suppliers', params);
  },
  
  getSupplier: (id: number) => {
    return apiClient.get<SupplierResponse>(`/suppliers/${id}`);
  },
  
  createSupplier: (data: SupplierCreate) => {
    return apiClient.post<SupplierResponse>('/suppliers', data);
  },
  
  updateSupplier: (id: number, data: SupplierUpdate) => {
    return apiClient.put<SupplierResponse>(`/suppliers/${id}`, data);
  },
  
  deleteSupplier: (id: number) => {
    return apiClient.delete<SupplierResponse>(`/suppliers/${id}`);
  },
  
  // Supplier Products
  getSupplierProducts: (supplierId: number) => {
    return apiClient.get<SupplierProductResponse[]>(`/suppliers/${supplierId}/products`);
  },
  
  addSupplierProduct: (supplierId: number, data: SupplierProductCreate) => {
    return apiClient.post<SupplierProductResponse>(`/suppliers/${supplierId}/products`, data);
  },
  
  updateSupplierProduct: (supplierId: number, productId: number, data: SupplierProductUpdate) => {
    return apiClient.put<SupplierProductResponse>(`/suppliers/${supplierId}/products/${productId}`, data);
  },
  
  removeSupplierProduct: (supplierId: number, productId: number) => {
    return apiClient.delete<void>(`/suppliers/${supplierId}/products/${productId}`);
  },
  
  // Comparison
  compareSuppliers: (productId: number) => {
    return apiClient.get<SupplierComparisonResponse>(`/suppliers/compare/${productId}`);
  }
};
