import mongoose from 'mongoose';

const authorizedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
}, {
  timestamps: true,
});

export const AuthorizedUser = mongoose.model('AuthorizedUser', authorizedUserSchema);
