import mongoose from 'mongoose';
import { config } from './index.js';
import { Collection } from '../models/Collection.js';

export const connectDatabase = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('✅ MongoDB connected');

  const uncategorized = await Collection.findOne({ isSystem: true, slug: 'uncategorized' });
  if (!uncategorized) {
    await Collection.create({
      name: 'Uncategorized',
      slug: 'uncategorized',
      sortOrder: Number.MAX_SAFE_INTEGER,
      isSystem: true,
    });
    console.log('ℹ️ Created system Uncategorized collection');
  }
};
