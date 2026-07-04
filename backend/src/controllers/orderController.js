import { Order } from '../models/Order.js';

export const listOrders = async (_req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
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

  order.status = status;
  order.timeline.push({
    label: status === 'closed' ? 'Order closed' : 'Order reopened',
    at: new Date(),
  });

  await order.save();
  res.json(order);
};
