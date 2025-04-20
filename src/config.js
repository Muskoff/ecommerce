export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const USER_ROLES = ['Admin', 'Customer'];

export const PRODUCT_STATUSES = ['Active', 'Inactive'];

export const CATEGORY_STATUSES = ['Active', 'Inactive']; 