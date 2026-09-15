import { apiClient } from './client';
import { InventoryResponse, InventorySummaryResponse, InventoryTransactionResponse, PaginatedResponse } from '../types/api';

export const inventoryApi = {
  getInventory: (params?: { page?: number; page_size?: number; product_id?: number; status?: string }) => {
    return apiClient.get<PaginatedResponse<InventoryResponse>>('/inventory', params);
  },
  
  getInventorySummary: () => {
    return apiClient.get<InventorySummaryResponse>('/inventory/summary');
  },
  
  getInventoryItem: (productId: number) => {
    return apiClient.get<InventoryResponse>(`/inventory/${productId}`);
  },
  
  getInventoryTransactions: (productId: number) => {
    return apiClient.get<InventoryTransactionResponse[]>(`/inventory/${productId}/transactions`);
  },
  
  receiveStock: (productId: number, data: { quantity: number; notes?: string }) => {
    return apiClient.post<InventoryResponse>(`/inventory/${productId}/receive`, data);
  },
  
  adjustStock: (productId: number, data: { quantity: number; notes?: string }) => {
    return apiClient.post<InventoryResponse>(`/inventory/${productId}/adjust`, data);
  },
  
  reportDamage: (productId: number, data: { quantity: number; notes?: string }) => {
    return apiClient.post<InventoryResponse>(`/inventory/${productId}/damage`, data);
  }
};
