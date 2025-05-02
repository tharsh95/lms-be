import express, { Router } from 'express';
import { register, login, getMe, addStudent, getAllStudents, addTeacher, getAllTeachers } from '../controllers/auth.controller';
// In your route files
import { verifyToken } from '../middleware/auth.middleware';

// Protected route example
const router: Router = express.Router();

// Register user
router.get('/protected', verifyToken, getMe)
router.post('/register', register);

// Login user
router.post('/login', login);

// Add student to class
router.post('/add-student', verifyToken, addStudent);

// Get all students
router.get('/students', verifyToken, getAllStudents);

// Add teacher to class
router.post('/add-teacher', verifyToken, addTeacher);

// Get all teachers
router.get('/teachers', verifyToken, getAllTeachers);

export default router;

