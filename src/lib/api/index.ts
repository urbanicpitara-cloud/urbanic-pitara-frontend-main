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

  // Add cache-busting timestamp for GET requests in development
  if ((!init.method || init.method === 'GET') && process.env.NODE_ENV !== 'production') {
    url.searchParams.append('_t', Date.now().toString());
  }

  // Prepare headers with minimal configuration for cookie-based auth
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
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
  get: () =>
    request<Cart>(`/cart`),

  create: () =>
    request<Cart>('/cart', { method: 'POST' }),

  addItem: (data: { productId: string; variantId?: string; quantity: number; customProductId?: string; cartId?: string }) =>
    request<Cart>(`/cart/lines`, { method: 'POST', body: data }),

  updateItem: (lineId: string, data: { quantity: number; cartId?: string }) =>
    request<Cart>(`/cart/lines/${lineId}`, { method: 'PUT', body: data }),

  removeItem: (lineId: string, cartId?: string) => {
    return request<Cart>(`/cart/lines/${lineId}`, {
      method: 'DELETE',
      ...(cartId && { params: { cartId } })
    });
  }
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