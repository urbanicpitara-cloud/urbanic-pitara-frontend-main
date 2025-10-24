import type {
  Product,
  Collection,
  Cart,
  Order,
  Menu,
  PaginatedResponse
} from '@/types/api';

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return url.replace(/\/$/, '');
};

const baseUrl = getBaseUrl();

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean>;
  body?: unknown;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers = {}, ...init } = options;

  // Add query parameters
  const url = new URL(endpoint, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // Prepare headers
  // Get auth token if exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(headers || {})
  } as HeadersInit;

  const response = await fetch(url.toString(), {
    ...init,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const productsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    collection?: string;
    tag?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    published?: boolean;
  }) => request<PaginatedResponse<Product>>('/products', { params }),

  getByHandle: (handle: string) => 
    request<Product>(`/products/${handle}`),

  getRelated: (handle: string, limit = 4) => 
    request<Product[]>(`/products/${handle}/related`, { params: { limit } }),

  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
    request<Product>('/products', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Product>) => 
    request<Product>(`/products/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => 
    request(`/products/${id}`, { method: 'DELETE' })
};

export const collectionsAPI = {
  getAll: () => request<Collection[]>('/collections'),

  getByHandle: (handle: string) => 
    request<Collection>(`/collections/${handle}`),

  create: (data: Omit<Collection, 'id' | 'products' | 'createdAt' | 'updatedAt'>) => 
    request<Collection>('/collections', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Collection>) => 
    request<Collection>(`/collections/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => 
    request(`/collections/${id}`, { method: 'DELETE' })
};

export const cartAPI = {
  get: (cartId: string) => 
    request<Cart>(`/cart/${cartId}`),

  create: () => 
    request<Cart>('/cart', { method: 'POST' }),

  addLine: (cartId: string, data: { productId: string; variantId?: string; quantity: number }) => 
    request<Cart>(`/cart/${cartId}/lines`, { method: 'POST', body: data }),

  updateLine: (cartId: string, lineId: string, quantity: number) => 
    request<Cart>(`/cart/${cartId}/lines/${lineId}`, { method: 'PUT', body: { quantity } }),

  removeLine: (cartId: string, lineId: string) => 
    request<Cart>(`/cart/${cartId}/lines/${lineId}`, { method: 'DELETE' })
};

export const ordersAPI = {
  getAll: () => 
    request<PaginatedResponse<Order>>('/orders'),

  getById: (id: string) => 
    request<Order>(`/orders/${id}`),

  create: (data: { cartId: string; shippingAddressId?: string }) => 
    request<Order>('/orders', { method: 'POST', body: data })
};

export const menuAPI = {
  getByHandle: (handle: string) => 
    request<Menu>(`/menu/${handle}`)
};

export const searchAPI = {
  products: (params: { 
    query: string; 
    page?: number; 
    limit?: number; 
    sort?: string;
    collection?: string;
    tag?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => request<PaginatedResponse<Product>>('/search/products', { params }),

  collections: (params: { 
    query: string; 
    page?: number; 
    limit?: number;
  }) => request<PaginatedResponse<Collection>>('/search/collections', { params }),

  autocomplete: (query: string) => 
    request<{ products: Product[]; collections: Collection[] }>('/search/autocomplete', { params: { query } })
};