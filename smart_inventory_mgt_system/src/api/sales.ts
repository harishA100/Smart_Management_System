import { apiClient } from './client';
import { SaleResponse, SaleCreate, SalesSummaryResponse, PaginatedResponse } from '../types/api';

export const salesApi = {
  getSales: (params?: { page?: number; page_size?: number; customer_id?: number }) => {
    return apiClient.get<PaginatedResponse<SaleResponse>>('/sales', params);
  },
  
  getSale: (id: number) => {
    return apiClient.get<SaleResponse>(`/sales/${id}`);
  },
  
  getSalesSummary: () => {
    return apiClient.get<SalesSummaryResponse>('/sales/summary');
  },
  
  createSale: (data: SaleCreate) => {
    return apiClient.post<SaleResponse>('/sales', data);
  }
};
