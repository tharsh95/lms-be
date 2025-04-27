import { Request, Response, NextFunction } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { AssignmentInput, Assignment, QuestionType } from '../interfaces/assignment.interface';
import { BadRequestError } from '../middleware/error.middleware';
import { HumanMessage } from '@langchain/core/messages';
import { AssignmentModel } from '../models/assignment.model';

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
//   description: z.string(),
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
    // console.log(input);
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
  //   let assignment = {}
  //   if(input.questionType.title === 'Short Answer Test'){
  //    assignment = {
  //     "_id": {
  //       "$oid": "680a2f66ce6c7dc61cfdcd40"
  //     },
  //     "title": "Subjective",
  //     "description": "Short answer test for grade 12 students on Compound Interest (MATH 101)",
  //     "type": "short_answer_test",
  //     "grade": "12",
  //     "topic": "Compound Interest",
  //     "subject": "Maths",
  //     "difficultyLevel": "Medium",
  //     "createdBy": "anonymous",
  //     "isActive": true,
  //     "questions": [
  //       {
  //         "questionText": "Explain the concept of compound interest and how it differs from simple interest.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd41"
  //         }
  //       },
  //       {
  //         "questionText": "Calculate the compound interest on an initial investment of $5000 at an interest rate of 5% per annum for 3 years.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd42"
  //         }
  //       },
  //       {
  //         "questionText": "Discuss the importance of compound interest in personal finance and investment.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd43"
  //         }
  //       },
  //       {
  //         "questionText": "What is the formula to calculate compound interest? Provide an example to illustrate.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd44"
  //         }
  //       },
  //       {
  //         "questionText": "Explain how the frequency of compounding affects the final amount of compound interest earned.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd45"
  //         }
  //       },
  //       {
  //         "questionText": "Calculate the total amount accrued if $2000 is invested at 8% interest compounded quarterly for 5 years.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd46"
  //         }
  //       },
  //       {
  //         "questionText": "Discuss the concept of the 'time value of money' in relation to compound interest.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd47"
  //         }
  //       },
  //       {
  //         "questionText": "Explain how compound interest can work for or against individuals in debt.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd48"
  //         }
  //       },
  //       {
  //         "questionText": "Calculate the compound interest on an initial principal of $3000 at an interest rate of 4% per quarter for 2 years.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd49"
  //         }
  //       },
  //       {
  //         "questionText": "Discuss the role of inflation in the context of compound interest and investment planning.",
  //         "type": "short_answer_test",
  //         "points": 5,
  //         "options": [],
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd4a"
  //         }
  //       }
  //     ],
  //     "answerKey": [
  //       {
  //         "questionId": "1",
  //         "key": "N/A",
  //         "value": "Answers will vary but should include a clear explanation of compound interest and its differences from simple interest.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd4b"
  //         }
  //       },
  //       {
  //         "questionId": "2",
  //         "key": "N/A",
  //         "value": "Answers will vary based on the correct calculation of compound interest for the given values.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd4c"
  //         }
  //       },
  //       {
  //         "questionId": "3",
  //         "key": "N/A",
  //         "value": "Answers should highlight the significance of compound interest in growing wealth over time.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd4d"
  //         }
  //       },
  //       {
  //         "questionId": "4",
  //         "key": "N/A",
  //         "value": "Answers should provide the formula for compound interest and demonstrate its application with an example.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd4e"
  //         }
  //       },
  //       {
  //         "questionId": "5",
  //         "key": "N/A",
  //         "value": "Answers should explain how compounding frequency impacts the final amount obtained through compound interest.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd4f"
  //         }
  //       },
  //       {
  //         "questionId": "6",
  //         "key": "N/A",
  //         "value": "Answers will vary based on the correct calculation of total amount accrued with the given values.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd50"
  //         }
  //       },
  //       {
  //         "questionId": "7",
  //         "key": "N/A",
  //         "value": "Answers should discuss how compound interest accounts for the time value of money in investment decisions.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd51"
  //         }
  //       },
  //       {
  //         "questionId": "8",
  //         "key": "N/A",
  //         "value": "Answers should explain how compound interest can either boost savings or increase debt burden based on the situation.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd52"
  //         }
  //       },
  //       {
  //         "questionId": "9",
  //         "key": "N/A",
  //         "value": "Answers will vary based on the correct calculation of compound interest for the given principal and interest rate.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd53"
  //         }
  //       },
  //       {
  //         "questionId": "10",
  //         "key": "N/A",
  //         "value": "Answers should address how inflation impacts the real value of money and the importance of considering it in investment planning.",
  //         "_id": {
  //           "$oid": "680a2f66ce6c7dc61cfdcd54"
  //         }
  //       }
  //     ],
  //     "rubric": [],
  //     "participationCriteria": [],
  //     "checklist": [],
  //     "createdAt": {
  //       "$date": "2025-04-24T12:32:38.715Z"
  //     },
  //     "updatedAt": {
  //       "$date": "2025-04-24T12:32:38.715Z"
  //     },
  //     "__v": 0
  //   }
  // }
  // else if(input.questionType.title === 'Multiple Choice Quiz'){
  //  assignment = {
  //     "_id": {
  //       "$oid": "680a40adce6c7dc61cfdce6a"
  //     },
  //     "title": "MCQ English 101 Quiz for Grade 12 Students",
  //     "description": "A multiple-choice quiz for grade 12 students to test their knowledge of tenses, verbs, and adverbs in English 101.",
  //     "type": "multiple_choice_quiz",
  //     "grade": "12",
  //     "topic": "English 101",
  //     "subject": "English Language",
  //     "difficultyLevel": "Hard",
  //     "createdBy": "anonymous",
  //     "isActive": true,
  //     "questions": [
  //       {
  //         "questionText": "Which sentence is in the past perfect tense?",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. She is eating her lunch.",
  //           "b. They had already left when we arrived.",
  //           "c. I will visit my grandmother next weekend.",
  //           "d. The students are studying for their exams."
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce6b"
  //         }
  //       },
  //       {
  //         "questionText": "Identify the adverb in the sentence: 'The cat quickly ran across the street.'",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. cat",
  //           "b. quickly",
  //           "c. ran",
  //           "d. street"
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce6c"
  //         }
  //       },
  //       {
  //         "questionText": "Choose the correct form of the verb: 'She _____ the book yesterday.'",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. read",
  //           "b. reads",
  //           "c. reading",
  //           "d. will read"
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce6d"
  //         }
  //       },
  //       {
  //         "questionText": "Which sentence contains an incorrect adverb placement?",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. He quietly opened the door.",
  //           "b. She quickly ran to catch the bus.",
  //           "c. They are almost finished with the project.",
  //           "d. The dog barked loudly."
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce6e"
  //         }
  //       },
  //       {
  //         "questionText": "Select the sentence with the correct verb tense.",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. I am going to the store tomorrow.",
  //           "b. He had went to the store yesterday.",
  //           "c. She will finished her homework soon.",
  //           "d. They have swimming in the pool."
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce6f"
  //         }
  //       },
  //       {
  //         "questionText": "Which adverb best completes the sentence: 'She sings _____.'",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. beautiful",
  //           "b. beautifully",
  //           "c. beauty",
  //           "d. beautify"
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce70"
  //         }
  //       },
  //       {
  //         "questionText": "Choose the correct verb form in the sentence: 'They _______ to the party last night.'",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. gone",
  //           "b. goes",
  //           "c. going",
  //           "d. went"
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce71"
  //         }
  //       },
  //       {
  //         "questionText": "Which sentence uses the correct verb tense?",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. The sun shines brightly every morning.",
  //           "b. She will goes to the concert tomorrow.",
  //           "c. They has arrived home from their trip.",
  //           "d. I am goes to the store later."
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce72"
  //         }
  //       },
  //       {
  //         "questionText": "Identify the adverb in the sentence: 'He carefully painted the picture.'",
  //         "type": "multiple_choice",
  //         "points": 1,
  //         "options": [
  //           "a. carefully",
  //           "b. painted",
  //           "c. picture",
  //           "d. he"
  //         ],
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce73"
  //         }
  //       }
  //     ],
  //     "answerKey": [
  //       {
  //         "questionId": "1",
  //         "key": "b",
  //         "value": "They had already left when we arrived.",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce74"
  //         }
  //       },
  //       {
  //         "questionId": "2",
  //         "key": "b",
  //         "value": "quickly",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce75"
  //         }
  //       },
  //       {
  //         "questionId": "3",
  //         "key": "a",
  //         "value": "read",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce76"
  //         }
  //       },
  //       {
  //         "questionId": "4",
  //         "key": "a",
  //         "value": "He quietly opened the door.",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce77"
  //         }
  //       },
  //       {
  //         "questionId": "5",
  //         "key": "a",
  //         "value": "I am going to the store tomorrow.",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce78"
  //         }
  //       },
  //       {
  //         "questionId": "6",
  //         "key": "b",
  //         "value": "beautifully",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce79"
  //         }
  //       },
  //       {
  //         "questionId": "7",
  //         "key": "d",
  //         "value": "went",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce7a"
  //         }
  //       },
  //       {
  //         "questionId": "8",
  //         "key": "a",
  //         "value": "The sun shines brightly every morning.",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce7b"
  //         }
  //       },
  //       {
  //         "questionId": "9",
  //         "key": "a",
  //         "value": "carefully",
  //         "_id": {
  //           "$oid": "680a40adce6c7dc61cfdce7c"
  //         }
  //       }
  //     ],
  //     "rubric": [],
  //     "participationCriteria": [],
  //     "checklist": [],
  //     "createdAt": {
  //       "$date": "2025-04-24T13:46:21.179Z"
  //     },
  //     "updatedAt": {
  //       "$date": "2025-04-24T13:46:21.179Z"
  //     },
  //     "__v": 0
  //   }
  // }
  // else if(input.questionType.title === 'Discussion'){
  //   assignment = {
  //     "_id": {
  //       "$oid": "680a2dc4ce6c7dc61cfdcd36"
  //     },
  //     "title": "Debate",
  //     "description": "A guided conversation on the topic of Tourism in India for grade 12 students with a focus on communication skills.",
  //     "type": "discussion",
  //     "grade": "12",
  //     "topic": "Tourism",
  //     "subject": "Tourism in India",
  //     "difficultyLevel": "Medium",
  //     "createdBy": "anonymous",
  //     "isActive": true,
  //     "questions": [],
  //     "answerKey": [],
  //     "rubric": [
  //       {
  //         "criterion": "Argument Quality",
  //         "points": 10,
  //         "description": "Clarity, logic, and relevance of arguments presented during the debate.",
  //         "_id": {
  //           "$oid": "680a2dc4ce6c7dc61cfdcd37"
  //         }
  //       },
  //       {
  //         "criterion": "Engagement",
  //         "points": 5,
  //         "description": "Active participation in the discussion, including responding to peers and asking insightful questions.",
  //         "_id": {
  //           "$oid": "680a2dc4ce6c7dc61cfdcd38"
  //         }
  //       },
  //       {
  //         "criterion": "Communication Skills",
  //         "points": 5,
  //         "description": "Ability to articulate thoughts clearly, listen actively, and effectively communicate ideas.",
  //         "_id": {
  //           "$oid": "680a2dc4ce6c7dc61cfdcd39"
  //         }
  //       }
  //     ],
  //     "instructions": {
  //       "sections": [
  //         {
  //           "title": "Instructions",
  //           "content": "Students will engage in a structured debate on the topic of Tourism in India. Each student will have the opportunity to present their arguments, counterarguments, and engage in a discussion with their peers. The debate will be moderated to ensure equal participation and adherence to the topic.",
  //           "_id": {
  //             "$oid": "680a2dc4ce6c7dc61cfdcd3b"
  //           }
  //         }
  //       ],
  //       "_id": {
  //         "$oid": "680a2dc4ce6c7dc61cfdcd3a"
  //       }
  //     },
  //     "checklist": [
  //       {
  //         "item": "Prepared Opening Statement",
  //         "required": true,
  //         "_id": {
  //           "$oid": "680a2dc4ce6c7dc61cfdcd3c"
  //         }
  //       },
  //       {
  //         "item": "Rebuttal Points",
  //         "required": true,
  //         "_id": {
  //           "$oid": "680a2dc4ce6c7dc61cfdcd3d"
  //         }
  //       },
  //       {
  //         "item": "Engagement with Peers",
  //         "required": true,
  //         "_id": {
  //           "$oid": "680a2dc4ce6c7dc61cfdcd3e"
  //         }
  //       }
  //     ],
  //     "participationCriteria": [],
  //     "createdAt": {
  //       "$date": "2025-04-24T12:25:40.808Z"
  //     },
  //     "updatedAt": {
  //       "$date": "2025-04-24T12:25:40.808Z"
  //     },
  //     "__v": 0
  //   }
  // }
const assignment = await AssignmentModel.findById("680a40adce6c7dc61cfdce6a");
    res.status(201).json({
      success: true,
      data: [],
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