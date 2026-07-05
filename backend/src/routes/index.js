import { Router } from 'express';
import collectionsRouter from './collections.js';
import productsRouter from './products.js';
import cartRouter from './cart.js';
import checkoutRouter from './checkout.js';
import bookingRouter from './booking.js';
import healthRouter from './health.js';
import dashboardRouter from './dashboard.js';
import ordersRouter from './orders.js';

const router = Router();

router.use('/collections', collectionsRouter);
router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/checkout', checkoutRouter);
router.use('/booking-deposit', bookingRouter);
router.use('/health', healthRouter);
router.use('/dashboard', dashboardRouter);
router.use('/orders', ordersRouter);

export default router;
