const { pool } = require('../config/database');

class Order {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT o.*, u.name as userName, u.email as userEmail 
      FROM orders o 
      JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT o.*, u.name as userName, u.email as userEmail 
      FROM orders o 
      JOIN users u ON o.userId = u.id 
      WHERE o.id = ?
    `, [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT o.*, u.name as userName, u.email as userEmail 
      FROM orders o 
      JOIN users u ON o.userId = u.id 
      WHERE o.userId = ?
      ORDER BY o.createdAt DESC
    `, [userId]);
    return rows;
  }

  static async create(orderData) {
    const {
      userId,
      shippingAddress,
      paymentMethod,
      status = 'Pending',
      subtotal,
      tax,
      shippingCost,
      total,
      notes,
      trackingNumber,
      estimatedDelivery
    } = orderData;

    const [result] = await pool.query(
      `INSERT INTO orders (
        userId, shippingAddress, paymentMethod, status, 
        subtotal, tax, shippingCost, total, notes, 
        trackingNumber, estimatedDelivery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, shippingAddress, paymentMethod, status,
        subtotal, tax, shippingCost, total, notes,
        trackingNumber, estimatedDelivery
      ]
    );

    return this.findById(result.insertId);
  }

  static async update(id, orderData) {
    const {
      status,
      trackingNumber,
      estimatedDelivery,
      notes
    } = orderData;

    await pool.query(
      `UPDATE orders 
       SET status = ?, trackingNumber = ?, estimatedDelivery = ?, notes = ?
       WHERE id = ?`,
      [status, trackingNumber, estimatedDelivery, notes, id]
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
  }

  static async updateStatus(id, status) {
    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  static async addOrderItem(orderId, itemData) {
    const { productId, quantity, price } = itemData;
    await pool.query(
      'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, quantity, price]
    );
  }

  static async getOrderItems(orderId) {
    const [rows] = await pool.query(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.productId = p.id
      WHERE oi.orderId = ?
    `, [orderId]);
    return rows;
  }

  static async calculateTotals(items, shippingCost) {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax + shippingCost;

    return {
      subtotal,
      tax,
      shippingCost,
      total
    };
  }
}

module.exports = Order; 