import mongoose, { Schema } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description: string;
  course?: mongoose.Types.ObjectId;
  module?: mongoose.Types.ObjectId;
  dueDate?: Date;
  totalMarks?: number;
  type: string;
  questions: {
    questionText: string;
    type: string;
    points: number;
    options?: string[];
  }[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: false,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: false,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    totalMarks: {
      type: Number,
      min: 0,
      required: false,
    },
    type: {
      type: String,
      required: true,
      enum: ['multiple_choice_quiz', 'essay', 'research_paper', 'short_answer_test', 'presentation', 'discussion', 'lab_report', 'portfolio', 'case_study']
    },
    questions: [{
      questionText: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        required: true,
        min: 0,
      },
      options: [String],
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
); 