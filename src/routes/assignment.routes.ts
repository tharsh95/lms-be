import { Router } from 'express';
import { addChecklist, addInstructions, addParticipationCriteria, addQuestions, addRubrics, deleteData, editAssignment, generateAssignment, generateOptions, getAssignmentById, getAssignmentByIdWithAnswerKey, getAssignments, updateAssignment } from '../controllers/assignment.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Protected route - requires authentication
router.get('/options', verifyToken, generateOptions);
router.post('/add/:id', verifyToken, addQuestions);
router.post('/generate', verifyToken, generateAssignment);
router.get('/', verifyToken, getAssignments);
router.get('/:id', verifyToken, getAssignmentById);
router.get('/answers/:id', verifyToken, getAssignmentByIdWithAnswerKey);
router.delete('/:assignmentId/:type/:id', verifyToken,deleteData);
router.get('/edit/:id',verifyToken,editAssignment)
router.post('/instructions/:id',verifyToken,addInstructions)
router.post('/rubrics/:id',verifyToken,addRubrics)
router.post('/checklist/:id',verifyToken,addChecklist)
router.put('/:id',verifyToken,updateAssignment)
router.post('/participation-criteria/:id',verifyToken,addParticipationCriteria)

export default router;  