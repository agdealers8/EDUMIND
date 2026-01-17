
export type EducationLevel = 'School' | 'College' | 'Competitive Exams';

export interface UserActivity {
  id: string;
  type: 'quiz' | 'test' | 'helper' | 'planner';
  title: string;
  timestamp: number;
  metadata?: any;
}

export interface ResourceLink {
  title: string;
  uri: string;
  description?: string;
}

export interface UserProfile {
  name: string;
  level: EducationLevel;
  language: string;
  syllabus: string;
  board?: string;
  grade?: string;
  subjects: string[];
  activities: UserActivity[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export interface TestQuestion {
  id: number;
  text: string;
  marks: number;
  type: 'MCQ' | 'Short' | 'Long';
  options?: string[]; // Specifically for MCQs
  answer: string;    // Correct answer or marking key
  explanation?: string;
}

export interface TestPaper {
  title: string;
  duration: string;
  totalMarks: number;
  sections: {
    sectionTitle: string;
    questions: TestQuestion[];
  }[];
  sources?: { title: string; uri: string }[];
}

export interface DailySchedule {
  day: string;
  sessions: {
    time: string;
    activity: string;
    subject: string;
    topic: string;
  }[];
}

export interface LearningContent {
  topic: string;
  explanation: string;
  visualDescription: string;
  steps: string[];
  examples: string[];
  summary: string;
}
