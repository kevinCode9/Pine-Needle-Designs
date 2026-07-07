import mongoose from 'mongoose';

const customPropertySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  required: { type: Boolean, default: false },
  options: [{ type: String, trim: true }],
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  subCollectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcollection',
    default: null,
  },
  color: { type: String, default: '', trim: true },
  size: { type: String, default: '', trim: true },
  importantNotes: { type: String, default: '', trim: true },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  customProperties: {
    type: [customPropertySchema],
    default: [],
  },
  photos: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  freeShipping: {
    type: Boolean,
    default: false,
  },
  outOfStock: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

productSchema.index({ collectionId: 1, sortOrder: 1 });
productSchema.index({ subCollectionId: 1 });

export const Product = mongoose.model('Product', productSchema);
