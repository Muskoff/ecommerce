const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT id, name, email, role, phone, address, city, state, zipCode, country, 
             resetPasswordToken, resetPasswordExpires, lastLogin, createdAt, updatedAt 
      FROM users
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT id, name, email, role, phone, address, city, state, zipCode, country, 
             resetPasswordToken, resetPasswordExpires, lastLogin, createdAt, updatedAt 
      FROM users WHERE id = ?
    `, [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { 
      name, 
      email, 
      password, 
      role = 'User', 
      phone = null, 
      address = null,
      city = null,
      state = null,
      zipCode = null,
      country = null
    } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.query(
      `INSERT INTO users (
        name, email, password, role, phone, address, 
        city, state, zipCode, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, phone, address, city, state, zipCode, country]
    );
    
    return this.findById(result.insertId);
  }

  static async update(id, userData) {
    const { 
      name, 
      email, 
      phone, 
      address,
      city,
      state,
      zipCode,
      country
    } = userData;
    
    await pool.query(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, address = ?,
           city = ?, state = ?, zipCode = ?, country = ?
       WHERE id = ?`,
      [name, email, phone, address, city, state, zipCode, country, id]
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }

  static async updatePassword(id, password) {
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async createPasswordResetToken(email) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await pool.query(
      'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?',
      [hashedToken, resetExpires, email]
    );
    
    return resetToken;
  }

  static async findByResetToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
      [hashedToken]
    );
    
    return rows[0];
  }

  static async updateLastLogin(id) {
    await pool.query(
      'UPDATE users SET lastLogin = NOW() WHERE id = ?',
      [id]
    );
  }
}

module.exports = User; 