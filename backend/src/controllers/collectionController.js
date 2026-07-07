import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import { Subcollection } from '../models/Subcollection.js';
import { createUniqueSlug } from '../utils/slug.js';

const getUncategorizedCollection = async () => Collection.findOne({ isSystem: true, slug: 'uncategorized' });

export const listCollections = async (_req, res) => {
  const collections = await Collection.find().sort({ sortOrder: 1, name: 1 }).lean();
  res.json(collections);
};

export const createCollection = async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Collection name is required.' });
  }

  const maxSort = await Collection.findOne({ isSystem: false }).sort({ sortOrder: -1 }).select('sortOrder');
  const slug = await createUniqueSlug(Collection, name);

  const collection = await Collection.create({
    name,
    slug,
    sortOrder: (maxSort?.sortOrder ?? -1) + 1,
  });

  res.status(201).json(collection);
};

export const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found.' });
    }

    if (collection.isSystem) {
      return res.status(400).json({ error: 'System collections cannot be renamed.' });
    }

    const name = String(req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required.' });
    }

    collection.name = name;
    collection.slug = await createUniqueSlug(Collection, name, collection._id);
    await collection.save();

    res.json(collection);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'A collection with that name already exists.' });
    }
    console.error('Failed to update collection:', err);
    return res.status(500).json({ error: 'Failed to update collection.' });
  }
};

export const reorderCollections = async (req, res) => {
  const orderedIds = Array.isArray(req.body?.orderedIds) ? req.body.orderedIds : [];
  if (!orderedIds.length) {
    return res.status(400).json({ error: 'orderedIds array is required.' });
  }

  const updates = orderedIds.map((id, index) => Collection.updateOne(
    { _id: id, isSystem: false },
    { $set: { sortOrder: index } },
  ));

  await Promise.all(updates);
  const collections = await Collection.find().sort({ sortOrder: 1, name: 1 }).lean();
  res.json(collections);
};

export const deleteCollection = async (req, res) => {
  // console.log("delte collection")
  // console.log(req.params.id)
  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    return res.status(404).json({ error: 'Collection not found.' });
  }

  if (collection.isSystem) {
    return res.status(400).json({ error: 'System collections cannot be deleted.' });
  }

  const uncategorized = await getUncategorizedCollection();
  if (!uncategorized) {
    return res.status(500).json({ error: 'Uncategorized collection is missing.' });
  }

  const products = await Product.find({ collectionId: collection._id }).sort({ sortOrder: 1 });
  const uncategorizedCount = await Product.countDocuments({ collectionId: uncategorized._id });
  const moveUpdates = products.map((product, index) => Product.updateOne(
    { _id: product._id },
    {
      $set: { collectionId: uncategorized._id, sortOrder: uncategorizedCount + index },
      $unset: { subCollectionId: '' },
    },
  ));

  await Promise.all(moveUpdates);
  await Subcollection.deleteMany({ collectionId: collection._id });
  await collection.deleteOne();

  res.json({ success: true, movedProducts: products.length });
};
