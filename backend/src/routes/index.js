import { Router } from 'express';
import collectionsRouter from './collections.js';
import productsRouter from './products.js';
import cartRouter from './cart.js';
import checkoutRouter from './checkout.js';
import bookingRouter from './booking.js';
import healthRouter from './health.js';
import dashboardRouter from './dashboard.js';
import ordersRouter from './orders.js';
import authRouter from './auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/collections', requireAuth, collectionsRouter);
router.use('/products', requireAuth, productsRouter);
router.use('/cart', cartRouter);
router.use('/checkout', checkoutRouter);
router.use('/booking-deposit', bookingRouter);
router.use('/health', healthRouter);
router.use('/dashboard', requireAuth, dashboardRouter);
router.use('/orders', requireAuth, ordersRouter);

export default router;
