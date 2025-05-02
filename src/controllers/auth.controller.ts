import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/user.model';
import { BadRequestError, UnauthorizedError } from '../middleware/error.middleware';
import { Class } from '../models/class.model';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Generate JWT token
const generateToken = (userId: string): string => {
  const payload = { id: userId };
  const options: SignOptions = {
    expiresIn: "1d",
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('User already exists with this email');
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
    });
    // Generate token
    const token = generateToken(user.email);

    // Send response
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Email not found');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.email);

    // Send response
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user;
  res.json({
    success: true,
    user: {
      email: user?.email,
    },
  })

}

// Add student to class
export const addStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, classId } = req.body;
    const role = "student"
    console.log(classId);

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      throw new BadRequestError('Class not found');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      // Check if student is already in the class
      if (classExists.students.includes(existingUser._id)) {
        throw new BadRequestError('Student is already in this class');
      }

      // Add student to class if not already present
      await Class.findByIdAndUpdate(
        classId,
        { $push: { students: existingUser._id } }
      );
      res.status(200).json({
        success: true,
        data: {
          message: 'Student added successfully',
        },
      });
      return;
    }

    const password = Math.random().toString(36).slice(-8);
    console.log(password);

    // Create new student user
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
    });

    // Add student to class
    await Class.findByIdAndUpdate(
      classId,
      { $push: { students: student._id } }
    );

    // Send response
    res.status(201).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
        },
        message: 'Student added successfully. A random password has been generated.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add teacher to class
export const addTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, classId } = req.body;
    const role = "teacher"

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      throw new BadRequestError('Class not found');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      // Check if teacher is already in the class
      if (classExists.teachers.includes(existingUser._id)) {
        throw new BadRequestError('Teacher is already in this class');
      }

      // Add teacher to class if not already present
      await Class.findByIdAndUpdate(
        classId,
        { $push: { teachers: existingUser._id } }
      );
      res.status(200).json({
        success: true,
        data: {
          message: 'Teacher added successfully',
        },
      });
      return;
    }

    const password = Math.random().toString(36).slice(-8);
    console.log(password);

    // Create new teacher user
    const teacher = await User.create({
      name,
      email,
      password,
      role: 'teacher',
    });

    // Add teacher to class
    await Class.findByIdAndUpdate(
      classId,
      { $push: { teachers: teacher._id } }
    );

    // Send response
    res.status(201).json({
      success: true,
      data: {
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          role: teacher.role,
        },
        message: 'Teacher added successfully. A random password has been generated.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all students
export const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' }, { password: 0, createdAt: 0, updatedAt: 0, role: 0 });

    // Get all classes
    const classes = await Class.find();

    // Create a map of student IDs to their classes
    const studentClassMap = new Map();
    classes.forEach(classDoc => {
      (classDoc.students as any[]).forEach((studentId) => {
        const studentIdStr = (studentId as { toString: () => string }).toString();
        if (!studentClassMap.has(studentIdStr)) {
          studentClassMap.set(studentIdStr, []);
        }
        studentClassMap.get(studentIdStr).push({
          classId: classDoc._id,
          name: classDoc.name,
          description: classDoc.description,
          grade: classDoc.grade,
          section: classDoc.section,
          academicYear: classDoc.academicYear
        });
      });
    });

    // Add class information to each student
    const studentsWithClasses = students.map(student => {
      const studentObj = student.toObject();
      const studentId = (student as { _id: { toString: () => string } })._id.toString();
      return {
        ...studentObj,
        classes: studentClassMap.get(studentId) || []
      };
    });

    res.status(200).json({
      success: true,
      data: studentsWithClasses,
    });
  } catch (error) {
    next(error);
  }
};

// Get all teachers
export const getAllTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get all teachers
    const teachers = await User.find({ role: 'teacher' }, { password: 0, createdAt: 0, updatedAt: 0 });

    // Get all classes
    const classes = await Class.find();

    // Create a map of student IDs to their classes
    const studentClassMap = new Map();
    classes.forEach(classDoc => {
      (classDoc.teachers as any[]).forEach((teacherId) => {
        const teacherIdStr = (teacherId as { toString: () => string }).toString();
        if (!studentClassMap.has(teacherIdStr)) {
          studentClassMap.set(teacherIdStr, []);
        }
        studentClassMap.get(teacherIdStr).push({
          classId: classDoc._id,
          name: classDoc.name,
          description: classDoc.description,
          grade: classDoc.grade,
          section: classDoc.section,
          academicYear: classDoc.academicYear
        });
      });
    });

    // Add class information to each student
    const studentsWithClasses = teachers.map(student => {
      const studentObj = student.toObject();
      const studentId = (student as { _id: { toString: () => string } })._id.toString();
      return {
        ...studentObj,
        classes: studentClassMap.get(studentId) || []
      };
    });

    res.status(200).json({
      success: true,
      data: studentsWithClasses,
    });
  } catch (error) {
    next(error);
  }
};