import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IClass } from './class.model';

export interface ICourse extends Document {
  courseName: string;
  subject: string;
  grade: string;
  description: string;
  createdBy: IUser['_id'];
  syllabusPdfUrl?: string;
  parsedSyllabus?: any;
  aiMetadata?: {
    prompt: string;
    referenceBooks: string[];
    generatedSyllabus: object;
  };
  courseDetails: {
    moduleTitle: string;
    learningObjectives: string[];
    lessons: any[];
    activities: any[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    createdBy: {
      type: String,
      // ref: 'User',
      // required: [true, 'Creator is required'],
    },
    syllabusPdfUrl: {
        type: String,
        trim: true,
      },
      parsedSyllabus: {
        type: Schema.Types.Mixed,
        default: {},
      },
    aiMetadata: {
      prompt: String,
      referenceBooks: [String],
      generatedSyllabus: Object,
      },
    courseDetails: [{
      moduleTitle: String,
      learningObjectives: [String],
      lessons: [Schema.Types.Mixed],
      activities: [Schema.Types.Mixed],
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
courseSchema.index({ subject: 1 });
courseSchema.index({ grade: 1 });
courseSchema.index({ createdBy: 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course; 