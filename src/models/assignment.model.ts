import mongoose, { Schema, Document } from 'mongoose';
import { Assignment } from '../interfaces/assignment.interface';
import { ICourse } from './course.model';
import { IUser } from './user.model';

// Create Question Schema
const QuestionSchema = new Schema({
  question: { type: String, required: true },
  type: { 

    type: String, 
    enum: ['multiple_choice', 'essay', 'short_answer_test', 'presentation', 'lab_report', 'case_study', 'portfolio']
  },
  points: { type: Number, required: true },
  options: [{ type: String }], // For multiple choice questions

  questionId: { type: String, required: true },

});

// Create Answer Key Schema
const AnswerKeySchema = new Schema({
  questionId: { type: String, required: true },
  key: { type: String }, // For multiple choice: a, b, c, d. For others: the answer text
  value: { type: String }, // Optional additional context or explanation
});

// Create Rubric Schema
const RubricSchema = new Schema({
  Criterion: { type: String, required: true },
  Points: { type: Number, required: true },
  Description: { type: String,required:true }
});

// Create Instructions Schema
const InstructionsSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }
});

// Create Participation Criteria Schema
const ParticipationCriteriaSchema = new Schema({
  Criterion: { type: String, required: true },
  Description: { type: String, required: true },
  Points: { type: Number }
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
      'discussion',
      'case_study'
    ]
  },
  grade: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  difficultyLevel: { type: String, required: true },
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  dueDate: { type: Date },
  totalMarks: { type: Number, min: [0, 'Total marks cannot be negative'] },
  status: { type: String, enum: ['draft', 'published', 'submitted', 'graded'], default: 'draft' },
  questions: [QuestionSchema],
  answerKey: { type: [AnswerKeySchema], default: [] },
  rubric: [RubricSchema],
  instructions: [InstructionsSchema],
  participationCriteria: [ParticipationCriteriaSchema],
  checklist: [ChecklistSchema]
}, {
  timestamps: true
});

// Index for efficient queries
AssignmentSchema.index({ course: 1 });
AssignmentSchema.index({ 'submissions.student': 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ status: 1 });

// Create and export the model
export const AssignmentModel = mongoose.model<Assignment & Document>('Assignment', AssignmentSchema);

export default AssignmentModel; 