const { pool } = require('../config/database');

class Product {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      ORDER BY p.createdAt DESC
    `);
    return rows;
  }

  static async findById(id) {
    console.log('Product.findById called with ID:', id);
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [id]);
    console.log('Product.findById query result:', rows);
    return rows[0];
  }

  static async create(productData) {
    const { name, description, price, stock, categoryId, images, specifications, isActive } = productData;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const [result] = await pool.query(
      'INSERT INTO products (name, slug, description, price, stock, categoryId, images, specifications, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, price, stock, categoryId, JSON.stringify(images), JSON.stringify(specifications), isActive]
    );
    return this.findById(result.insertId);
  }

  static async update(id, productData) {
    const { name, description, price, stock, categoryId, images, specifications, isActive } = productData;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    await pool.query(
      'UPDATE products SET name = ?, slug = ?, description = ?, price = ?, stock = ?, categoryId = ?, images = ?, specifications = ?, isActive = ? WHERE id = ?',
      [name, slug, description, price, stock, categoryId, JSON.stringify(images), JSON.stringify(specifications), isActive, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  }

  static async findByCategory(categoryId) {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.categoryId = ?
      ORDER BY p.createdAt DESC
    `, [categoryId]);
    return rows;
  }

  static async updateStock(id, quantity) {
    await pool.query(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, id]
    );
    return this.findById(id);
  }
}

module.exports = Product; 