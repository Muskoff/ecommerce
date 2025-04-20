const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalSales] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM orders
      WHERE status = 'Delivered'
    `);

    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [totalCustomers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "Customer"');
    
    const [averageOrderValue] = await pool.query(`
      SELECT COALESCE(AVG(total), 0) as avg
      FROM orders
    `);

    res.json({
      totalSales: totalSales[0].total,
      totalOrders: totalOrders[0].count,
      totalCustomers: totalCustomers[0].count,
      averageOrderValue: averageOrderValue[0].avg,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, u.name, u.email
      FROM orders o
      JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
      LIMIT 5
    `);
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Error fetching recent orders' });
  }
};

// Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await Product.findById(req.params.id);
    console.log('Product found:', product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, specifications, isActive } = req.body;
    
    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      images,
      specifications: specifications ? JSON.parse(specifications) : {},
      isActive: isActive === 'true'
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, specifications, isActive } = req.body;
    
    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const product = await Product.update(req.params.id, {
      name,
      description,
      price,
      stock,
      categoryId,
      images,
      specifications: specifications ? JSON.parse(specifications) : {},
      isActive: isActive === 'true'
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    // Get total orders count
    const [totalOrdersResult] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = totalOrdersResult[0].count;

    // Get total revenue (sum of total for all orders)
    const [totalRevenueResult] = await pool.query('SELECT COALESCE(SUM(total), 0) as total FROM orders');
    const totalRevenue = totalRevenueResult[0].total;

    // Get average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get pending orders count
    const [pendingOrdersResult] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "Pending"');
    const pendingOrders = pendingOrdersResult[0].count;

    // Get orders by status
    const [ordersByStatusResult] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);
    
    // Get orders by payment status
    const [ordersByPaymentStatusResult] = await pool.query(`
      SELECT paymentStatus, COUNT(*) as count 
      FROM orders 
      GROUP BY paymentStatus
    `);

    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      ordersByStatus: ordersByStatusResult,
      ordersByPaymentStatus: ordersByPaymentStatusResult
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ message: 'Error fetching order statistics', error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get order items
    const items = await Order.getOrderItems(req.params.id);
    order.items = items;
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.updateStatus(req.params.id, req.body.status);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Users
exports.getUsers = async (req, res) => {
  try {
    // Exclude password field from the results
    const [users] = await pool.query(`
      SELECT id, name, email, role, phone, address, city, state, zipCode, country,
             lastLogin, createdAt, updatedAt 
      FROM users
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'User' } = req.body;

    // Check if user already exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password, role });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { name, description, parentId, isActive } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Handle uploaded image
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Create category with all fields
    const category = await Category.create({
      name,
      description: description || '',
      parentId: parentId || null,
      image_url,
      isActive: isActive === 'true' || isActive === true
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { name, description, parentId, isActive } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Handle uploaded image
    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    // Update category with all fields
    const category = await Category.update(req.params.id, {
      name,
      description: description || '',
      parentId: parentId || null,
      image_url,
      isActive: isActive === 'true' || isActive === true
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

// Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.updateSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone = null, 
      address = null,
      city = null,
      state = null,
      zipCode = null,
      country = null
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [result] = await pool.query(
      `INSERT INTO users (
        name, email, password, role, phone, address,
        city, state, zipCode, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, 'Admin', phone, address, city, state, zipCode, country]
    );

    // Get the created user (excluding password)
    const [newUser] = await pool.query(`
      SELECT id, name, email, role, phone, address, city, state, zipCode, country,
             lastLogin, createdAt, updatedAt
      FROM users WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Admin user created successfully',
      user: newUser[0]
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Error creating admin user', error: error.message });
  }
}; 