const paypal = require('@paypal/checkout-server-sdk');

// PayPal client configuration
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

class PayPalService {
  async createOrder(order) {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: order.total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: order.subtotal.toFixed(2)
              },
              tax_total: {
                currency_code: 'USD',
                value: order.tax.toFixed(2)
              },
              shipping: {
                currency_code: 'USD',
                value: order.shippingCost.toFixed(2)
              }
            }
          },
          items: order.items.map(item => ({
            name: item.product.name,
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString()
          })),
          shipping: {
            address: {
              address_line_1: order.shippingAddress.street,
              admin_area_2: order.shippingAddress.city,
              admin_area_1: order.shippingAddress.state,
              postal_code: order.shippingAddress.zipCode,
              country_code: order.shippingAddress.country
            }
          }
        }]
      });

      const response = await client.execute(request);
      return response.result;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  async captureOrder(paypalOrderId) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
      const response = await client.execute(request);
      return response.result;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }

  async getOrderDetails(paypalOrderId) {
    try {
      const request = new paypal.orders.OrdersGetRequest(paypalOrderId);
      const response = await client.execute(request);
      return response.result;
    } catch (error) {
      console.error('Error getting PayPal order details:', error);
      throw error;
    }
  }

  async refundOrder(paypalOrderId, amount) {
    try {
      const request = new paypal.payments.CapturesRefundRequest(paypalOrderId);
      request.requestBody({
        amount: {
          value: amount.toFixed(2),
          currency_code: 'USD'
        }
      });
      const response = await client.execute(request);
      return response.result;
    } catch (error) {
      console.error('Error refunding PayPal order:', error);
      throw error;
    }
  }
}

module.exports = new PayPalService(); 