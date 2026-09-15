import { apiClient } from './client';
import { CategoryResponse } from '../types/api';

export const categoriesApi = {
  getCategories: () => {
    return apiClient.get<CategoryResponse[]>('/categories');
  },

  createCategory: (data: { name: string; description?: string }) => {
    return apiClient.post<CategoryResponse>('/categories', data);
  }
};
