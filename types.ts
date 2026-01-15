
export enum Target {
  GEMINI = 'GEMINI',
  TEACHER = 'TEACHER'
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Question {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  image?: string;
  target: Target;
  timestamp: number;
  answer?: string;
  rating?: number;
  points: number;
  tags: string[];
  likes: string[]; 
  comments: Comment[];
  isPrivate: boolean; 
}

export interface User {
  id: string;
  name: string;
  password?: string; // New field for security
  points: number;
  level: number;
  avatar: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'answer' | 'comment' | 'like';
  message: string;
  timestamp: number;
  isRead: boolean;
  questionId: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  pointsAwarded: number;
}

export type AppView = 'feed' | 'ask' | 'quiz' | 'leaderboard' | 'profile' | 'notifications' | 'chats';
