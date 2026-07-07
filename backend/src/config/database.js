import mongoose from 'mongoose';
import { config } from './index.js';
import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import { Subcollection } from '../models/Subcollection.js';
import { seedAuthorizedUsers } from '../services/authorizedUsers.js';

const inferSubcollectionName = (productName, subcollectionNames) => {
  const name = String(productName || '').toLowerCase();
  const sorted = [...subcollectionNames].sort((left, right) => right.length - left.length);

  for (const subcollectionName of sorted) {
    const key = subcollectionName.toLowerCase();

    if (key === 't-shirts' && (name.includes('t-shirt') || name.includes('tshirt'))) {
      return subcollectionName;
    }
    if (key === 'sweatshirts' && name.includes('sweatshirt')) {
      return subcollectionName;
    }
    if (key === 'vests' && name.includes('vest')) {
      return subcollectionName;
    }
    if (key === 'bracelets' && name.includes('bracelet')) {
      return subcollectionName;
    }
    if (key === 'fanny packs' && name.includes('fanny pack')) {
      return subcollectionName;
    }
    if (key === 'wallets' && name.includes('wallet')) {
      return subcollectionName;
    }
    if (key === 'accessories' && (name.includes('barrette') || name.includes('accessory'))) {
      return subcollectionName;
    }
    if (key === 'bags' && (
      name.includes('bag')
      || name.includes('duffel')
      || name.includes('pack')
      || name.includes('wristlet')
    )) {
      return subcollectionName;
    }
  }

  return null;
};

const migrateLegacySubcollectionFields = async () => {
  const legacyProducts = await Product.find({
    subcollectionIds: { $exists: true },
  }).select('subcollectionIds subCollectionId');

  const migrations = legacyProducts
    .map((product) => {
      const legacyId = Array.isArray(product.subcollectionIds)
        ? product.subcollectionIds.find(Boolean)
        : null;

      if (!legacyId) {
        return Product.updateOne(
          { _id: product._id },
          { $unset: { subcollectionIds: '' } },
        );
      }

      return Product.updateOne(
        { _id: product._id },
        {
          $set: { subCollectionId: legacyId },
          $unset: { subcollectionIds: '' },
        },
      );
    });

  if (!migrations.length) {
    return;
  }

  await Promise.all(migrations);
  console.log(`ℹ️ Migrated legacy subcollection fields for ${migrations.length} products.`);
};

const backfillProductSubcollectionIds = async () => {
  const subcollections = await Subcollection.find().lean();
  if (!subcollections.length) {
    return;
  }

  const subcollectionsByCollectionId = subcollections.reduce((groups, subcollection) => {
    const collectionId = String(subcollection.collectionId);
    if (!groups[collectionId]) {
      groups[collectionId] = [];
    }
    groups[collectionId].push(subcollection);
    return groups;
  }, {});

  const products = await Product.find().select('name collectionId subCollectionId');

  const updates = [];

  for (const product of products) {
    const collectionSubcollections = subcollectionsByCollectionId[String(product.collectionId)] || [];
    if (!collectionSubcollections.length) {
      continue;
    }

    const subcollectionNames = collectionSubcollections.map((item) => item.name);
    const inferredName = inferSubcollectionName(product.name, subcollectionNames);
    if (!inferredName) {
      continue;
    }

    const subcollection = collectionSubcollections.find(
      (item) => item.name.toLowerCase() === inferredName.toLowerCase(),
    );
    if (!subcollection) {
      continue;
    }

    if (String(product.subCollectionId || '') === String(subcollection._id)) {
      continue;
    }

    updates.push(Product.updateOne(
      { _id: product._id },
      { $set: { subCollectionId: subcollection._id } },
    ));
  }

  if (!updates.length) {
    return;
  }

  await Promise.all(updates);
  console.log(`ℹ️ Backfilled subCollectionId for ${updates.length} products.`);
};

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

  await migrateLegacySubcollectionFields();
  await backfillProductSubcollectionIds();
  await seedAuthorizedUsers();
  console.log('ℹ️ Ensured authorized dashboard users exist');
};
