import { Request, Response, NextFunction } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { AssignmentInput, Assignment, QuestionType } from '../interfaces/assignment.interface';
import { BadRequestError } from '../middleware/error.middleware';
import { HumanMessage } from '@langchain/core/messages';
import { AssignmentModel } from '../models/assignment.model';
import { Course } from '../models/course.model';

// Extend Express Request type to include user
interface RequestWithUser extends Request {
  user?: {
    email: string;
  };
}

// Initialize OpenAI
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
  modelName: 'gpt-3.5-turbo',
});

// Define the output parser schema
// const assignmentSchema = z.object({
//   title: z.string(),

//   questions: z.array(
//     z.object({
//       questionText: z.string(),
//       type: z.enum(['essay', 'multiple_choice', 'short_answer', 'presentation']),
//       points: z.number(),
//       options: z.array(z.string()).optional(),
//       correctAnswer: z.string().optional(),
//       explanation: z.string().optional(),
//     })
//   ),
//   grade: z.number(),
//   topic: z.string(),
//   subject: z.string(),
//   difficultyLevel: z.string(),

// });

const assignmentSchema = z.object({
  title: z.string(),
  description: z.string(),
  grade: z.number(),
  topic: z.string(),
  subject: z.string(),
  difficultyLevel: z.string(),

  // Optional depending on assignment type
  questions: z
    .array(
      z.object({
        questionText: z.string(),
        type: z.enum(['multiple_choice', 'essay', 'short_answer_test', 'presentation']),
        points: z.number(),
        options: z.array(z.string()).optional(), // for multiple_choice
        explanation: z.string().optional(),
      })
    )
    .optional(),

  answer_key: z
    .record(
      z.object({
        key: z.string(),
        value: z.string().optional() // Optional for short answer questions
      })
    )
    .optional(),

  instructions: z.string().optional(),

  rubric: z
    .array(
      z.object({
        criterion: z.string(),
        points: z.number(),
        description: z.string().optional(),
      })
    )
    .optional(),

  peer_evaluation: z
    .array(
      z.object({
        criterion: z.string(),
        scale: z.string().optional(), // e.g., "1-5", "Poor to Excellent"
        description: z.string().optional(),
      })
    )
    .optional(),

  checklist: z
    .array(
      z.object({
        item: z.string(),
        required: z.boolean().default(true),
      })
    )
    .optional(),

  participation_criteria: z
    .array(
      z.object({
        description: z.string(),
        points: z.number().optional(),
      })
    )
    .optional(),
});

const promptTemplate = new PromptTemplate({
  template: `Create a {testType} titled "{title}" for grade {grade} students on the topic of {topic}.
  {description}
  
  Contextual information:
  - Subject: {subject}
  - Difficulty level: {difficultyLevel}
  - Question format: {formatDescription}
  - Number of questions: {numberOfQuestions}
  
  Please generate the following based on the assignment type:
  {outputs} for the test or quiz whatever it maybe
  
  Instructions for formatting output:
  - Structure the response as an assignment object containing the following keys based on type:

  - If "questions" is requested:
    - Include an array of question objects with question text and options
    - Do NOT include explanations in the questions object
    - There should be 4 options for multiple choice questions
    - Each option should be labeled with bullets: a, b, c, d

  - If "answer_key" is requested:
    - Include the correct answer for each question in an object
    - Use the question number as the key (1, 2, 3, etc.)
    - The value should be an object with:
      - key: the correct option (a, b, c, or d)
      - value: the corresponding correct answer text
      The answer key for sure be generate for the test or quiz whatever it maybe


  - If "instructions" is requested: Include clear and detailed instructions
  - If "rubric" is requested: Include evaluation criteria with point breakdown
  - If "peer_evaluation" is requested: Include criteria for evaluating group members
  - If "checklist" is requested: Include a list of required items
  - If "participation_criteria" is requested: Include guidelines for participation

  Format the output as a structured assignment object with:
  - The provided title
  - A brief description
  - The requested outputs (e.g., questions, answer key, rubric, etc.)
  - Points or evaluation criteria where appropriate
  
  {format_instructions}
  `,
  inputVariables: [
    'title',
    'grade',
    'topic',
    'description',
    'subject',
    'difficultyLevel',
    'testType',
    'formatDescription',
    'numberOfQuestions',
    'outputs',
  ],
  partialVariables: {
    format_instructions: StructuredOutputParser.fromZodSchema(assignmentSchema).getFormatInstructions(),
  },
});



// Validate input
const validateInput = (input: AssignmentInput): void => {
  if (!input.title || input.title.trim().length === 0) {
    throw new BadRequestError('Title is required');
  }
  if (!input.grade || input.grade.trim().length === 0) {
    throw new BadRequestError('Grade is required');
  }
  if (!input.topic || input.topic.trim().length === 0) {
    throw new BadRequestError('Topic is required');
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

// Generate assignment
export const generateAssignment = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input: AssignmentInput = req.body;
    console.log(input);
    // validateInput(input);

    // if (!req.user?.email) {
    //   throw new BadRequestError('User not authenticated');
    // }

    // Format prompt
    // const prompt = await promptTemplate.format({
    //   title: input.title,
    //   grade: input.grade,
    //   topic: input.topic,
    //   description: input.description,
    //   subject: input.subject,
    //   difficultyLevel: input.difficultyLevel,
    //   testType: input.questionType.title,
    //   formatDescription: input.questionType.description,
    //   numberOfQuestions: input.numberOfQuestions,
    //   outputs: input.questionType.outputs.join(', '),

    // });

    // // Generate assignment
    // const output = await model.call([
    //   new HumanMessage(prompt),
    // ]);

    // // // Parse and validate output
    // const parser = StructuredOutputParser.fromZodSchema(assignmentSchema);
    // const content = Array.isArray(output.content)
    //   ? output.content.map(c => typeof c === 'string' ? c : c.type === 'text' ? c.text : '').join('')
    //   : output.content;

    // const parsedAssignment = await parser.parse(content);
    // console.log(parsedAssignment);
    // // Format the assignment based on type
    // const { instructions, answer_key, ...rest } = parsedAssignment;

    // // Convert answer_key to answerKey format
    // const formattedAnswerKey = Object.entries(answer_key || {}).map(([questionId, answer]) => ({
    //   questionId: questionId,
    //   key: answer.key || '', // Ensure key is always a string
    //   value: answer.value || '' // Ensure value is always a string
    // }));

    // Create new assignment document
    // const assignment = new AssignmentModel({
    //   ...rest,
    //   type: input.questionType.title.toLowerCase().replace(/\s+/g, '_'),
    //   createdBy: req.user?.email || 'anonymous',
    //   isActive: true,
    //   // Format instructions as an object with sections if it's a string
    //   instructions: typeof instructions === 'string' 
    //     ? { sections: [{ title: 'Instructions', content: instructions }] }
    //     : instructions,
    //   // Add formatted answer key
    //   answerKey: formattedAnswerKey
    // });

    // // Save to database
    // await assignment.save();
const assignment = await AssignmentModel.findById("680a28d5ce6c7dc61cfdccdd");
    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// Get all assignments
export const getAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignments = await AssignmentModel.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: assignments,
    });
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
    const assignment = await AssignmentModel.findById(req.params.id, { answerKey: 0 });

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
      name: course.courseName
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
    const {type} =  req.body
    const assignment =await AssignmentModel.findById(req.params.id)
    if(!assignment){
      throw new BadRequestError("Assignment not found")
    }
    console.log(assignment.type,type)
    if(assignment?.type.includes(type)){
      const payload = {
        questionText: req?.body?.questionText,
        type: req?.body?.type,
        points: req?.body?.points,
        options: req?.body?.options,
      }
      assignment.questions.push(payload)
      await assignment.save()
      res.status(200).json({
        success: true,
        data: assignment,
      })
    }
    
  }
export const deleteData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {id,assignmentId} = req.params
  const assignment = await AssignmentModel.findById(assignmentId)
  if(!assignment){
    throw new BadRequestError("Assignment not found")
  }
  assignment.questions = assignment.questions.filter(question => (question as any)._id.toString() !== id)
  if ((assignment as any).answerKey) {
    (assignment as any).answerKey = (assignment as any).answerKey.filter((answer: any) => answer.questionId !== id)
  }
  await assignment.save()
  res.status(200).json({
    success: true,
    data: assignment,
  })
}