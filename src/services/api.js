const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  // Products
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/products?${queryString}`);
    return handleResponse(response);
  },

  getProduct: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`);
    return handleResponse(response);
  },

  getCategory: async (id) => {
    const response = await fetch(`${API_URL}/categories/${id}`);
    return handleResponse(response);
  },

  // Featured Products
  getFeaturedProducts: async () => {
    const response = await fetch(`${API_URL}/products?featured=true`);
    return handleResponse(response);
  },
}; 