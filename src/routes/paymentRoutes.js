const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const paypalService = require('../services/paypalService');
const Order = require('../models/Order');
const emailService = require('../services/emailService');

// Create PayPal order
router.post('/create-order/:orderId', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const paypalOrder = await paypalService.createOrder(order);
    res.json(paypalOrder);
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// Capture PayPal order
router.post('/capture-order/:orderId', authenticateUser, async (req, res) => {
  try {
    const { paypalOrderId } = req.body;
    const order = await Order.findById(req.params.orderId)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const captureResult = await paypalService.captureOrder(paypalOrderId);

    // Update order status
    order.paymentStatus = 'Completed';
    order.status = 'Processing';
    order.paymentDetails = {
      method: 'PayPal',
      transactionId: captureResult.id,
      status: captureResult.status,
      amount: captureResult.amount.value,
      currency: captureResult.amount.currency_code,
    };

    await order.save();

    // Send order confirmation email
    await emailService.sendOrderConfirmation(order, order.user);

    res.json({
      message: 'Payment successful',
      order: order,
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

// Get PayPal order details
router.get('/order-details/:paypalOrderId', authenticateUser, async (req, res) => {
  try {
    const orderDetails = await paypalService.getOrderDetails(req.params.paypalOrderId);
    res.json(orderDetails);
  } catch (error) {
    console.error('Error getting PayPal order details:', error);
    res.status(500).json({ message: 'Error getting order details' });
  }
});

// Refund order
router.post('/refund/:orderId', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await Order.findById(req.params.orderId)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const refundResult = await paypalService.refundOrder(
      order.paymentDetails.transactionId,
      amount
    );

    // Update order status
    order.paymentStatus = 'Refunded';
    order.status = 'Cancelled';
    order.refundDetails = {
      transactionId: refundResult.id,
      status: refundResult.status,
      amount: refundResult.amount.value,
      currency: refundResult.amount.currency_code,
      refundedAt: new Date(),
    };

    await order.save();

    // Send order status update email
    await emailService.sendOrderStatusUpdate(order, order.user);

    res.json({
      message: 'Refund successful',
      order: order,
    });
  } catch (error) {
    console.error('Error refunding order:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
});

module.exports = router; 