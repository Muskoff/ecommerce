const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.hbs`);
    const template = await fs.readFile(templatePath, 'utf-8');
    return handlebars.compile(template);
  }

  async sendEmail(to, subject, templateName, context) {
    try {
      const template = await this.loadTemplate(templateName);
      const html = template(context);

      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Order confirmation email
  async sendOrderConfirmation(order, user) {
    const context = {
      orderNumber: order._id,
      customerName: user.name,
      orderDate: order.createdAt.toLocaleDateString(),
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shippingCost: order.shippingCost,
      total: order.total,
      shippingAddress: order.shippingAddress,
    };

    await this.sendEmail(
      user.email,
      'Order Confirmation',
      'orderConfirmation',
      context
    );
  }

  // Order status update email
  async sendOrderStatusUpdate(order, user) {
    const context = {
      orderNumber: order._id,
      customerName: user.name,
      status: order.status,
      orderDate: order.createdAt.toLocaleDateString(),
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      shippingAddress: order.shippingAddress,
    };

    await this.sendEmail(
      user.email,
      'Order Status Update',
      'orderStatusUpdate',
      context
    );
  }

  // Password reset email
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const context = {
      name: user.name,
      resetUrl,
      expiryTime: '1 hour',
    };

    await this.sendEmail(
      user.email,
      'Password Reset Request',
      'passwordReset',
      context
    );
  }

  // Welcome email
  async sendWelcomeEmail(user) {
    const context = {
      name: user.name,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
    };

    await this.sendEmail(
      user.email,
      'Welcome to Our Store!',
      'welcome',
      context
    );
  }
}

module.exports = new EmailService(); 