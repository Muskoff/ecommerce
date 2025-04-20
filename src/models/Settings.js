const { pool } = require('../config/database');

class Settings {
  static async getSettings() {
    try {
      const [rows] = await pool.query('SELECT * FROM settings');
      
      if (rows.length === 0) {
        return this.createDefaultSettings();
      }
      
      return this.formatSettings(rows);
    } catch (error) {
      console.error('Error in getSettings:', error);
      throw error;
    }
  }

  static async updateSettings(settings) {
    try {
      const { key_name, value } = settings;
      await pool.query(
        'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
        [key_name, JSON.stringify(value), JSON.stringify(value)]
      );
      return this.getSettings();
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  }

  static async createDefaultSettings() {
    try {
      const defaultSettings = {
        general: {
          siteName: 'E-Commerce Store',
          siteDescription: 'Your one-stop shop for everything',
          contactEmail: 'contact@example.com',
          phoneNumber: '+1 (555) 123-4567',
          address: '123 Main St, City, Country',
          enableRegistration: true,
          enableGuestCheckout: true,
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          maintenanceMode: false,
        },
        email: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpUsername: 'noreply@example.com',
          smtpPassword: '********',
          fromEmail: 'noreply@example.com',
          fromName: 'E-Commerce Store',
          enableEmailNotifications: true,
        },
        payment: {
          enableStripe: false,
          enablePayPal: false,
          defaultPaymentMethod: 'Stripe',
        },
        shipping: {
          defaultShippingCost: 0,
          freeShippingThreshold: 0,
          enableFreeShipping: false,
        },
        security: {
          enableTwoFactorAuth: false,
          maxLoginAttempts: 5,
          sessionTimeout: 30,
          enableCaptcha: false,
        }
      };

      for (const [key, value] of Object.entries(defaultSettings)) {
        await pool.query(
          'INSERT INTO settings (key_name, value) VALUES (?, ?)',
          [key, JSON.stringify(value)]
        );
      }

      return defaultSettings;
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      throw error;
    }
  }

  static formatSettings(rows) {
    try {
      const settings = {};
      
      // Handle both single row and array of rows
      if (Array.isArray(rows)) {
        rows.forEach(row => {
          try {
            settings[row.key_name] = JSON.parse(row.value);
          } catch (e) {
            console.error(`Error parsing JSON for key ${row.key_name}:`, e);
            settings[row.key_name] = row.value;
          }
        });
      } else if (rows && typeof rows === 'object') {
        // Handle single row object
        try {
          settings[rows.key_name] = JSON.parse(rows.value);
        } catch (e) {
          console.error(`Error parsing JSON for key ${rows.key_name}:`, e);
          settings[rows.key_name] = rows.value;
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Error in formatSettings:', error);
      return {};
    }
  }

  static async getGeneralSettings() {
    const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', ['general']);
    return rows.length > 0 ? JSON.parse(rows[0].value) : null;
  }

  static async getEmailSettings() {
    const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', ['email']);
    return rows.length > 0 ? JSON.parse(rows[0].value) : null;
  }

  static async getPaymentSettings() {
    const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', ['payment']);
    return rows.length > 0 ? JSON.parse(rows[0].value) : null;
  }

  static async getShippingSettings() {
    const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', ['shipping']);
    return rows.length > 0 ? JSON.parse(rows[0].value) : null;
  }

  static async getSecuritySettings() {
    const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', ['security']);
    return rows.length > 0 ? JSON.parse(rows[0].value) : null;
  }

  static async updateGeneralSettings(settings) {
    await pool.query(
      'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['general', JSON.stringify(settings), JSON.stringify(settings)]
    );
    return this.getGeneralSettings();
  }

  static async updateEmailSettings(settings) {
    await pool.query(
      'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['email', JSON.stringify(settings), JSON.stringify(settings)]
    );
    return this.getEmailSettings();
  }

  static async updatePaymentSettings(settings) {
    await pool.query(
      'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['payment', JSON.stringify(settings), JSON.stringify(settings)]
    );
    return this.getPaymentSettings();
  }

  static async updateShippingSettings(settings) {
    await pool.query(
      'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['shipping', JSON.stringify(settings), JSON.stringify(settings)]
    );
    return this.getShippingSettings();
  }

  static async updateSecuritySettings(settings) {
    await pool.query(
      'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['security', JSON.stringify(settings), JSON.stringify(settings)]
    );
    return this.getSecuritySettings();
  }
}

module.exports = Settings; 