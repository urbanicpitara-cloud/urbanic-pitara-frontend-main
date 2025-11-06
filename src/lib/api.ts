/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
// import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ----------------- Auth API -----------------
export const authAPI = {
  register: (data: Record<string, any>) => api.post('/auth/register', data),
  login: (data: Record<string, any>) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, any>) => api.put('/auth/me', data),
  changePassword: (data: Record<string, any>) => api.put('/auth/change-password', data),
   // 🆕 Forgot / Reset Password
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  getAllUsers:()=> api.get('/auth/admin/all/users'),
};




// ----------------- Products API -----------------
export const productsAPI = {
  getAll: (params?: Record<string,any> ) => api.get('/products', { params }),
  getByHandle: (handle: string) => api.get(`/products/${handle}`),
  getRelated: (handle: string, limit: number = 4) => api.get(`/products/${handle}/related`, { params: { limit } }),
  create: (data: Record<string, any>) => api.post('/products', data),
  update: (id: string, data: Record<string, any>) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  deleteMany: (ids: string[]) => api.delete('/products/bulk-delete', { data: { ids } }),
    // 🧩 Bulk Update (new)
 updateMany: (ids: string[], updates: Record<string, any>) =>
    api.put('/products/bulk-update', { ids, updates }),
};

// ----------------- Collections API -----------------
export const collectionsAPI = {
  getAll: () => api.get("/collections"),

  // Accept optional pagination params
  getByHandle: (handle: string, params?: { page?: number; limit?: number }) =>
    api.get(`/collections/${handle}`, { params }),

  create: (data: Record<string, any>) => api.post("/collections", data),
  update: (id: string, data: Record<string, any>) => api.put(`/collections/${id}`, data),
  delete: (id: string) => api.delete(`/collections/${id}`),

  // Admin: Add products manually
  addProducts: (id: string, productIds: string[]) =>
    api.post(`/collections/${id}/products`, { productIds }),

  // Admin: Remove products manually
  removeProducts: (id: string, productIds: string[]) =>
    api.delete(`/collections/${id}/products`, { data: { productIds } }),

  // Admin: Add products by rule
  addProductsByRule: (id: string, rule: { titleContains?: string; priceMin?: number; priceMax?: number; tags?: string[] }) =>
    api.post(`/collections/${id}/products/by-rule`, rule),
};


// ----------------- Cart API -----------------
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data: Record<string, any>) => api.post('/cart/lines', data),
  updateItem: (lineId: string, data: Record<string, any>) => api.put(`/cart/lines/${lineId}`, data),
  removeItem: (lineId: string) => api.delete(`/cart/lines/${lineId}`),
};

// ----------------- Orders API -----------------
export const ordersAPI = {
  // 🛒 User Endpoints
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: Record<string, any>) => api.post('/orders', data),
  cancel: (id: string, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),

  // ⚙️ Admin Endpoints
  getAllAdmin: (params?: { page?: number; limit?: number; status?: string; all?: boolean }) =>
    api.get('/orders/admin/all', { params }), // Get all orders (admin view, paginated)

  updateStatusAdmin: (
    id: string,
    data: {
      status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' | 'REFUNDED';
      trackingNumber?: string;
      trackingCompany?: string;
      notes?: string;
    }
  ) => api.put(`/orders/admin/${id}/status`, data), // Update order status

  // 📝 New Admin Controllers
  updateOrderAdmin: (
    id: string,
    data: {
      status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' | 'REFUNDED';
      trackingNumber?: string | null;
      trackingCompany?: string | null;
      adminNotes?: string | null;
      shippingAddressId?: string;
      billingAddressId?: string;
    }
  ) => api.put(`/orders/admin/${id}`, data), // Update single order (new endpoint)

  bulkUpdateOrdersAdmin: (
    data: {
      orderIds: string[];
      status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' | 'REFUNDED';
      adminNotes?: string | null;
    }
  ) => api.put('/orders/admin/bulk-update', data), // Bulk update orders (new endpoint)
};

export const usersAPI = {
  // Get all users (admin)
  getAll: () => api.get('/users'),

  // Get single user by ID
  getById: (id: string) => api.get(`/users/${id}`),

  // Update user (admin)
  update: (id: string, data: Record<string, any>) =>
    api.put(`/users/${id}`, data),

  // Delete single user (admin)
  remove: (id: string) => api.delete(`/users/${id}`),

  // Delete multiple users (admin)
  removeMany: (ids: string[]) =>
    api.delete('/users', { data: { ids } }),

  // Reset user password (admin)
  resetPassword: (id: string) => api.put(`/users/${id}/reset-password`),
};





// ----------------- Addresses API -----------------
export const addressesAPI = {
  // Get all addresses for the logged-in user
  getAll: () => api.get("/addresses"),

  // Create a new address
  create: (data: Record<string, any>) => api.post("/addresses", data),

  // Update an existing address by ID
  update: (id: string, data: Record<string, any>) => api.patch(`/addresses/${id}`, data),

  // Delete an address by ID
  remove: (id: string) => api.delete(`/addresses/${id}`),
};


// ----------------- Discounts API -----------------
export const discountsAPI = {
  // Validate a discount code
  validate: (code: string, orderAmount?: number) =>
    api.post('/discounts/validate', { code, orderAmount }),

  // Get all discounts (admin use)
  getAll: () => api.get('/discounts/all'),

  // Get single discount by ID (admin use)
  getById: (id: string) => api.get(`/discounts/${id}`),

  // Create a new discount (admin)
  create: (data: Record<string, any>) => api.post('/discounts/create', data),

  // Update discount (admin)
  update: (id: string, data: Record<string, any>) => api.patch(`/discounts/${id}`, data),

  // Delete a discount (admin)
  delete: (id: string) => api.delete(`/discounts/${id}`),
};


// ----------------- Tags API -----------------
export const tagsAPI = {
  // List tags (optional pagination)
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/tags', { params }),

  // Get single tag
  get: (id: string) => api.get(`/tags/${id}`),

  // Create tag (admin)
  create: (data: { name: string; description?: string; handle?: string }) =>
    api.post('/tags', data),

  // Update tag (admin)
  update: (id: string, data: { name?: string; description?: string; handle?: string }) =>
    api.put(`/tags/${id}`, data),

  // Delete single tag (admin)
  remove: (id: string) => api.delete(`/tags/${id}`),

  // Delete multiple tags (admin)
  removeMany: (ids: string[]) =>
    api.delete('/tags', { data: { ids } }), // `data` contains array of IDs
};
