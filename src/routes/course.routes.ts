import express, { Router } from 'express';
import {  createCourse, createSyllabusWithAI, createSyllabusWithPdf, getAllCourses, getCourseById, updateCourseById, getAssignmentsByCourseId } from '../controllers/course.controller';
import { verifyToken } from '../middleware/auth.middleware';
import multer from 'multer';

const router: Router = express.Router();

// Configure multer for file upload
const upload = multer(
        {
            storage: multer.diskStorage({}), limits: {
                fileSize: 1024 * 1024 * 5
            }
        }
    );

// Create syllabus with PDF syllabus
router.post('/create-with-pdf', upload.single('syllabus'), (req, res, next) => {
    createSyllabusWithPdf(req, res, next).catch(next);
});

// Create syllabus with AI-generated syllabus
router.post('/create-with-ai', verifyToken, (req, res, next) => {
    createSyllabusWithAI(req, res, next).catch(next);
});

// Create course with AI-generated syllabus
router.post('/', verifyToken, (req, res, next) => {
    createCourse(req, res, next).catch(next);
});

// Get all courses
router.get('/', verifyToken, (req, res, next) => {
    getAllCourses(req, res, next).catch(next);
});

// Get course by ID
router.get('/:id', verifyToken, (req, res, next) => {
    getCourseById(req, res, next).catch(next);
});
router.get('/:courseId/assignments', verifyToken, (req, res, next) => {
    getAssignmentsByCourseId(req, res, next).catch(next);
});

// Update course by ID
router.put('/:id', verifyToken, (req, res, next) => {
    updateCourseById(req, res, next).catch(next);
});

export default router; 