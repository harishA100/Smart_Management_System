import { apiClient } from './client';
import { ProductResponse, ProductCreate, ProductUpdate, PaginatedResponse } from '../types/api';

export const productsApi = {
  getProducts: (params?: { page?: number; page_size?: number; search?: string; category_id?: number; is_active?: boolean }) => {
    return apiClient.get<PaginatedResponse<ProductResponse>>('/products', params);
  },
  
  getProduct: (id: number) => {
    return apiClient.get<ProductResponse>(`/products/${id}`);
  },
  
  createProduct: (data: ProductCreate) => {
    return apiClient.post<ProductResponse>('/products', data);
  },
  
  updateProduct: (id: number, data: ProductUpdate) => {
    return apiClient.put<ProductResponse>(`/products/${id}`, data);
  },
  
  deleteProduct: (id: number) => {
    return apiClient.delete<ProductResponse>(`/products/${id}`);
  }
};
