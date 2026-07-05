import { Router } from 'express';
import { createCheckout, captureOrder } from '../controllers/checkoutController.js';

const router = Router();

router.post('/', createCheckout);
router.get('/capture-order/:token', captureOrder);

export default router;
