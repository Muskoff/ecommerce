const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const Settings = require('../models/Settings');

// Create email transporter
const createTransporter = async () => {
  const emailSettings = await Settings.getEmailSettings();
  
  return nodemailer.createTransport({
    host: emailSettings.smtpHost,
    port: emailSettings.smtpPort,
    secure: emailSettings.smtpPort === 465,
    auth: {
      user: emailSettings.smtpUsername,
      pass: emailSettings.smtpPassword
    }
  });
};

// Read and compile template
const compileTemplate = async (templateName) => {
  const templatePath = path.join(__dirname, '../templates/email', templateName);
  const template = await fs.readFile(templatePath, 'utf-8');
  return handlebars.compile(template);
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = await createTransporter();
    const generalSettings = await Settings.getGeneralSettings();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const template = await compileTemplate('passwordReset.hbs');
    const html = template({
      resetUrl,
      siteName: generalSettings.siteName
    });

    const mailOptions = {
      from: `"${generalSettings.siteName}" <${generalSettings.contactEmail}>`,
      to: email,
      subject: 'Password Reset Request',
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, order) => {
  try {
    const transporter = await createTransporter();
    const generalSettings = await Settings.getGeneralSettings();
    
    const template = await compileTemplate('orderConfirmation.hbs');
    const html = template({
      customerName: order.shippingAddress.name,
      orderId: order.id,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      total: order.total,
      shippingAddress: order.shippingAddress,
      siteName: generalSettings.siteName
    });

    const mailOptions = {
      from: `"${generalSettings.siteName}" <${generalSettings.contactEmail}>`,
      to: email,
      subject: `Order Confirmation - ${order.id}`,
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (email, order) => {
  try {
    const transporter = await createTransporter();
    const generalSettings = await Settings.getGeneralSettings();
    
    const template = await compileTemplate('orderStatusUpdate.hbs');
    const html = template({
      customerName: order.shippingAddress.name,
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      orderUrl: `${process.env.FRONTEND_URL}/orders/${order.id}`,
      siteName: generalSettings.siteName
    });

    const mailOptions = {
      from: `"${generalSettings.siteName}" <${generalSettings.contactEmail}>`,
      to: email,
      subject: `Order Status Update - ${order.id}`,
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
}; 