import { Router } from 'express';
import { generateAssignment, getAssignmentById, getAssignmentByIdWithAnswerKey, getAssignments } from '../controllers/assignment.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Protected route - requires authentication
router.post('/generate', verifyToken, generateAssignment);
router.get('/', verifyToken, getAssignments);
router.get('/:id', verifyToken, getAssignmentById);
router.get('/answers/:id', verifyToken, getAssignmentByIdWithAnswerKey);

export default router;