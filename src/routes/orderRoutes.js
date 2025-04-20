const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/email');

// Get user's orders (main endpoint)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Alias for /my-orders
router.get('/my-orders', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get single order
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.userId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Create new order
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items and check stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      items,
      shippingAddress,
      paymentMethod
    });

    // Update product stock
    for (const item of items) {
      await Product.updateStock(item.productId, -item.quantity);
    }

    // Send order confirmation email
    await sendOrderConfirmationEmail(req.user.email, order);

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update order status' });
    }

    const { status } = req.body;
    const order = await Order.updateStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send status update email
    await sendOrderStatusUpdateEmail(order.userEmail, order);

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Cancel order
router.post('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to cancel this order
    if (order.userId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order can be cancelled
    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.updateStock(item.productId, item.quantity);
    }

    // Update order status
    const updatedOrder = await Order.updateStatus(req.params.id, 'Cancelled');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Get order items
router.get('/:id/items', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.userId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    const items = await Order.getOrderItems(req.params.id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Error fetching order items' });
  }
});

module.exports = router; 