import {
  StudentProfile,
  Subject,
  StudyTask,
  Assignment,
  Exam,
  QuizResultRecord,
  NoteAnalysis,
  StudyPlan,
  StudySessionLog,
  FlashcardDeck,
  FormulaSheet,
} from "../types";
import {
  defaultEmptyProfile,
  initialProfile,
  initialSubjects,
  initialTasks,
  initialAssignments,
  initialExams,
  initialQuizResults,
  initialNotes,
  initialStudyPlan,
  initialStudyLogs,
  initialFlashcardDeck,
  academicPresets,
} from "../data/initialData";

const KEYS = {
  PROFILE: "campusai_profile_v1",
  SUBJECTS: "campusai_subjects_v1",
  TASKS: "campusai_tasks_v1",
  ASSIGNMENTS: "campusai_assignments_v1",
  EXAMS: "campusai_exams_v1",
  QUIZ_RESULTS: "campusai_quiz_results_v1",
  NOTES: "campusai_notes_v1",
  PLAN: "campusai_plan_v1",
  LOGS: "campusai_logs_v1",
  FLASHCARDS: "campusai_flashcards_v1",
  FORMULA_SHEETS: "campusai_formula_sheets_v1",
  THEME: "campusai_theme_v1",
};

export function loadProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return defaultEmptyProfile;
    return { ...defaultEmptyProfile, ...JSON.parse(raw) };
  } catch (e) {
    return defaultEmptyProfile;
  }
}

export function saveProfile(profile: StudentProfile) {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile:", e);
  }
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(KEYS.SUBJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveSubjects(subjects: Subject[]) {
  try {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error("Failed to save subjects:", e);
  }
}

export function loadTasks(): StudyTask[] {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveTasks(tasks: StudyTask[]) {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks:", e);
  }
}

export function loadAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(KEYS.ASSIGNMENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveAssignments(assignments: Assignment[]) {
  try {
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  } catch (e) {
    console.error("Failed to save assignments:", e);
  }
}

export function loadExams(): Exam[] {
  try {
    const raw = localStorage.getItem(KEYS.EXAMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveExams(exams: Exam[]) {
  try {
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
  } catch (e) {
    console.error("Failed to save exams:", e);
  }
}

export function loadQuizResults(): QuizResultRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.QUIZ_RESULTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveQuizResults(results: QuizResultRecord[]) {
  try {
    localStorage.setItem(KEYS.QUIZ_RESULTS, JSON.stringify(results));
  } catch (e) {
    console.error("Failed to save quiz results:", e);
  }
}

export function loadNotes(): NoteAnalysis[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveNotes(notes: NoteAnalysis[]) {
  try {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save notes:", e);
  }
}

export function loadStudyPlan(): StudyPlan {
  try {
    const raw = localStorage.getItem(KEYS.PLAN);
    if (!raw) return initialStudyPlan;
    return JSON.parse(raw);
  } catch (e) {
    return initialStudyPlan;
  }
}

export function saveStudyPlan(plan: StudyPlan) {
  try {
    localStorage.setItem(KEYS.PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error("Failed to save study plan:", e);
  }
}

export function loadStudyLogs(): StudySessionLog[] {
  try {
    const raw = localStorage.getItem(KEYS.LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStudyLogs(logs: StudySessionLog[]) {
  try {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save study logs:", e);
  }
}

export function loadDemoDataset(presetKey: string = "btech_ai") {
  const preset = academicPresets[presetKey] || academicPresets.btech_ai;
  const newProfile: StudentProfile = {
    name: "Alex Rivera",
    degree: preset.degree,
    department: preset.department,
    major: preset.department,
    year: preset.year,
    semester: preset.semester,
    academicGoal: preset.academicGoal,
    weakSubjects: preset.weakSubjects,
    weakTopics: preset.weakTopics,
    dailyStudyGoalHours: preset.dailyStudyGoalHours,
    preferredStudyStyle: preset.preferredStudyStyle,
    targetGpa: "3.8",
    streakDays: 5,
    lastStudyDate: new Date().toISOString().split("T")[0],
    onboardingCompleted: true,
    totalStudyHoursLogged: 28.5,
  };

  saveProfile(newProfile);
  saveSubjects(preset.subjects);

  // Generate 2 sample tasks for their actual subjects
  const s1 = preset.subjects[0];
  const s2 = preset.subjects[1] || s1;
  const demoTasks: StudyTask[] = [
    {
      id: `task-${Date.now()}-1`,
      subjectId: s1.id,
      subjectName: s1.name,
      title: `Review ${s1.importantTopics[0] || s1.name} core formulas & definitions`,
      durationMinutes: 45,
      date: new Date().toISOString().split("T")[0],
      priority: "High",
      completed: true,
      notes: "Completed initial review.",
    },
    {
      id: `task-${Date.now()}-2`,
      subjectId: s2.id,
      subjectName: s2.name,
      title: `Solve 4 practice questions on ${s2.importantTopics[0] || s2.name}`,
      durationMinutes: 40,
      date: new Date().toISOString().split("T")[0],
      priority: "Medium",
      completed: false,
      notes: "Focus on problem steps.",
    },
  ];
  saveTasks(demoTasks);

  // Generate 1 sample exam in 4 days
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 4);
  const demoExams: Exam[] = [
    {
      id: `exam-${Date.now()}`,
      subjectId: s1.id,
      subjectName: s1.name,
      examDate: examDate.toISOString().split("T")[0],
      examTime: "10:00 AM",
      room: "Exam Hall A-201",
      topics: s1.importantTopics.slice(0, 4),
      priority: "High",
    },
  ];
  saveExams(demoExams);

  // Generate 1 sample assignment in 6 days
  const assignDate = new Date();
  assignDate.setDate(assignDate.getDate() + 6);
  const demoAssignments: Assignment[] = [
    {
      id: `assign-${Date.now()}`,
      subjectId: s2.id,
      subjectName: s2.name,
      title: `${s2.name} Comprehensive Case Study & Project`,
      deadline: assignDate.toISOString().split("T")[0],
      description: `Prepare a detailed technical breakdown and analysis for ${s2.name} covering ${s2.importantTopics.slice(0, 2).join(" and ")}.`,
      status: "In Progress",
      priority: "High",
    },
  ];
  saveAssignments(demoAssignments);

  // Generate 1 initial quiz record
  const demoQuizResults: QuizResultRecord[] = [
    {
      id: `quiz-${Date.now()}`,
      subject: s1.name,
      topic: s1.importantTopics[0] || "Foundations",
      difficulty: "Medium",
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      date: new Date().toISOString().split("T")[0],
      questions: [],
      userAnswers: [],
      weakTopics: preset.weakTopics.slice(0, 1),
    },
  ];
  saveQuizResults(demoQuizResults);

  return {
    profile: newProfile,
    subjects: preset.subjects,
    tasks: demoTasks,
    exams: demoExams,
    assignments: demoAssignments,
    quizResults: demoQuizResults,
  };
}


export function loadFlashcardDecks(): FlashcardDeck[] {
  try {
    const raw = localStorage.getItem(KEYS.FLASHCARDS);
    if (!raw) return [initialFlashcardDeck];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [initialFlashcardDeck];
  } catch (e) {
    return [initialFlashcardDeck];
  }
}

export function saveFlashcardDecks(decks: FlashcardDeck[]) {
  try {
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(decks));
  } catch (e) {
    console.error("Failed to save flashcards:", e);
  }
}

export function loadFormulaSheets(): FormulaSheet[] {
  try {
    const raw = localStorage.getItem(KEYS.FORMULA_SHEETS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveFormulaSheets(sheets: FormulaSheet[]) {
  try {
    localStorage.setItem(KEYS.FORMULA_SHEETS, JSON.stringify(sheets));
  } catch (e) {
    console.error("Failed to save formula sheets:", e);
  }
}

export function loadTheme(): "dark" | "light" {
  try {
    const saved = localStorage.getItem("campusai_theme") || localStorage.getItem(KEYS.THEME);
    return (saved as "dark" | "light") || "light";
  } catch (e) {
    return "light";
  }
}

export function saveTheme(theme: "dark" | "light") {
  try {
    localStorage.setItem(KEYS.THEME, theme);
    localStorage.setItem("campusai_theme", theme);
  } catch (e) {
    console.error("Failed to save theme:", e);
  }
}

export function resetAllData() {
  localStorage.clear();
}

export const loadStoredProfile = loadProfile;
export const saveStoredProfile = saveProfile;
export const loadStoredSubjects = loadSubjects;
export const saveStoredSubjects = saveSubjects;
export const loadStoredTasks = loadTasks;
export const saveStoredTasks = saveTasks;
export const loadStoredAssignments = loadAssignments;
export const saveStoredAssignments = saveAssignments;
export const loadStoredExams = loadExams;
export const saveStoredExams = saveExams;
export const loadStoredQuizResults = loadQuizResults;
export const saveStoredQuizResults = saveQuizResults;
export const loadStoredNotes = loadNotes;
export const saveStoredNotes = saveNotes;
export const loadStoredSessionLogs = loadStudyLogs;
export const saveStoredSessionLogs = saveStudyLogs;
export const resetAllStorage = resetAllData;

export function loadStoredWeeklyPlan() {
  return loadStudyPlan().days;
}

export function saveStoredWeeklyPlan(days: any[]) {
  const plan = loadStudyPlan();
  saveStudyPlan({ ...plan, days });
}

