// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    validate: `${API_BASE_URL}/api/auth/validate`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  },
  products: {
    list: `${API_BASE_URL}/api/products`,
    detail: (id) => `${API_BASE_URL}/api/products/${id}`,
  },
  categories: {
    list: `${API_BASE_URL}/api/categories`,
    detail: (id) => `${API_BASE_URL}/api/categories/${id}`,
  },
  orders: {
    list: `${API_BASE_URL}/api/orders`,
    detail: (id) => `${API_BASE_URL}/api/orders/${id}`,
    create: `${API_BASE_URL}/api/orders`,
  },
  wishlist: {
    list: `${API_BASE_URL}/api/wishlist`,
    add: `${API_BASE_URL}/api/wishlist`,
    remove: (id) => `${API_BASE_URL}/api/wishlist/${id}`,
  },
  cart: {
    list: `${API_BASE_URL}/api/cart`,
    add: `${API_BASE_URL}/api/cart`,
    update: (id) => `${API_BASE_URL}/api/cart/${id}`,
    remove: (id) => `${API_BASE_URL}/api/cart/${id}`,
  },
  admin: {
    dashboard: {
      stats: `${API_BASE_URL}/api/admin/dashboard/stats`,
      recentOrders: `${API_BASE_URL}/api/admin/dashboard/recent-orders`,
    },
    products: {
      list: `${API_BASE_URL}/api/admin/products`,
      create: `${API_BASE_URL}/api/admin/products`,
      detail: (id) => `${API_BASE_URL}/api/admin/products/${id}`,
    },
    orders: {
      list: `${API_BASE_URL}/api/admin/orders`,
      detail: (id) => `${API_BASE_URL}/api/admin/orders/${id}`,
      stats: `${API_BASE_URL}/api/admin/orders/stats`,
    },
    users: {
      list: `${API_BASE_URL}/api/admin/users`,
      create: `${API_BASE_URL}/api/admin/users`,
      detail: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    },
    categories: {
      list: `${API_BASE_URL}/api/admin/categories`,
      create: `${API_BASE_URL}/api/admin/categories`,
      detail: (id) => `${API_BASE_URL}/api/admin/categories/${id}`,
    },
    settings: {
      get: `${API_BASE_URL}/api/admin/settings`,
      update: `${API_BASE_URL}/api/admin/settings`,
    },
  },
};

// API request helper
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  // Determine if we're sending form data
  const isFormData = options.body instanceof FormData;
  
  // Set headers based on content type
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  // Only set Content-Type if not sending form data
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}; 