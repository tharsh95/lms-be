import mongoose, { Schema, Document } from 'mongoose';
import { Assignment } from '../interfaces/assignment.interface';

// Create Question Schema
const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['multiple_choice', 'essay', 'short_answer_test', 'presentation', 'lab_report', 'case_study', 'portfolio']
  },
  points: { type: Number, required: true },
  options: [{ type: String }], // For multiple choice questions
});

// Create Answer Key Schema
const AnswerKeySchema = new Schema({
  questionId: { type: String, required: true },
  key: { type: String, required: true }, // For multiple choice: a, b, c, d. For others: the answer text
  value: { type: String }, // Optional additional context or explanation
});

// Create Rubric Schema
const RubricSchema = new Schema({
  criterion: { type: String, required: true },
  points: { type: Number, required: true },
  description: { type: String }
});

// Create Instructions Schema
const InstructionsSchema = new Schema({
  sections: [{ 
    title: { type: String, required: true },
    content: { type: String, required: true }
  }]
});

// Create Participation Criteria Schema
const ParticipationCriteriaSchema = new Schema({
  description: { type: String, required: true },
  points: { type: Number }
});

// Create Checklist Schema
const ChecklistSchema = new Schema({
  item: { type: String, required: true },
  required: { type: Boolean, default: true }
});

// Create Assignment Schema
const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'multiple_choice_quiz',
      'essay',
      'research_paper',
      'short_answer_test',
      'presentation',
      'discussion',
      'lab_report',
      'portfolio',
      'case_study'
    ]
  },
  grade: { type: String, required: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  difficultyLevel: { type: String, required: true },
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },

  // Optional fields based on assignment type
  questions: [QuestionSchema],
  answerKey: [AnswerKeySchema],
  rubric: [RubricSchema],
  instructions: InstructionsSchema,
  participationCriteria: [ParticipationCriteriaSchema],
  checklist: [ChecklistSchema]
}, {
  timestamps: true
});

// Create and export the model
export const AssignmentModel = mongoose.model<Assignment & Document>('Assignment', AssignmentSchema); 