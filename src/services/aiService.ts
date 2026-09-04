// Client-side AI service communicating with server-side Express routes

async function postJSON<T>(url: string, body: any): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (networkErr: any) {
    console.error(`[aiService] Network fetch error for ${url}:`, networkErr);
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  if (!response.ok) {
    let errorMsg =
      response.status === 429
        ? "The AI usage limit has been reached. Please try again later."
        : response.status === 503
        ? "The AI tutor is temporarily busy. Please try again in a moment."
        : "An error occurred while processing your academic request. Please try again.";

    if (isJson) {
      try {
        const errData = await response.json();
        if (errData?.error && typeof errData.error === "string") {
          errorMsg = errData.error;
        }
      } catch (_) {}
    }
    throw new Error(errorMsg);
  }

  // Guard against HTML or unexpected non-JSON responses (e.g. <!doctype ... from SPA fallback or reverse proxy)
  if (!isJson) {
    const rawText = await response.text();
    console.warn(`[aiService] Expected JSON from ${url} but received Content-Type "${contentType}":`, rawText.slice(0, 100));
    throw new Error("The AI tutor is temporarily busy. Please try again in a moment.");
  }

  try {
    return await response.json();
  } catch (err: any) {
    console.error(`[aiService] Failed to parse JSON response from ${url}:`, err);
    throw new Error("The AI tutor is temporarily busy. Please try again in a moment.");
  }
}

export type TutorInteractionMode =
  | "general"
  | "simple"
  | "example"
  | "exam"
  | "summary"
  | "practice"
  | "hint"
  | "next_step"
  | "analogy"
  | "step_by_step";

export interface AskAIOptions {
  question: string;
  mode?: TutorInteractionMode;
  subject?: string;
  context?: string;
  studentProfile?: any;
  academicContext?: any;
  history?: { role: string; text?: string; content?: string }[];
}

export async function askAI(
  paramOrQuestion: string | AskAIOptions,
  legacyMode: TutorInteractionMode = "general",
  legacySubject: string = "",
  legacyContext: string = "",
  legacyStudentProfile?: any,
  legacyAcademicContext?: any,
  legacyHistory?: { role: string; text?: string; content?: string }[]
): Promise<{ text: string; mode: string }> {
  let payload: any;

  if (typeof paramOrQuestion === "object" && paramOrQuestion !== null) {
    payload = {
      question: paramOrQuestion.question,
      mode: paramOrQuestion.mode || "general",
      subject: paramOrQuestion.subject || "",
      context: paramOrQuestion.context || "",
      studentProfile: paramOrQuestion.studentProfile,
      academicContext: paramOrQuestion.academicContext,
      history: paramOrQuestion.history || [],
    };
  } else {
    payload = {
      question: paramOrQuestion,
      mode: legacyMode,
      subject: legacySubject,
      context: legacyContext,
      studentProfile: legacyStudentProfile,
      academicContext: legacyAcademicContext,
      history: legacyHistory || [],
    };
  }

  return postJSON("/api/ai/ask", payload);
}

export async function getAdaptiveRecommendation(
  profile: any,
  exams: any[] = [],
  assignments: any[] = [],
  quizResults: any[] = [],
  subjects: any[] = []
): Promise<{
  subject: string;
  topic: string;
  urgency: "Critical" | "High" | "Medium" | "Low";
  reason: string;
  recommendedAction: string;
  actionType: "tutor" | "quiz" | "notes" | "exam";
  suggestedDurationMinutes: number;
  dataBacking: string;
}> {
  return postJSON("/api/ai/adaptive-recommendation", {
    profile,
    exams,
    assignments,
    quizResults,
    subjects,
  });
}

export async function analyzeNotes(
  content: string,
  subject: string = ""
): Promise<{
  summary: string;
  importantTopics: string[];
  definitions: { term: string; definition: string }[];
  importantQuestions: string[];
  revisionNotes: string[];
  examQuestions: string[];
}> {
  return postJSON("/api/ai/analyze-notes", { content, subject });
}

export async function generateQuiz(
  subject: string,
  topic: string,
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
  count: number = 5,
  notesContext: string = ""
): Promise<{
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    topic: string;
  }[];
}> {
  return postJSON("/api/ai/generate-quiz", { subject, topic, difficulty, count, notesContext });
}

export async function generateStudyPlan(
  subjects: string[],
  examDates: Record<string, string>,
  dailyHours: number,
  topicsToCover: string,
  priority: string,
  degree?: string,
  semester?: string
): Promise<{
  summary: string;
  days: {
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
  }[];
  tips: string[];
}> {
  return postJSON("/api/ai/study-plan", {
    subjects,
    examDates,
    dailyHours,
    topicsToCover,
    priority,
    degree,
    semester,
  });
}

export async function getAssignmentHelp(
  subject: string,
  title: string,
  deadline: string,
  description: string
): Promise<{
  understanding: string;
  steps: { stepNumber: number; title: string; description: string }[];
  outline: { section: string; keyPoints: string[] }[];
  difficultConcepts: { concept: string; explanation: string }[];
  researchApproach: string;
  checklist: { id: string; task: string; completed: boolean }[];
}> {
  return postJSON("/api/ai/assignment-help", { subject, title, deadline, description });
}

export async function generateExamPrep(
  subject: string,
  examDate: string,
  topics: string | string[]
): Promise<{
  priorityTopics: { topic: string; weight: "High" | "Medium" | "Low"; estimatedQuestions: string; strategy: string }[];
  revisionSchedule: { phase: string; focus: string; hoursRecommended: number }[];
  importantConcepts: { title: string; summary: string }[];
  practiceQuestions: { question: string; answerGuide: string }[];
  quickRevisionNotes: string[];
}> {
  return postJSON("/api/ai/exam-prep", { subject, examDate, topics });
}

export async function generateFlashcards(
  subject: string,
  topic: string,
  count: number = 6
): Promise<{
  flashcards: { id: string; front: string; back: string }[];
}> {
  return postJSON("/api/ai/flashcards", { subject, topic, count });
}

export async function deconstructAssignment(
  description: string,
  subject: string = ""
): Promise<{
  understanding: string;
  stepByStepApproach: string[];
  outline: { section: string; guidance: string }[];
  difficultConcepts: { concept: string; explanation: string }[];
  researchSuggestions: string[];
  checklist: string[];
}> {
  const result = await getAssignmentHelp(subject, "Coursework & Assignment", "Upcoming", description);
  return {
    understanding: result.understanding,
    stepByStepApproach: (result.steps || []).map((s) => `${s.title}: ${s.description}`),
    outline: (result.outline || []).map((o) => ({
      section: o.section,
      guidance: o.keyPoints.join(", "),
    })),
    difficultConcepts: result.difficultConcepts || [],
    researchSuggestions: [result.researchApproach || "Consult course literature and primary slides."],
    checklist: (result.checklist || []).map((c) => c.task),
  };
}

export async function generateExamPrepGuide(
  subject: string,
  examDate: string,
  topics: string
): Promise<{
  subject: string;
  examDate: string;
  highYieldTopics: { topic: string; importance: "High" | "Medium" | "Low"; estimatedMarksPercentage: number; reason: string }[];
  revisionStrategy: { phase: string; focus: string }[];
  practiceQuestions: { question: string; marks: number; modelAnswer: string }[];
  cheatSheetBullets: string[];
}> {
  const result = await generateExamPrep(subject, examDate, topics);
  return {
    subject,
    examDate,
    highYieldTopics: (result.priorityTopics || []).map((p) => ({
      topic: p.topic,
      importance: p.weight,
      estimatedMarksPercentage: parseInt(p.estimatedQuestions) || 30,
      reason: p.strategy,
    })),
    revisionStrategy: (result.revisionSchedule || []).map((r) => ({
      phase: `${r.phase} (${r.hoursRecommended}h)`,
      focus: r.focus,
    })),
    practiceQuestions: (result.practiceQuestions || []).map((pq, idx) => ({
      question: pq.question,
      marks: (idx + 1) * 5,
      modelAnswer: pq.answerGuide,
    })),
    cheatSheetBullets: result.quickRevisionNotes || [],
  };
}

export async function generateFormulaSheet(
  subject: string,
  topic: string
): Promise<{
  title: string;
  categories: {
    categoryName: string;
    items: { name: string; formula: string; notes: string }[];
  }[];
  examMnemonics: string[];
}> {
  return postJSON("/api/ai/formula-sheet", { subject, topic });
}

export async function generateFormulasAndMnemonics(
  subject: string,
  topic: string
): Promise<{ text: string }> {
  const result = await generateFormulaSheet(subject, topic);
  let text = `# ${result.title}\n\n`;
  (result.categories || []).forEach((cat) => {
    text += `### ${cat.categoryName}\n`;
    (cat.items || []).forEach((item) => {
      text += `* **${item.name}**: \`${item.formula}\`\n  _${item.notes}_\n\n`;
    });
  });
  if (result.examMnemonics && result.examMnemonics.length > 0) {
    text += `### Exam Mnemonics & Memory Invariants\n`;
    result.examMnemonics.forEach((m) => {
      text += `* ${m}\n`;
    });
  }
  return { text };
}

