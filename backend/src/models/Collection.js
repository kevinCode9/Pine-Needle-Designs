import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

collectionSchema.index({ sortOrder: 1 });

export const Collection = mongoose.model('Collection', collectionSchema);
