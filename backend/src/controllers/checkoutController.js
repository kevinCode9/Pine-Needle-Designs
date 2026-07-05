import { DISCOUNT_RULES } from '../constants/index.js';
import { config } from '../config/index.js';
import { ordersController, paypal } from '../services/paypal.js';
import { getEmailRecipients, getEmailSender, mailerConfigured, sendEmail } from '../services/mailer.js';
import { persistCapturedOrder } from '../services/orderPersistence.js';

const orderMap = new Map();

const getDiscountAmount = (total, code) => {
  if (!code || typeof code !== 'string') return 0;

  const rule = DISCOUNT_RULES[code.trim().toUpperCase()];
  if (!rule) return 0;

  if (rule.type === 'fixed') {
    return Math.min(rule.value, total);
  }

  return Number(((total * rule.value) / 100).toFixed(2));
};

export const createCheckout = async (req, res) => {
  try {
    const { code, customer, billingAddress, shippingAddress } = req.body || {};
    const cart = req.session.cart || [];

    if (!customer?.email || !customer?.phone || !customer?.type) {
      return res.status(400).json({ error: 'Customer email, phone, and type are required for checkout.' });
    }

    if (!billingAddress?.name || !billingAddress?.address1 || !billingAddress?.city || !billingAddress?.state || !billingAddress?.zip) {
      return res.status(400).json({ error: 'Complete billing address is required.' });
    }

    if (!shippingAddress?.name || !shippingAddress?.address1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
      return res.status(400).json({ error: 'Complete shipping address is required.' });
    }

    const itemDescription = (item) => {
      const selectedOptions = item.selectedOptions
        ? Object.entries(item.selectedOptions).map(([name, value]) => `${name}: ${value}`).join(', ')
        : '';
      return [item.description, selectedOptions].filter(Boolean).join(' | ');
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = getDiscountAmount(total, code);
    const totalAfterDiscount = Math.max(0, total - discount);

    const orderItems = cart.map((item) => ({
      name: item.title,
      quantity: item.quantity.toString(),
      unitAmount: {
        currencyCode: 'USD',
        value: item.price.toFixed(2),
      },
      description: itemDescription(item),
    }));

    if (discount > 0) {
      orderItems.push({
        name: `Discount${code ? ` (${code.trim().toUpperCase()})` : ''}`,
        quantity: '1',
        unitAmount: {
          currencyCode: 'USD',
          value: (-discount).toFixed(2),
        },
        description: 'Applied discount code',
      });
    }

    const order = await ordersController.createOrder({
      prefer: 'return=representation',
      body: {
        intent: paypal.CheckoutPaymentIntent.Capture,
        purchaseUnits: [{
          amount: {
            currencyCode: 'USD',
            value: totalAfterDiscount.toFixed(2),
            breakdown: {
              itemTotal: {
                currencyCode: 'USD',
                value: totalAfterDiscount.toFixed(2),
              },
            },
          },
          items: orderItems,
        }],
        applicationContext: {
          returnUrl: `${config.appBaseUrl}/order-success`,
          cancelUrl: `${config.appBaseUrl}/cancel`,
        },
      },
    });

    const orderBody = JSON.parse(order.body);
    const link = orderBody.links.find((orderLink) => orderLink.rel === 'approve').href;

    orderMap.set(orderBody.id, {
      items: orderBody.purchase_units[0].items,
      customer: {
        type: customer.type,
        email: customer.email,
        phone: customer.phone,
      },
      billingAddress,
      shippingAddress,
      discountCode: code ? code.trim().toUpperCase() : '',
      summary: req.body.summary,
      lineItems: req.body.lineItems,
      tax: req.body.tax,
    });

    res.json({ url: link });
  } catch (err) {
    console.error('Error in /api/checkout:', err?.stack || err);
    res.status(500).json({
      error: 'Error creating PayPal order',
      message: err?.message ? err.message : String(err),
    });
  }
};

export const captureOrder = async (req, res) => {
  try {
    const { token } = req.params;
    const request = await ordersController.captureOrder({ id: token });

    res.json({ success: true });

    const order = JSON.parse(request.body);
    const storedOrder = orderMap.get(order.id);
    if (!storedOrder) return;

    const {
      items, customer, billingAddress, shippingAddress, discountCode,
    } = storedOrder;
    const money = (value) => `$${Number(value || 0).toFixed(2)}`;
    const summary = storedOrder.summary || {};
    const lineItems = storedOrder.lineItems || [];

    try {
      await persistCapturedOrder({
        paypalOrderId: order.id,
        customer,
        billingAddress,
        shippingAddress,
        discountCode,
        items,
        lineItems,
        summary,
        tax: storedOrder.tax || {},
      });
    } catch (persistErr) {
      console.error('Failed to persist order:', persistErr);
    }

    const itemsHtml = items.map((item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${money(item.unit_amount.value)}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${money(Number(item.quantity) * Number(item.unit_amount.value))}</td>
      </tr>
    `).join('');

    const lineItemsHtml = lineItems.map((line) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">${line.title}</td>
        <td style="text-align:center;">${line.quantity}</td>
        <td style="text-align:right;">${money(line.subtotal)}</td>
        <td style="text-align:right;">${line.discountPercentDisplay} (${money(line.discountAmount)})</td>
        <td style="text-align:right;">${line.taxRateDisplay} (${money(line.taxAmount)})</td>
        <td style="text-align:right;">${money(line.lineTotal)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px;">
        <div style="max-width:900px;margin:auto;background:white;padding:20px;border-radius:10px;">
          <h2 style="margin:0;">🧾 New Order Received</h2>
          <p style="color:#666;">Order ID: <b>${order.id}</b></p>
          <hr>
          <h3>👤 Customer</h3>
          <p>Type: ${customer.type}<br>Email: ${customer.email}<br>Phone: ${customer.phone}</p>
          <h3>📦 Billing Address</h3>
          <p>${billingAddress.name}<br>${billingAddress.address1}<br>${billingAddress.address2 || ''}<br>${billingAddress.city}, ${billingAddress.state} ${billingAddress.zip}</p>
          <h3>🚚 Shipping Address</h3>
          <p>${shippingAddress.name}<br>${shippingAddress.address1}<br>${shippingAddress.address2 || ''}<br>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}</p>
          ${discountCode ? `<p><b>Discount Code:</b> ${discountCode}</p>` : ''}
          <hr>
          <h3>📦 Items (PayPal)</h3>
          <table width="100%" cellpadding="0" cellspacing="0"><tbody>${itemsHtml}</tbody></table>
          <hr>
          <h3>📊 Full Order Breakdown</h3>
          <table width="100%" cellpadding="0" cellspacing="0"><tbody>${lineItemsHtml}</tbody></table>
          <hr>
          <h3>💰 Summary</h3>
          <p>Subtotal: <b>${money(summary.subtotal)}</b><br>Discount: <b>-${money(summary.discount)}</b><br>Tax: <b>${money(summary.tax)}</b><br><b style="font-size:16px;">Final Total: ${money(summary.finalTotal)}</b></p>
        </div>
      </div>
    `;

    const text = `NEW ORDER RECEIVED\nOrder ID: ${order.id}\n\nCUSTOMER\nType: ${customer.type}\nEmail: ${customer.email}\nPhone: ${customer.phone}`;

    const customerReceiptHtml = `
      <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px;">
        <div style="max-width:700px;margin:auto;background:white;padding:30px;border-radius:10px;">
          <h2 style="margin-top:0;">Thank you for your order!</h2>
          <p>Hi ${shippingAddress.name},</p>
          <p>Your payment has been successfully received. Below is your receipt.</p>
          <hr>
          <p><strong>Order ID:</strong> ${order.id}<br><strong>Email:</strong> ${customer.email}</p>
          <h3>Items</h3>
          <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
            <tbody>
              ${items.map((item) => `
                <tr>
                  <td>${item.name}</td>
                  <td align="center">${item.quantity}</td>
                  <td align="right">$${Number(item.unit_amount.value).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr>
          <h3>Summary</h3>
          <p>Subtotal: $${Number(summary.subtotal || 0).toFixed(2)}<br>Discount: -$${Number(summary.discount || 0).toFixed(2)}<br>Tax: $${Number(summary.tax || 0).toFixed(2)}<br><strong>Total Paid: $${Number(summary.finalTotal || 0).toFixed(2)}</strong></p>
          <hr>
          <h3>Shipping Address</h3>
          <p>${shippingAddress.name}<br>${shippingAddress.address1}<br>${shippingAddress.address2 || ''}<br>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}</p>
          <p style="margin-top:20px;">If you have any questions, call (315) 272-8928</p>
          <p>— Pine Needle Designs</p>
        </div>
      </div>
    `;

    try {
      if (!mailerConfigured) {
        throw new Error('Mailer is not configured. Set RESEND_API_KEY in production or EMAIL_APP_PASSWORD locally.');
      }

      const [adminInfo, customerInfo] = await Promise.all([
        sendEmail({
          from: `"Pine Needle Designs" <${getEmailSender()}>`,
          to: getEmailRecipients(),
          subject: `Order #${order.id}`,
          html,
          text,
        }),
        sendEmail({
          to: customer.email,
          subject: `Receipt for Order ${order.id}`,
          html: customerReceiptHtml,
          text: `Receipt for Order ${order.id} - Total: $${summary.finalTotal}`,
        }),
      ]);

      console.log('✅ Admin email sent:', adminInfo.messageId);
      console.log('✅ Customer receipt sent:', customerInfo.messageId);
    } catch (mailErr) {
      console.error('❌ Email sending failed:', mailErr);
    }

    orderMap.delete(order.id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
