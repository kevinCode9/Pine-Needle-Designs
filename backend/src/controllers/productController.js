import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import { Subcollection } from '../models/Subcollection.js';

const normalizeSubCollectionId = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const id = String(value).trim();
  return id || null;
};

const resolveSubCollectionId = async (collectionId, subCollectionId, { requireWhenAvailable = false } = {}) => {
  const id = normalizeSubCollectionId(subCollectionId);
  const subcollectionCount = await Subcollection.countDocuments({ collectionId });

  if (subcollectionCount > 0 && requireWhenAvailable && !id) {
    return { id: null, error: 'Subcollection is required for this collection.' };
  }

  if (!id) {
    return { id: null, error: null };
  }

  const subcollection = await Subcollection.findOne({ _id: id, collectionId }).select('_id');
  if (!subcollection) {
    return { id: null, error: 'Subcollection is invalid for this collection.' };
  }

  return { id: subcollection._id, error: null };
};

const normalizeCustomProperties = (properties) => {
  if (typeof properties === 'string') {
    try {
      return normalizeCustomProperties(JSON.parse(properties));
    } catch {
      return [];
    }
  }

  if (!Array.isArray(properties)) {
    return [];
  }

  return properties
    .map((property) => ({
      name: String(property?.name || '').trim(),
      required: Boolean(property?.required),
      options: Array.isArray(property?.options)
        ? property.options.map((option) => String(option || '').trim()).filter(Boolean)
        : [],
    }))
    .filter((property) => property.name);
};

const parseBooleanField = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return Boolean(value);
};

const parseRequestBody = (body) => ({
  ...body,
  freeShipping: parseBooleanField(body?.freeShipping),
  outOfStock: parseBooleanField(body?.outOfStock),
  customProperties: normalizeCustomProperties(body?.customProperties),
  subCollectionId: body?.subCollectionId !== undefined
    ? normalizeSubCollectionId(body.subCollectionId)
    : undefined,
});

const validateProductPayload = (body, { requireAll = true } = {}) => {
  const errors = [];
  const name = String(body?.name || '').trim();
  const description = String(body?.description || '').trim();
  const collectionId = body?.collectionId;
  if (requireAll && !name) errors.push('Item name is required.');
  if (requireAll && !description) errors.push('Description is required.');
  if (requireAll && !collectionId) errors.push('Collection is required.');
  if (body?.price !== undefined && Number(body.price) < 0) errors.push('Price must be zero or greater.');
  if (body?.shippingCost !== undefined && Number(body.shippingCost) < 0) errors.push('Shipping cost must be zero or greater.');

  return {
    errors,
    data: {
      name,
      description,
      collectionId,
      color: String(body?.color || '').trim(),
      size: String(body?.size || '').trim(),
      importantNotes: String(body?.importantNotes || '').trim(),
      customProperties: normalizeCustomProperties(body?.customProperties),
      photos: Array.isArray(body?.photos) ? body.photos.filter(Boolean) : [],
      price: body?.price !== undefined ? Number(body.price) : undefined,
      shippingCost: body?.shippingCost !== undefined ? Number(body.shippingCost) : undefined,
      freeShipping: Boolean(body?.freeShipping),
      outOfStock: Boolean(body?.outOfStock),
    },
  };
};

const productPopulatePaths = [
  { path: 'collectionId', select: 'name slug isSystem' },
  { path: 'subCollectionId', select: 'name slug sortOrder collectionId' },
];

export const listProductsGrouped = async (_req, res) => {
  const collections = await Collection.find().sort({ sortOrder: 1, name: 1 }).lean();
  const subcollections = await Subcollection.find().sort({ sortOrder: 1, name: 1 }).lean();
  const products = await Product.find()
    .populate('collectionId', 'name slug isSystem sortOrder')
    .populate('subCollectionId', 'name slug sortOrder')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const grouped = collections.map((collection) => ({
    ...collection,
    subcollections: subcollections.filter(
      (subcollection) => String(subcollection.collectionId) === String(collection._id),
    ),
    products: products
      .filter((product) => String(product.collectionId?._id || product.collectionId) === String(collection._id))
      .map((product) => ({
        ...product,
        collectionName: collection.name,
      })),
  }));
  res.json(grouped);
};

export const listProducts = async (req, res) => {
  const filter = {};
  if (req.query.collectionId) {
    filter.collectionId = req.query.collectionId;
  }
  if (req.query.subCollectionId) {
    filter.subCollectionId = req.query.subCollectionId;
  }

  const products = await Product.find(filter)
    .populate('collectionId', 'name slug isSystem')
    .populate('subCollectionId', 'name slug sortOrder')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  res.json(products);
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('collectionId', 'name slug isSystem')
    .populate('subCollectionId', 'name slug sortOrder collectionId')
    .lean();

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.json(product);
};

export const createProduct = async (req, res) => {
  const body = parseRequestBody(req.body);
  const uploadedPhotos = (req.files || []).map((file) => `/uploads/${file.filename}`);

  if (!uploadedPhotos.length) {
    return res.status(400).json({ error: 'At least one photo is required.' });
  }

  const { errors, data } = validateProductPayload({
    ...body,
    photos: uploadedPhotos,
  });

  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const collection = await Collection.findById(data.collectionId);
  if (!collection) {
    return res.status(400).json({ error: 'Collection not found.' });
  }

  const subcollectionResult = await resolveSubCollectionId(
    collection._id,
    body.subCollectionId,
    { requireWhenAvailable: true },
  );
  if (subcollectionResult.error) {
    return res.status(400).json({ error: subcollectionResult.error });
  }

  const maxSort = await Product.findOne({ collectionId: collection._id }).sort({ sortOrder: -1 }).select('sortOrder');
  const product = await Product.create({
    name: data.name,
    description: data.description,
    collectionId: collection._id,
    subCollectionId: subcollectionResult.id,
    color: data.color,
    size: data.size,
    importantNotes: data.importantNotes,
    customProperties: data.customProperties,
    photos: data.photos,
    price: data.price,
    shippingCost: data.shippingCost ?? 0,
    freeShipping: data.freeShipping,
    outOfStock: data.outOfStock,
    sortOrder: (maxSort?.sortOrder ?? -1) + 1,
  });

  const populated = await product.populate(productPopulatePaths);
  res.status(201).json(populated);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const body = parseRequestBody(req.body);
  const { errors, data } = validateProductPayload(body, { requireAll: false });
  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  if (data.name) product.name = data.name;
  if (data.description) product.description = data.description;
  if (req.body?.color !== undefined) product.color = data.color;
  if (req.body?.size !== undefined) product.size = data.size;
  if (req.body?.importantNotes !== undefined) product.importantNotes = data.importantNotes;
  if (body.customProperties !== undefined && req.body?.customProperties !== undefined) {
    product.customProperties = data.customProperties;
  }
  if (req.body?.photos !== undefined) product.photos = data.photos;
  if (req.body?.price !== undefined) product.price = data.price;
  if (req.body?.shippingCost !== undefined) product.shippingCost = data.shippingCost;
  if (req.body?.freeShipping !== undefined) product.freeShipping = data.freeShipping;
  if (req.body?.outOfStock !== undefined) product.outOfStock = data.outOfStock;

  if (data.collectionId) {
    const collection = await Collection.findById(data.collectionId);
    if (!collection) {
      return res.status(400).json({ error: 'Collection not found.' });
    }
    product.collectionId = collection._id;
  }

  if (body.subCollectionId !== undefined && req.body?.subCollectionId !== undefined) {
    const subcollectionResult = await resolveSubCollectionId(
      product.collectionId,
      body.subCollectionId,
      { requireWhenAvailable: true },
    );
    if (subcollectionResult.error) {
      return res.status(400).json({ error: subcollectionResult.error });
    }
    product.subCollectionId = subcollectionResult.id;
  } else if (data.collectionId && req.body?.collectionId !== undefined) {
    const subcollectionResult = await resolveSubCollectionId(
      product.collectionId,
      null,
      { requireWhenAvailable: true },
    );
    if (subcollectionResult.error) {
      return res.status(400).json({ error: subcollectionResult.error });
    }
    product.subCollectionId = null;
  }

  await product.save();
  const populated = await product.populate(productPopulatePaths);
  res.json(populated);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.json({ success: true });
};

export const reorderProducts = async (req, res) => {
  const collectionId = req.body?.collectionId;
  const orderedIds = Array.isArray(req.body?.orderedIds) ? req.body.orderedIds : [];

  if (!collectionId || !orderedIds.length) {
    return res.status(400).json({ error: 'collectionId and orderedIds are required.' });
  }

  const updates = orderedIds.map((id, index) => Product.updateOne(
    { _id: id, collectionId },
    { $set: { sortOrder: index } },
  ));

  await Promise.all(updates);

  const products = await Product.find({ collectionId })
    .populate('collectionId', 'name slug isSystem')
    .populate('subCollectionId', 'name slug sortOrder')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  res.json(products);
};
