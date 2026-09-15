import { apiClient } from './client';
import { PurchaseOrderResponse, PurchaseOrderCreate, PurchaseOrderSummaryResponse, PaginatedResponse } from '../types/api';

export const purchaseOrdersApi = {
  getPurchaseOrders: (params?: { page?: number; page_size?: number; status?: string; supplier_id?: number; po_number?: string }) => {
    return apiClient.get<PaginatedResponse<PurchaseOrderResponse>>('/purchase-orders', params);
  },

  getPurchaseOrder: (id: number) => {
    return apiClient.get<PurchaseOrderResponse>(`/purchase-orders/${id}`);
  },

  createPurchaseOrder: (data: PurchaseOrderCreate) => {
    return apiClient.post<PurchaseOrderResponse>('/purchase-orders', data);
  },

  submitPurchaseOrder: (id: number) => {
    return apiClient.post<PurchaseOrderResponse>(`/purchase-orders/${id}/submit`);
  },

  approvePurchaseOrder: (id: number) => {
    return apiClient.post<PurchaseOrderResponse>(`/purchase-orders/${id}/approve`);
  },

  rejectPurchaseOrder: (id: number, rejectionReason: string) => {
    return apiClient.post<PurchaseOrderResponse>(`/purchase-orders/${id}/reject`, { rejection_reason: rejectionReason });
  },

  orderPurchaseOrder: (id: number) => {
    return apiClient.post<PurchaseOrderResponse>(`/purchase-orders/${id}/order`);
  },

  receivePurchaseOrder: (id: number, items: { product_id: number; received_quantity: number }[]) => {
    return apiClient.post<PurchaseOrderResponse>(`/purchase-orders/${id}/receive`, { items });
  },

  cancelPurchaseOrder: (id: number, cancellationReason: string) => {
    return apiClient.post<PurchaseOrderResponse>(`/purchase-orders/${id}/cancel`, { cancellation_reason: cancellationReason });
  },

  getPurchaseOrderSummary: () => {
    return apiClient.get<PurchaseOrderSummaryResponse>('/purchase-orders/summary');
  }
};
