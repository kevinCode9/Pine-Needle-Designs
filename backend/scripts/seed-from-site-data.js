import { connectDatabase } from '../src/config/database.js';
import { Collection } from '../src/models/Collection.js';
import { Product } from '../src/models/Product.js';
import { collectionPages } from '../../frontend/src/data/siteData.js';

const args = new Set(process.argv.slice(2));
const shouldClear = args.has('--clear');
const dryRun = args.has('--dry-run');

const collectionNameBySlug = Object.fromEntries(
  collectionPages.map((page) => [page.slug, page.title]),
);

const parseMeta = (meta) => {
  const items = Array.isArray(meta) ? meta : [meta].filter(Boolean);
  let size = '';
  let color = '';
  let freeShipping = false;
  const notes = [];

  items.forEach((item) => {
    const text = String(item).trim();
    const lower = text.toLowerCase();

    if (/^price:/i.test(text)) {
      return;
    }

    if (lower === 'free shipping') {
      freeShipping = true;
      return;
    }

    if (/^size:/i.test(text)) {
      const sizeValue = text.replace(/^size:\s*/i, '').trim();
      size = size ? `${size}; ${sizeValue}` : sizeValue;
      return;
    }

    if (/^color:/i.test(text)) {
      color = text.replace(/^color:\s*/i, '').trim();
      return;
    }

    notes.push(text);
  });

  return {
    size,
    color,
    freeShipping,
    importantNotes: notes.join('\n'),
  };
};

const isSoldProduct = (product) => {
  if (product.sold || product.soldOut) {
    return true;
  }

  if (typeof product.status === 'string' && /^sold(?:\s*out)?$/i.test(product.status.trim())) {
    return true;
  }

  const meta = Array.isArray(product.meta) ? product.meta : [product.meta].filter(Boolean);
  return meta.some((item) => /sold/i.test(String(item)));
};

const mapOptionsToCustomProperties = (options = []) => options.map((option) => ({
  name: option.name,
  required: true,
  options: Array.isArray(option.values) ? option.values : [],
}));

const mapStaticProduct = (product, collectionId, sortOrder) => {
  const meta = parseMeta(product.meta);
  const photos = [
    ...(product.images || []),
    ...(product.videoPosters || []),
  ].filter(Boolean);

  return {
    legacyId: product.id,
    name: product.title,
    collectionId,
    description: product.description || product.title,
    color: meta.color,
    size: meta.size,
    importantNotes: meta.importantNotes,
    customProperties: mapOptionsToCustomProperties(product.options),
    photos,
    price: Number(product.price),
    shippingCost: 0,
    freeShipping: meta.freeShipping,
    outOfStock: isSoldProduct(product),
    sortOrder,
    noBlingPrice: Number.isFinite(product.noBlingPrice) ? product.noBlingPrice : undefined,
    noBlingDescription: product.noBlingDescription || '',
    videos: product.videos || [],
    videoPosters: product.videoPosters || [],
    storefrontMeta: Array.isArray(product.meta) ? product.meta : [product.meta].filter(Boolean),
    maker: product.maker || '',
  };
};

const seed = async () => {
  await connectDatabase();

  if (shouldClear) {
    if (dryRun) {
      console.log('Would clear existing products and non-system collections.');
    } else {
      const deletedProducts = await Product.deleteMany({});
      const deletedCollections = await Collection.deleteMany({ isSystem: false });
      console.log(`Cleared ${deletedProducts.deletedCount} products and ${deletedCollections.deletedCount} collections.`);
    }
  }

  let collectionCount = 0;
  let productCount = 0;

  for (let pageIndex = 0; pageIndex < collectionPages.length; pageIndex += 1) {
    const page = collectionPages[pageIndex];
    const name = collectionNameBySlug[page.slug] || page.title;
    const collectionPayload = {
      name,
      slug: page.slug,
      sortOrder: pageIndex,
      isSystem: false,
    };

    let collection;
    if (dryRun) {
      collection = { _id: `dry-run-${page.slug}` };
      console.log(`Would upsert collection: ${name} (${page.slug})`);
    } else {
      collection = await Collection.findOneAndUpdate(
        { slug: page.slug, isSystem: false },
        collectionPayload,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    collectionCount += 1;

    const products = (page.products || []).filter((product) => !product.placeholder);
    for (let productIndex = 0; productIndex < products.length; productIndex += 1) {
      const product = products[productIndex];
      const payload = mapStaticProduct(product, collection._id, productIndex);

      if (dryRun) {
        console.log(`  Would upsert product #${product.id}: ${product.title}`);
      } else {
        await Product.findOneAndUpdate(
          { legacyId: product.id },
          payload,
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }

      productCount += 1;
    }
  }

  console.log(`Seed complete: ${collectionCount} collections, ${productCount} products${dryRun ? ' (dry run)' : ''}.`);
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
