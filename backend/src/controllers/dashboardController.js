import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const getDashboardStats = async (_req, res) => {
  const [productCount, collectionCount, openOrderCount, recentProducts] = await Promise.all([
    Product.countDocuments(),
    Collection.countDocuments({ isSystem: false }),
    Order.countDocuments({ status: 'open' }),
    Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price photos createdAt')
      .lean(),
  ]);

  res.json({
    productCount,
    collectionCount,
    openOrderCount,
    recentProducts,
  });
};
