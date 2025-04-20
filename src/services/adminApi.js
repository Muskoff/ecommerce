import axios from 'axios';
import { API_URL } from '../config';

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found in localStorage');
  }
  return config;
});

// Add response interceptor to handle 401 errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      // Optionally redirect to login page or refresh token
    }
    return Promise.reject(error);
  }
);

// Dashboard
export const getDashboardStats = () => adminApi.get('/dashboard/stats');
export const getRecentOrders = () => adminApi.get('/dashboard/recent-orders');

// Products
export const getProducts = () => adminApi.get('/products');
export const getProduct = (id) => adminApi.get(`/products/${id}`);
export const createProduct = (data) => adminApi.post('/products', data);
export const updateProduct = (id, data) => adminApi.put(`/products/${id}`, data);
export const deleteProduct = (id) => adminApi.delete(`/products/${id}`);

// Orders
export const getOrders = () => adminApi.get('/orders');
export const getOrder = (id) => adminApi.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => adminApi.put(`/orders/${id}/status`, { status });

// Users
export const getUsers = () => adminApi.get('/users');
export const getUser = (id) => adminApi.get(`/users/${id}`);
export const createUser = (data) => adminApi.post('/users', data);
export const updateUser = (id, data) => adminApi.put(`/users/${id}`, data);
export const deleteUser = (id) => adminApi.delete(`/users/${id}`);

// Categories
export const getCategories = () => adminApi.get('/categories');
export const getCategory = (id) => adminApi.get(`/categories/${id}`);
export const createCategory = (data) => adminApi.post('/categories', data);
export const updateCategory = (id, data) => adminApi.put(`/categories/${id}`, data);
export const deleteCategory = (id) => adminApi.delete(`/categories/${id}`);

// Settings
export const getSettings = () => adminApi.get('/settings');
export const updateSettings = (data) => adminApi.put('/settings', data);

export default adminApi; 