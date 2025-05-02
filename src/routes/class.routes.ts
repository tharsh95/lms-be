import express, { Router } from 'express';
import { addClass, dropUniqueIndex, getAllClasses } from '../controllers/class.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Drop unique index
router.post('/drop-index', verifyToken, dropUniqueIndex);

// Add new class
router.post('/', verifyToken, addClass);

// Get all classes name and id for select dropdown
router.get('/get-all-classes', verifyToken, getAllClasses);

// // Get class by ID
// router.get('/:id', verifyToken, getClassById);


export default router; 