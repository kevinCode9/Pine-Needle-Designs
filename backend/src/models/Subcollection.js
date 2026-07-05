import mongoose from 'mongoose';

const subcollectionSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

subcollectionSchema.index({ collectionId: 1, sortOrder: 1 });
subcollectionSchema.index({ collectionId: 1, slug: 1 }, { unique: true });
subcollectionSchema.index({ collectionId: 1, name: 1 }, { unique: true });

export const Subcollection = mongoose.model('Subcollection', subcollectionSchema);
