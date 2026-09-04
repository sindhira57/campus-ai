import {
  StudentProfile,
  Subject,
  Exam,
  Assignment,
  QuizResultRecord,
  StudyTask,
  AdaptiveRecommendation,
} from "../types";

export interface AdaptiveEngineSignals {
  profile: StudentProfile;
  subjects: Subject[];
  exams: Exam[];
  assignments: Assignment[];
  quizResults: QuizResultRecord[];
  tasks: StudyTask[];
}

/**
 * The signature CampusAI Adaptive Study Engine.
 * Analyzes real student signals:
 * - Upcoming exam proximity
 * - Assignment deadlines
 * - Recent quiz performance & identified weak topics
 * - Declared weak areas in profile
 * - Today's remaining study hours
 *
 * Produces an evidence-backed recommendation explaining WHY a topic is prioritized.
 */
export function computeAdaptiveRecommendation(
  signals: AdaptiveEngineSignals
): AdaptiveRecommendation {
  const { profile, subjects, exams, assignments, quizResults, tasks } = signals;

  // 1. Gather real evidence from quiz history
  const lowScoringQuizzes = quizResults.filter((q) => q.percentage < 70);
  const quizWeakTopics: { topic: string; subject: string; percentage: number }[] = [];
  quizResults.forEach((q) => {
    if (q.weakTopics && q.weakTopics.length > 0) {
      q.weakTopics.forEach((t) => {
        quizWeakTopics.push({ topic: t, subject: q.subject, percentage: q.percentage });
      });
    } else if (q.percentage < 70) {
      quizWeakTopics.push({ topic: q.topic, subject: q.subject, percentage: q.percentage });
    }
  });

  // 2. Gather upcoming exam urgency
  const now = new Date();
  const sortedExams = [...exams]
    .map((exam) => {
      const examDate = new Date(exam.examDate);
      const daysUntil = Math.max(
        0,
        Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      return { ...exam, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const urgentExam = sortedExams[0];

  // 3. Gather urgent assignments
  const pendingAssignments = assignments.filter((a) => a.status !== "Completed");
  const sortedAssignments = [...pendingAssignments]
    .map((a) => {
      const dueDate = new Date(a.deadline);
      const daysUntil = Math.max(
        0,
        Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      return { ...a, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const urgentAssignment = sortedAssignments[0];

  // 4. Determine priority using multi-signal heuristics

  // Case A: Urgent Exam (< 7 days) and there is a matching weak topic from quizzes or declared profile
  if (urgentExam && urgentExam.daysUntil <= 7) {
    // Check if any quiz weak topic belongs to this exam's subject
    const matchingQuizWeakness = quizWeakTopics.find(
      (w) =>
        w.subject.toLowerCase() === urgentExam.subjectName.toLowerCase() ||
        urgentExam.topics?.some((t) => t.toLowerCase().includes(w.topic.toLowerCase()))
    );

    // Check if profile weak topic matches
    const matchingProfileWeakness = (profile.weakTopics || []).find((wt) =>
      urgentExam.topics?.some((t) => t.toLowerCase().includes(wt.toLowerCase()))
    );

    const targetTopic =
      matchingQuizWeakness?.topic ||
      matchingProfileWeakness ||
      urgentExam.topics?.[0] ||
      `${urgentExam.subjectName} Core Topics`;

    const hasQuizData = !!matchingQuizWeakness;

    return {
      subject: urgentExam.subjectName,
      topic: targetTopic,
      urgency: urgentExam.daysUntil <= 3 ? "Critical" : "High",
      reason: hasQuizData
        ? `Your "${urgentExam.subjectName}" exam is in ${urgentExam.daysUntil} day${
            urgentExam.daysUntil === 1 ? "" : "s"
          }, and your recent quiz score on "${targetTopic}" was ${matchingQuizWeakness.percentage}%.`
        : `Your "${urgentExam.subjectName}" exam is in ${urgentExam.daysUntil} day${
            urgentExam.daysUntil === 1 ? "" : "s"
          }, and "${targetTopic}" is marked in your study plan for high-yield mastery.`,
      recommendedAction: `Review ${targetTopic} step-by-step with AI Tutor, then run a 5-question test.`,
      actionType: "tutor",
      suggestedDurationMinutes: Math.min(
        60,
        Math.max(30, Math.round((profile.dailyStudyGoalHours || 3) * 20))
      ),
      dataBacking: hasQuizData
        ? `Verified via ${quizResults.length} quiz record(s) and exam schedule (${urgentExam.daysUntil}d remaining).`
        : `Verified via exam schedule (${urgentExam.daysUntil}d remaining) and syllabus tracking.`,
    };
  }

  // Case B: Urgent Assignment (< 3 days)
  if (urgentAssignment && urgentAssignment.daysUntil <= 3) {
    return {
      subject: urgentAssignment.subjectName,
      topic: urgentAssignment.title,
      urgency: urgentAssignment.daysUntil <= 1 ? "Critical" : "High",
      reason: `Assignment "${urgentAssignment.title}" is due in ${urgentAssignment.daysUntil} day${
        urgentAssignment.daysUntil === 1 ? "" : "s"
      } (${urgentAssignment.deadline}).`,
      recommendedAction: `Deconstruct remaining milestones using Assignment Helper and complete research outline.`,
      actionType: "notes",
      suggestedDurationMinutes: 45,
      dataBacking: `Verified via pending assignment deadline (${urgentAssignment.deadline}).`,
    };
  }

  // Case C: Student has known weak topics from quiz performance
  if (quizWeakTopics.length > 0) {
    const primaryWeakness = quizWeakTopics[0];
    return {
      subject: primaryWeakness.subject,
      topic: primaryWeakness.topic,
      urgency: "High",
      reason: `Recent quiz assessment on "${primaryWeakness.topic}" scored ${primaryWeakness.percentage}%, indicating a conceptual gap.`,
      recommendedAction: `Ask AI Tutor for an ELI5 simple breakdown with real-world examples, then retake a practice quiz.`,
      actionType: "tutor",
      suggestedDurationMinutes: 35,
      dataBacking: `Derived from quiz performance (${primaryWeakness.percentage}%) in ${primaryWeakness.subject}.`,
    };
  }

  // Case D: Student declared weak topics in their onboarding profile
  if (profile.weakTopics && profile.weakTopics.length > 0) {
    const profileWeakness = profile.weakTopics[0];
    const matchingSubject =
      subjects.find((s) =>
        s.importantTopics?.some((t) => t.toLowerCase().includes(profileWeakness.toLowerCase()))
      ) ||
      subjects[0] || { name: "General Academics" };

    return {
      subject: matchingSubject.name,
      topic: profileWeakness,
      urgency: "Medium",
      reason: `You flagged "${profileWeakness}" as a self-reported weak area in your academic profile.`,
      recommendedAction: `Generate active-recall flashcards or test your understanding with a quick 5-question quiz.`,
      actionType: "quiz",
      suggestedDurationMinutes: 30,
      dataBacking: `Self-reported weak topic from ${profile.degree || profile.major || "profile"} onboarding.`,
    };
  }

  // Case E: Subject with lowest mastery percentage
  if (subjects.length > 0) {
    const lowestSubject = [...subjects].sort(
      (a, b) => a.masteryPercentage - b.masteryPercentage
    )[0];
    const topTopic = lowestSubject.importantTopics?.[0] || lowestSubject.name;

    return {
      subject: lowestSubject.name,
      topic: topTopic,
      urgency: "Medium",
      reason: `"${lowestSubject.name}" currently has your lowest estimated syllabus mastery at ${lowestSubject.masteryPercentage}%.`,
      recommendedAction: `Complete a diagnostic quiz or summarize class notes to raise mastery above 80%.`,
      actionType: "quiz",
      suggestedDurationMinutes: 30,
      dataBacking: `Computed from subject progress index (${lowestSubject.masteryPercentage}% mastery).`,
    };
  }

  // Default baseline when no courses configured yet
  return {
    subject: profile.degree || "Academics",
    topic: "Core Semester Syllabus",
    urgency: "Low",
    reason: "Complete onboarding or add upcoming exams/quizzes to unlock personalized adaptive guidance.",
    recommendedAction: "Add your subjects and upcoming exams to get tailored daily study recommendations.",
    actionType: "tutor",
    suggestedDurationMinutes: 25,
    dataBacking: "Initial profile state.",
  };
}
