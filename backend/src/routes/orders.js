import { Router } from 'express';
import { listOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';

const router = Router();

router.get('/', listOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;
