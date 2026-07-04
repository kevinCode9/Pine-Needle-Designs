import { Router } from 'express';
import { listOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = Router();

router.get('/', listOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
