import { Router } from 'express';
import upload from '../middleware/upload.js';

import {
  listProducts,
  listProductsGrouped,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
} from '../controllers/productController.js';

const router = Router();

const handlePhotoUpload = (req, res, next) => {
  upload.array('photos', 20)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Photo upload failed.' });
    }
    return next();
  });
};

router.get('/grouped', listProductsGrouped);
router.put('/reorder', reorderProducts);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', handlePhotoUpload, createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;