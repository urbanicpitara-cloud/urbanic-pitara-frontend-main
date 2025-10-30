
import axios from 'axios';

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
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: Record<string, any>) => api.post('/orders', data),
  cancel: (id: string, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
  
    // ⚙️ Admin Endpoints
  getAllAdmin: (params?: { page?: number; limit?: number; status?: string; all?: boolean; }) =>
    api.get('/orders/admin/all', { params }), // Get all orders (admin view, paginated)

  updateStatusAdmin: (
    id: string,
    data: {
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'refunded';
      trackingNumber?: string;
      trackingCompany?: string;
      notes?: string;
    }
  ) => api.put(`/orders/admin/${id}/status`, data), // Update order status
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
  validate: (code: string) => api.post('/discounts/validate', { code }),

  // Get all discounts (admin use)
  getAll: () => api.get('/discounts'),

  // Create a new discount (admin)
  create: (data: Record<string, any>) => api.post('/discounts', data),

  // Update discount (admin)
  update: (id: string, data: Record<string, any>) => api.put(`/discounts/${id}`, data),

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

  // Delete tag (admin)
  remove: (id: string) => api.delete(`/tags/${id}`),
};