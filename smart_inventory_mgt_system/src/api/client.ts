export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let message = 'An error occurred';
    
    // Handle FastAPI Pydantic validation errors (422)
    if (response.status === 422 && data?.detail && Array.isArray(data.detail)) {
      message = data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
    } 
    // Handle standard FastAPI HTTPException (400, 404, etc)
    else if (data?.detail && typeof data.detail === 'string') {
      message = data.detail;
    } 
    else if (data?.message) {
      message = data.message;
    }
    else if (response.statusText) {
      message = response.statusText;
    }

    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const apiClient = {
  get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body?: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    // 204 No Content won't have JSON body to parse, handleResponse handles null cleanly
    if (response.status === 204) {
      return null as any;
    }
    return handleResponse<T>(response);
  },
};
