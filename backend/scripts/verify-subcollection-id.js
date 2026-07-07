import mongoose from 'mongoose';
import { config } from '../src/config/index.js';
import { Collection } from '../src/models/Collection.js';
import { Product } from '../src/models/Product.js';
import { Subcollection } from '../src/models/Subcollection.js';

const API = 'http://localhost:3001/api';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  await mongoose.connect(config.mongoUri);

  const subcollections = await Subcollection.find().lean();
  const products = await Product.find()
    .populate('subCollectionId', 'name collectionId')
    .lean();

  const collectionsWithSubs = await Collection.find({
    _id: { $in: [...new Set(subcollections.map((item) => item.collectionId))] },
  }).lean();

  console.log('Database linkage');
  console.log(`- Subcollections in table: ${subcollections.length}`);
  console.log(`- Collections with subcollections: ${collectionsWithSubs.length}`);
  console.log(`- Products total: ${products.length}`);

  const productsWithSub = products.filter((product) => product.subCollectionId);
  console.log(`- Products with subCollectionId: ${productsWithSub.length}`);

  for (const product of productsWithSub.slice(0, 3)) {
    const subId = String(product.subCollectionId?._id || product.subCollectionId);
    const exists = subcollections.some((item) => String(item._id) === subId);
    assert(exists, `Product ${product.name} references missing subcollection ${subId}`);
    assert(
      String(product.subCollectionId.collectionId) === String(product.collectionId),
      `Product ${product.name} subCollectionId does not belong to its collection`,
    );
  }

  const groupedResponse = await fetch(`${API}/products/grouped`);
  assert(groupedResponse.ok, `GET /products/grouped failed: ${groupedResponse.status}`);
  const grouped = await groupedResponse.json();

  const groupedProductWithSub = grouped
    .flatMap((collection) => collection.products)
    .find((product) => product.subCollectionId);

  assert(groupedProductWithSub, 'Grouped API returned no product with subCollectionId');
  assert(
    groupedProductWithSub.subCollectionId?.name,
    'Grouped API subCollectionId is not populated',
  );

  const productId = groupedProductWithSub._id;
  const getResponse = await fetch(`${API}/products/${productId}`);
  assert(getResponse.ok, `GET /products/:id failed: ${getResponse.status}`);
  const single = await getResponse.json();
  assert(single.subCollectionId?.name, 'GET /products/:id subCollectionId is not populated');

  const subCollectionId = String(
    groupedProductWithSub.subCollectionId?._id || groupedProductWithSub.subCollectionId,
  );
  const listResponse = await fetch(`${API}/products?subCollectionId=${subCollectionId}`);
  assert(listResponse.ok, `GET /products?subCollectionId failed: ${listResponse.status}`);
  const listed = await listResponse.json();
  assert(
    listed.some((product) => String(product._id) === String(productId)),
    'List filter by subCollectionId did not return expected product',
  );

  const updateResponse = await fetch(`${API}/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subCollectionId,
    }),
  });
  assert(updateResponse.ok, `PUT /products/:id failed: ${updateResponse.status}`);
  const updated = await updateResponse.json();
  assert(
    String(updated.subCollectionId?._id || updated.subCollectionId) === subCollectionId,
    'PUT /products/:id did not persist subCollectionId',
  );

  console.log('API verification passed');
  console.log(`- Sample product: ${single.name}`);
  console.log(`- Sample subcollection: ${single.subCollectionId.name}`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exitCode = 1;
});
