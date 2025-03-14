import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';

import {
  getUserProfileController,
  updateUserController,
} from '../controllers/user';

const router = Router();

router.get('/profile', authenticateJWT, getUserProfileController);
router.patch('/profile', authenticateJWT, updateUserController);

export default router;
