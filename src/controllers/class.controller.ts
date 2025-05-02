import { Request, Response, NextFunction } from 'express';
import { Class } from '../models/class.model';
import { BadRequestError } from '../middleware/error.middleware';

// Drop unique index
export const dropUniqueIndex = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await Class.collection.dropIndex('grade_1_section_1_academicYear_1');
        res.status(200).json({
            success: true,
            message: 'Unique index dropped successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Add new class
export const addClass = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, description, grade, section, academicYear,subject } = req.body;

        // Check if class already exists
        const existingClass = await Class.findOne({ name, grade, section, academicYear });
        if (existingClass) {
            throw new BadRequestError('Class already exists');
        }

        // Create new class
        const newClass = await Class.create({
            name,
            description,
            grade,
            section,
            academicYear,
            subject
        });

        // Send response
        res.status(201).json({
            success: true,
            data: {
                class: {
                    id: newClass._id,
                    name: newClass.name,
                    description: newClass.description,
                    grade: newClass.grade,
                    section: newClass.section,
                    academicYear: newClass.academicYear,
                },
            },
        });
    } catch (error) {
        next(error);
    }
}; 

// Get all classes name and id for select dropdown
export const getAllClasses = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const classes = await Class.find({});
        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        next(error);
    }
};