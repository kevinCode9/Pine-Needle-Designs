import { Router } from 'express';
import {
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections,
} from '../controllers/collectionController.js';
import {
  listSubcollections,
  createSubcollection,
  updateSubcollection,
  deleteSubcollection,
  reorderSubcollections,
} from '../controllers/subcollectionController.js';

const router = Router();

router.get('/', listCollections);
router.post('/', createCollection);
router.put('/reorder', reorderCollections);
router.get('/:collectionId/subcollections', listSubcollections);
router.post('/:collectionId/subcollections', createSubcollection);
router.put('/:collectionId/subcollections/reorder', reorderSubcollections);
router.put('/:collectionId/subcollections/:subcollectionId', updateSubcollection);
router.delete('/:collectionId/subcollections/:subcollectionId', deleteSubcollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

export default router;
