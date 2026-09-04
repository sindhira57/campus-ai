export type NavigationTab =
  | "dashboard"
  | "tutor"
  | "notes"
  | "quiz"
  | "planner"
  | "assignments"
  | "examprep"
  | "progress"
  | "tools"
  | "subjects"
  | "settings";

export interface StudentProfile {
  name: string;
  degree: string; // e.g. "B.Tech AI & Data Science", "B.Com", "B.Sc Physics"
  department: string; // e.g. "Artificial Intelligence & Machine Learning", "Commerce"
  major: string; // backwards compatibility alias for degree/department
  year: string; // e.g. "3rd Year / Junior"
  semester: string; // e.g. "Semester 5"
  academicGoal: string; // e.g. "Target 9.0+ CGPA & crack campus placements"
  weakSubjects: string[]; // e.g. ["Data Structures & Algorithms", "Linear Algebra"]
  weakTopics: string[]; // e.g. ["Recursion", "Dynamic Programming", "Cash Flow Statements"]
  dailyStudyGoalHours: number;
  preferredStudyStyle: "step-by-step" | "practice-heavy" | "visual-analogy" | "exam-cram";
  targetGpa: string;
  streakDays: number;
  lastStudyDate: string;
  onboardingCompleted: boolean;
  totalStudyHoursLogged: number;
  email?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  emoji: string;
  color: string; // e.g. "blue", "emerald", "amber", "rose", "purple", "cyan"
  description: string;
  masteryPercentage: number;
  importantTopics: string[];
}

export interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  notes?: string;
}

export interface AssignmentSubtask {
  id: string;
  task: string;
  completed: boolean;
}

export interface AssignmentStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface AssignmentOutlineSection {
  section: string;
  keyPoints: string[];
}

export interface AssignmentHelp {
  understanding: string;
  steps: AssignmentStep[];
  outline: AssignmentOutlineSection[];
  difficultConcepts: { concept: string; explanation: string }[];
  researchApproach: string;
  checklist: AssignmentSubtask[];
}

export interface Assignment {
  id: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  description: string;
  status: "Not Started" | "In Progress" | "Reviewing" | "Completed";
  priority?: "High" | "Medium" | "Low";
  checklist?: { id: string; title: string; completed: boolean }[];
  aiHelp?: AssignmentHelp;
  deconstruction?: {
    understanding: string;
    stepByStepApproach: string[];
    outline: { section: string; guidance: string }[];
    difficultConcepts: { concept: string; explanation: string }[];
    researchSuggestions: string[];
    checklist: string[];
  };
}

export type AssignmentDeconstruction = NonNullable<Assignment["deconstruction"]>;

export interface ExamPrepGuide {
  subject: string;
  examDate: string;
  highYieldTopics: { topic: string; importance: "High" | "Medium" | "Low"; estimatedMarksPercentage: number; reason: string }[];
  revisionStrategy: { phase: string; focus: string }[];
  practiceQuestions: { question: string; marks: number; modelAnswer: string }[];
  cheatSheetBullets: string[];
}

export interface DayPlan {
  dayName: string;
  focus: string;
  totalHours: number;
  tasks: {
    id: string;
    title: string;
    durationMinutes: number;
    subject: string;
    priority: "High" | "Medium" | "Low";
    completed: boolean;
  }[];
}

export interface PriorityTopic {
  topic: string;
  weight: "High" | "Medium" | "Low";
  estimatedQuestions: string;
  strategy: string;
}

export interface RevisionSchedulePhase {
  phase: string;
  focus: string;
  hoursRecommended: number;
}

export interface ExamPracticeQuestion {
  question: string;
  answerGuide: string;
}

export interface ExamPrepPlan {
  priorityTopics: PriorityTopic[];
  revisionSchedule: RevisionSchedulePhase[];
  importantConcepts: { title: string; summary: string }[];
  practiceQuestions: ExamPracticeQuestion[];
  quickRevisionNotes: string[];
}

export interface Exam {
  id: string;
  subjectId: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string;
  room?: string;
  topics: string[];
  priority: "High" | "Medium" | "Low";
  prepPlan?: ExamPrepPlan;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface QuizResultRecord {
  id: string;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  questions: QuizQuestion[];
  userAnswers: number[]; // user selected indices
  weakTopics: string[];
}

export interface NoteAnalysis {
  id: string;
  title: string;
  subject: string;
  rawText: string;
  summary: string;
  importantTopics: string[];
  definitions: { term: string; definition: string }[];
  importantQuestions: string[];
  revisionNotes: string[];
  examQuestions: string[];
  createdAt: string;
}

export interface StudyPlanDay {
  dayName: string;
  focus: string;
  totalHours: number;
  tasks: {
    id: string;
    title: string;
    durationMinutes: number;
    subject: string;
    priority: "High" | "Medium" | "Low";
    completed: boolean;
  }[];
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  summary: string;
  days: StudyPlanDay[];
  tips: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  known?: boolean;
}

export interface FlashcardDeck {
  id: string;
  subject: string;
  topic: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface FormulaSheetCategory {
  categoryName: string;
  items: {
    name: string;
    formula: string;
    notes: string;
  }[];
}

export interface FormulaSheet {
  id: string;
  title: string;
  subject: string;
  categories: FormulaSheetCategory[];
  examMnemonics: string[];
  createdAt: string;
}

export interface StudySessionLog {
  id: string;
  subject: string;
  durationMinutes: number;
  type: "Pomodoro" | "Deep Work" | "Revision" | "Quiz";
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  subject?: string;
  mode?: "general" | "simple" | "example" | "exam" | "summary" | "practice" | "hint" | "next_step";
  suggestedQuizTopic?: string;
}

export interface AdaptiveRecommendation {
  subject: string;
  topic: string;
  urgency: "Critical" | "High" | "Medium" | "Low";
  reason: string;
  recommendedAction: string;
  actionType: "tutor" | "quiz" | "notes" | "exam";
  suggestedDurationMinutes: number;
  dataBacking: string;
}

