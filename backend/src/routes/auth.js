import { Router } from 'express';
import {
  emailSignIn,
  getCurrentUser,
  logout,
} from '../controllers/authController.js';

const router = Router();

router.post('/email', emailSignIn);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;
