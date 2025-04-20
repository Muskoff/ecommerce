const { pool } = require('../config/database');

class Category {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(categoryData) {
    const { name, description, parentId, image_url, isActive } = categoryData;
    
    // Validate required fields
    if (!name) {
      throw new Error('Category name is required');
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, description, parent_id, image_url, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', parentId || null, image_url || null, isActive !== false]
    );
    return this.findById(result.insertId);
  }

  static async update(id, categoryData) {
    const { name, description, parentId, image_url, isActive } = categoryData;
    
    // Validate required fields
    if (!name) {
      throw new Error('Category name is required');
    }

    await pool.query(
      'UPDATE categories SET name = ?, description = ?, parent_id = ?, image_url = ?, is_active = ? WHERE id = ?',
      [name, description || '', parentId || null, image_url || null, isActive !== false, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  }

  static async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE name = ?', [name]);
    return rows[0];
  }

  static async findByParentId(parentId) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE parent_id = ?', [parentId]);
    return rows;
  }
}

module.exports = Category; 