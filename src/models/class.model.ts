import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { ICourse } from './course.model';

export interface IClass extends Document {
  name: string;
  description: string;
  teachers: IUser['_id'][];
  students: IUser['_id'][];
  courses: ICourse['_id'][];
  grade: string;
  section: string;
  academicYear: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    teachers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    grade: {
      type: String,
      required: [true, 'Grade is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
classSchema.index({ teacher: 1 });
classSchema.index({ subject: 1, grade: 1 });

export const Class = mongoose.model<IClass>('Class', classSchema);

export default Class; 