import { Request, Response, NextFunction } from 'express';

import { AssignmentInput } from '../interfaces/assignment.interface';
import { BadRequestError } from '../middleware/error.middleware';

import { AssignmentModel } from '../models/assignment.model';
import { Course } from '../models/course.model';
import { generateResponse } from '../utils/deepseek';
import { testAssignmentPrompt } from '../utils/prompt';
import mongoose from 'mongoose';
import { Class } from '../models/class.model';
import { convertToObjects } from '../utils/convertToObject';
import { snakeCase } from 'lodash';
// Extend Express Request type to include user
interface RequestWithUser extends Request {
  user?: {
    email: string;
    _id: string;
    name: string;
    role: string;
  };
}





// Validate input
const validateInput = (input: AssignmentInput): void => {
  if (!input.title || input.title.trim().length === 0) {
    throw new BadRequestError('Title is required');
  }
  if (!input.grade || input.grade.trim().length === 0) {
    throw new BadRequestError('Grade is required');
  }
  if (!input.course || !mongoose.Types.ObjectId.isValid(input.course)) {
    throw new BadRequestError('Valid course ID is required');
  }
  if (!input.questionType || !input.questionType.title) {
    throw new BadRequestError('Question type configuration is required');
  }
  if (input.questionType.title === 'Short Answer Test' || input.questionType.title === 'Multiple Choice Test') {
    if (!input.numberOfQuestions || input.numberOfQuestions < 1) {
      throw new BadRequestError('Number of questions is required for this test type');
    }
  }
};




// Get all assignments
export const getAssignments = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role === 'student') {
      // Find all classes where the student is enrolled
      const classes = await Class.find({ students: req.user._id });

      // Get all course IDs from these classes
      const courseIds = classes.reduce((ids: string[], cls) => {
        return [...ids, ...(cls.courses as mongoose.Types.ObjectId[]).map(course => course.toString())];
      }, []);

      // Get assignments for these courses with course details
      const assignments = await AssignmentModel.find({
        course: { $in: courseIds },
        isActive: true
      })
      .populate({
        path: 'course',
        select: 'courseName subject grade'
      })
      .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: assignments,
      });
    } else {
      // For non-students (teachers/admin), return all assignments with course details
      const assignments = await AssignmentModel.find({ isActive: true })
        .populate({
          path: 'course',
          select: 'courseName subject grade'
        })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: assignments,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get assignment by ID
export const getAssignmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);

    if (!assignment) {
      throw new BadRequestError('Assignment not found');
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentByIdWithAnswerKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id, { answerKey: 1 });

    if (!assignment) {
      throw new BadRequestError('Assignment not found');
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const generateOptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find()
      .select('subject grade courseName')
      .sort({ courseName: 1 });

    const options = courses.map(course => ({
      subject: course.subject,
      grade: course.grade,
      course: {
        id: course._id,
        name: course.courseName
      }
    }));

    res.status(200).json({
      success: true,
      data: options
    });

  } catch (error) {
    next(error);

  }
}
export const addQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const assignment = await AssignmentModel.findById(req.params.id) as any
  if (!assignment) {
    throw new BadRequestError("Assignment not found")
  }
  if (assignment?.type === "multiple_choice_quiz") {
    const payload = {
      questionId: assignment.questions.length + 1,
      question: req?.body?.question,
      type: req?.body?.type.replace(/_quiz$/, ""),
      points: req?.body?.points,
      options: req?.body?.options,
    }
    assignment.questions.push(payload)
    const { answer } = req?.body
    const [key, value] = answer.split('.').map((part: string) => part.trim());

    const answerKey = {
      questionId: assignment.answerKey.length + 1,
      key,
      value
    }
    assignment.answerKey.push(answerKey)
    await assignment.save()
  }
  else if (assignment?.type === "short_answer_test") {
    const payload = {
      questionId: assignment.questions.length + 1,
      question: req?.body?.question,
      type: req?.body?.type,
      points: req?.body?.points,
    }

    assignment.questions.push(payload)
    const answerKey = {
      questionId: assignment.answerKey.length + 1,
      key: req?.body?.answer,
      value: req?.body?.answer
    }
    assignment.answerKey.push(answerKey)
    await assignment.save()
  }
  else{
    const payload = {
      question: req?.body?.question,
      points: req?.body?.points,
      options: [],
    }
      assignment.questions.push(payload)
      await assignment.save()
  }
  res.status(200).json({
    success: true,
    data: assignment,
  })

}
export const deleteData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id, assignmentId, type } = req.params

  const assignment = await AssignmentModel.findById(assignmentId)
  if (!assignment) {
    throw new BadRequestError("Assignment not found")
  }

  if(type === 'questions'){
    // Find the index of the question
    const questionIndex = (assignment as any).questions.filter(
      (question: any) => question._id.toString() === id
    )

    if (questionIndex === 0) {
      throw new BadRequestError("Question not found");
    }

    // Filter out the question and its answer
    (assignment as any).questions = (assignment as any).questions.filter(
      (question: any) => question._id.toString() !== id
    );
    
    if ((assignment as any).answerKey) {
      (assignment as any).answerKey = (assignment as any).answerKey.filter(
        (answer: any) => answer.questionId !== questionIndex[0].questionId
      );
    }

    await assignment.save();
    res.status(200).json({
      success: true,
      data: assignment,
      message: "Question deleted successfully"
    });
  }
};
export const editAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params
  const assignment = await AssignmentModel.findById(id, { answerKey: 1, type: 1, grade: 1, course: 1, createdBy: 1, isActive: 1, difficultyLevel: 1, submissions: 1, instructions: 1, participationCriteria: 1, checklist: 1, rubric: 1, peerEvaluation: 1, title: 1, description: 1, subject: 1, questions: 1 })
  if (!assignment) {
    throw new BadRequestError("Assignment not found")
  }
  res.status(200).json({
    success: true,
    data: assignment,
  })
}

export const addInstructions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const assignment = await AssignmentModel.findById(id);
    if (!assignment) {
      throw new BadRequestError("Assignment not found");
    }

    const assignmentDoc = assignment as any;
    if (!assignmentDoc.instructions) {
      assignmentDoc.instructions = { };
    }

    assignmentDoc.instructions.push({ title, content });
    await assignmentDoc.save();

    res.status(200).json({
      success: true,
      data: assignmentDoc,
      message: "Instructions added successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const generateAssignment = async (req: Request, res: Response) => {
  const input: AssignmentInput = req.body;

  // 1. Validate user input
  validateInput(input);

  // 2. Prepare the prompt
  const prompt = JSON.stringify(input) + testAssignmentPrompt;

  // 3. Call the AI model
  const data = await generateResponse(prompt);


  if (!data) {
    throw new BadRequestError('No response from AI');
  }

  // 4. Remove triple backticks and language hints (```json, ```javascript, etc.)
  let jsonString = data.trim();
  const lines = jsonString.split('\n');

  if (lines[0].startsWith('```')) lines.shift();
  if (lines[lines.length - 1].startsWith('```')) lines.pop();
  jsonString = lines.join('\n');
  // 5. Final sanitation of invisible control characters
  const cleanedString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(
    /^```(?:json|javascript)z?\s*|\s*```$/g, '');;

  // Optional: Lint the JSON first (useful for development/debugging)
  // try {
  //   jsonlint.parse(cleanedString);
  // } catch (lintError) {
  //   console.error('JSON lint failed:', lintError.message);
  //   throw new BadRequestError('AI response is not valid JSON (lint check failed)');
  // }

  // 6. Parse the JSON safely
  let assignmentData;
  try {
    if (!cleanedString.startsWith('{') || !cleanedString.endsWith('}')) {
      throw new Error('Response does not appear to be a valid JSON object');
    }
    assignmentData = JSON.parse(cleanedString);
  } catch (error: any) {
    console.error('Error parsing AI response:', error.message);
    console.error('First 200 chars of response:', data.slice(0, 200));
    console.error('Cleaned string:', cleanedString);
    throw new BadRequestError(`Invalid response format from AI: ${error.message}`);
  }
  assignmentData.questions.forEach((question: any, index: number) => {
    question.questionId = index + 1;
  });
  assignmentData.answer_key.forEach((answer: any, index: number) => {
    answer.questionId = index + 1;
  });
  const finalAssignmentData = {
    createdBy: req.user?.email,
    isActive: true,
    course: input.course,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    difficultyLevel: input.difficulty,
    grade: input.grade,
    subject: input.subject,
    type: snakeCase(input.questionType.title),
    description: input.description,
    title: input.title,
    questions: assignmentData.questions,
    answerKey: assignmentData.answer_key,
    instructions: assignmentData.instructions,
    rubric: assignmentData.rubric,
    checklist: assignmentData.checklist,
    participationCriteria: assignmentData.participation_criteria,
  };

  // 7. Return the final parsed assignment
      const assignment = await AssignmentModel.create(finalAssignmentData);

  res.status(200).json({ success: true, data: assignment });
};


export const addRubrics = async (req: Request, res: Response) => {
  const { id } = req.params;

  const {Criterion,Points,Description} = req.body
  const payload = {
    Criterion,
    Points,
    Description
  }
  const assignment = await AssignmentModel.findById(id);
  (assignment as any)?.rubric.push(payload)
  await assignment?.save()
  res.status(200).json({
    success: true,
    data: assignment,
    message: "Rubric added successfully"
  });
};

export const updateAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const assignment = await AssignmentModel.findById(id);
  if (!assignment) {
    throw new BadRequestError("Assignment not found");
  }
  assignment.title = title;
  assignment.description = description;
  await assignment.save();
  res.status(200).json({
    success: true,
    data: assignment,
    message: "Assignment updated successfully"
  });
};

export const addChecklist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { item, required } = req.body;

  const assignment = await AssignmentModel.findById(id);
  if (!assignment) {
    throw new BadRequestError("Assignment not found");
  }
  (assignment as any).checklist.push({ item, required });
  await assignment.save();
  res.status(200).json({
    success: true,
    data: assignment,
    message: "Checklist added successfully"
  });
};

export const addParticipationCriteria = async (req: Request, res: Response) => {

  const { id } = req.params;
  const {  Criterion, Points,Description } = req.body;
  const assignment = await AssignmentModel.findById(id);
  if (!assignment) {
    throw new BadRequestError("Assignment not found");
  }
  (assignment as any).participationCriteria.push({  Criterion, Points,Description });
  await assignment.save();
  res.status(200).json({
    success: true,
    data: assignment,
    message: "Participation criteria added successfully"
  });
};

