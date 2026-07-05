import { Router } from 'express';
import {
  getBookingDepositConfig,
  createBookingDeposit,
  captureBookingDeposit,
} from '../controllers/bookingController.js';

const router = Router();

router.get('/config', getBookingDepositConfig);
router.post('/', createBookingDeposit);
router.get('/capture/:token', captureBookingDeposit);

export default router;
