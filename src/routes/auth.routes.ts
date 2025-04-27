import express, { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
// In your route files
import { verifyToken } from '../middleware/auth.middleware';

// Protected route example
const router: Router = express.Router();

// Register user
router.get('/protected', verifyToken, getMe)
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user
// router.get('/me', getMe);

export default router;

