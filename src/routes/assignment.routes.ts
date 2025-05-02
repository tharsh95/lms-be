import { Router } from 'express';
import { addQuestions, deleteData, generateAssignment, generateOptions, getAssignmentById, getAssignmentByIdWithAnswerKey, getAssignments } from '../controllers/assignment.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Protected route - requires authentication
router.get('/options', verifyToken, generateOptions);
router.post('/add/:id', verifyToken, addQuestions);
router.post('/generate', verifyToken, generateAssignment);
router.get('/', verifyToken, getAssignments);
router.get('/:id', verifyToken, getAssignmentById);
router.get('/answers/:id', verifyToken, getAssignmentByIdWithAnswerKey);
router.put('/:id/:assignmentId', verifyToken,deleteData);

export default router;