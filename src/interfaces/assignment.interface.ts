export interface QuestionTypeConfig {
  title: string;
  description: string;
  outputs: string[];
}

export interface AssignmentInput {
  title: string;
  course: string;
  description: string;
  questionType: QuestionTypeConfig;
  numberOfQuestions?: number;
  publishToLMS?: string[];
  difficulty: string;
  grade: string;
  subject: string;
  type: string;

}

export type QuestionType = 'essay' | 'multiple_choice' | 'short_answer_test' | 'presentation';

export interface Question {
  questionText: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  _id?: string;
}

export interface Assignment {
  title: string;
  description: string;
  questions: Question[];
  grade: number;

  subject: string;
  difficultyLevel: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}