import { Router } from 'express';
import {
  loginHandler,
  registerHandler,
  refreshTokenHandler,
  logoutHandler,
} from '../controllers/auth';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Auth routes
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logoutHandler);

// Protected routes example
router.get('/profile', authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

export default router;
