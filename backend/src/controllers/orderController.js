import { Order } from '../models/Order.js';

const buildOrderFilter = (query) => {
  const status = String(query?.status || 'all').toLowerCase();
  if (status === 'open' || status === 'closed') {
    return { status };
  }
  return {};
};

export const listOrders = async (req, res) => {
  const orders = await Order.find(buildOrderFilter(req.query))
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  res.json(order);
};

export const updateOrderStatus = async (req, res) => {
  
  const status = String(req.body?.status || '').toLowerCase();

  if (!['open', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be open or closed.' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (order.status === status) {
    return res.json(order);
  }

  order.status = status;
  order.timeline.push({
    label: status === 'closed' ? 'Order closed' : 'Order reopened',
    at: new Date(),
  });

  await order.save();
  res.json(order);
};
