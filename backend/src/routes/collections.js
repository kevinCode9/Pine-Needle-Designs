import { Router } from 'express';
import {
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections,
} from '../controllers/collectionController.js';

const router = Router();

router.get('/', listCollections);
router.post('/', createCollection);
router.put('/reorder', reorderCollections);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

export default router;
