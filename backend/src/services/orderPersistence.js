import { Order } from '../models/Order.js';
import { getNextOrderNumber } from '../models/OrderCounter.js';

const normalizeSummary = (summary = {}) => {
  const subtotal = Number(summary.subtotal || 0);
  const discount = Number(summary.discount || 0);
  const tax = Number(summary.tax || 0);
  const discountedTotal = summary.discountedTotal !== undefined
    ? Number(summary.discountedTotal)
    : Math.max(0, subtotal - discount);
  const finalTotal = summary.finalTotal !== undefined
    ? Number(summary.finalTotal)
    : discountedTotal + tax;

  return {
    subtotal,
    discount,
    discountedTotal,
    tax,
    finalTotal,
  };
};

export const persistCapturedOrder = async ({
  paypalOrderId,
  customer,
  billingAddress,
  shippingAddress,
  discountCode,
  items,
  lineItems,
  summary,
  tax,
}) => {
  const payload = {
    customer: customer || {},
    billingAddress: billingAddress || {},
    shippingAddress: shippingAddress || {},
    discountCode: discountCode || '',
    items: Array.isArray(items) ? items : [],
    lineItems: Array.isArray(lineItems) ? lineItems : [],
    summary: normalizeSummary(summary),
    tax: tax || {},
  };

  const existing = await Order.findOne({ paypalOrderId });
  if (existing) {
    existing.set(payload);
    await existing.save();
    return existing;
  }

  const orderNumber = await getNextOrderNumber();
  return Order.create({
    orderNumber,
    paypalOrderId,
    status: 'open',
    timeline: [{ label: 'Order submitted', at: new Date() }],
    ...payload,
  });
};
