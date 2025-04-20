const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/fileUpload');
const {
  getDashboardStats,
  getRecentOrders,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getSettings,
  updateSettings,
  createAdminUser,
} = require('../controllers/adminController');

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-orders', getRecentOrders);

// Product routes
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', upload.array('images', 5), handleUploadError, createProduct);
router.put('/products/:id', upload.array('images', 5), handleUploadError, updateProduct);
router.delete('/products/:id', deleteProduct);

// Order routes
router.get('/orders', getOrders);
router.get('/orders/stats', getOrderStats);
router.get('/orders/:id', getOrder);
router.put('/orders/:id/status', updateOrderStatus);

// User routes
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Category routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', upload.single('image'), handleUploadError, createCategory);
router.put('/categories/:id', upload.single('image'), handleUploadError, updateCategory);
router.delete('/categories/:id', deleteCategory);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Admin user creation
router.post('/create-admin', createAdminUser);

module.exports = router; 