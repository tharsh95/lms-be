export interface QuestionTypeConfig {
  title: string;
  description: string;
  outputs: string[];
}

export interface AssignmentInput {
  title: string;
  topic: string;
  description: string;
  questionType: QuestionTypeConfig;
  numberOfQuestions?: number;
  publishToLMS?: string[];
  difficultyLevel: string;
  grade: string;
  subject: string;
}

export type QuestionType = 'essay' | 'multiple_choice' | 'short_answer_test' | 'presentation';

export interface Question {
  questionText: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface Assignment {
  title: string;
  description: string;
  questions: Question[];
  grade: number;
  topic: string;
  subject: string;
  difficultyLevel: string;

  createdAt: Date;
  updatedAt: Date;
}