import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import { Subcollection } from '../models/Subcollection.js';
import { slugify } from '../utils/slug.js';

const createUniqueSubcollectionSlug = async (collectionId, name, excludeId = null) => {
  const base = slugify(name) || 'subcollection';
  let slug = base;
  let counter = 1;

  while (true) {
    const query = { collectionId, slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Subcollection.findOne(query).select('_id');
    if (!existing) {
      return slug;
    }

    counter += 1;
    slug = `${base}-${counter}`;
  }
};

const getCollectionOr404 = async (collectionId, res) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    res.status(404).json({ error: 'Collection not found.' });
    return null;
  }
  return collection;
};

export const listSubcollections = async (req, res) => {
  const collection = await getCollectionOr404(req.params.collectionId, res);
  if (!collection) return;

  const subcollections = await Subcollection.find({ collectionId: collection._id })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  res.json(subcollections);
};

export const createSubcollection = async (req, res) => {
  try {
    const collection = await getCollectionOr404(req.params.collectionId, res);
    if (!collection) return;

    const name = String(req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Subcollection name is required.' });
    }

    const maxSort = await Subcollection.findOne({ collectionId: collection._id })
      .sort({ sortOrder: -1 })
      .select('sortOrder');
    const slug = await createUniqueSubcollectionSlug(collection._id, name);

    const subcollection = await Subcollection.create({
      collectionId: collection._id,
      name,
      slug,
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    });

    res.status(201).json(subcollection);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'A subcollection with that name already exists in this collection.' });
    }
    console.error('Failed to create subcollection:', err);
    return res.status(500).json({ error: 'Failed to create subcollection.' });
  }
};

export const updateSubcollection = async (req, res) => {
  try {
    const collection = await getCollectionOr404(req.params.collectionId, res);
    if (!collection) return;

    const subcollection = await Subcollection.findOne({
      _id: req.params.subcollectionId,
      collectionId: collection._id,
    });

    if (!subcollection) {
      return res.status(404).json({ error: 'Subcollection not found.' });
    }

    const name = String(req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Subcollection name is required.' });
    }

    subcollection.name = name;
    subcollection.slug = await createUniqueSubcollectionSlug(
      collection._id,
      name,
      subcollection._id,
    );
    await subcollection.save();

    res.json(subcollection);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'A subcollection with that name already exists in this collection.' });
    }
    console.error('Failed to update subcollection:', err);
    return res.status(500).json({ error: 'Failed to update subcollection.' });
  }
};

export const deleteSubcollection = async (req, res) => {
  const collection = await getCollectionOr404(req.params.collectionId, res);
  if (!collection) return;

  const subcollection = await Subcollection.findOneAndDelete({
    _id: req.params.subcollectionId,
    collectionId: collection._id,
  });

  if (!subcollection) {
    return res.status(404).json({ error: 'Subcollection not found.' });
  }

  await Product.updateMany(
    { collectionId: collection._id, subCollectionId: subcollection._id },
    { $unset: { subCollectionId: '' } },
  );

  res.json({ success: true });
};

export const reorderSubcollections = async (req, res) => {
  const collection = await getCollectionOr404(req.params.collectionId, res);
  if (!collection) return;

  const orderedIds = Array.isArray(req.body?.orderedIds) ? req.body.orderedIds : [];
  if (!orderedIds.length) {
    return res.status(400).json({ error: 'orderedIds array is required.' });
  }

  const updates = orderedIds.map((id, index) => Subcollection.updateOne(
    { _id: id, collectionId: collection._id },
    { $set: { sortOrder: index } },
  ));

  await Promise.all(updates);

  const subcollections = await Subcollection.find({ collectionId: collection._id })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  res.json(subcollections);
};
