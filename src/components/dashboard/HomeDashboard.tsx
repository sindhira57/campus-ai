import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Bot,
  BookOpen,
  HelpCircle,
  FileText,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Award,
  AlertCircle,
  ChevronRight,
  Plus,
  ArrowUpRight,
  BookMarked,
  Brain,
  Zap,
  RefreshCw,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import {
  StudentProfile,
  StudyTask,
  Assignment,
  Exam,
  Subject,
  QuizResultRecord,
  NavigationTab,
  AdaptiveRecommendation,
} from "../../types";
import { playClickBeep } from "../../utils/sound";
import { computeAdaptiveRecommendation } from "../../utils/adaptiveEngine";
import { getAdaptiveRecommendation } from "../../services/aiService";

interface HomeDashboardProps {
  profile: StudentProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Partial<StudyTask>) => void;
  assignments: Assignment[];
  exams: Exam[];
  quizResults: QuizResultRecord[];
  setActiveTab: (tab: NavigationTab) => void;
  onSelectExamForPrep?: (examId: string) => void;
  onLaunchQuizFromTopic?: (topic: string, subject: string) => void;
  onLaunchTutorTopic?: (topic: string, subject: string) => void;
  todayStudyMinutes: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  subjects,
  tasks,
  onToggleTask,
  onAddTask,
  assignments,
  exams,
  quizResults,
  setActiveTab,
  onSelectExamForPrep,
  onLaunchQuizFromTopic,
  onLaunchTutorTopic,
  todayStudyMinutes,
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubjectId, setNewTaskSubjectId] = useState(subjects[0]?.id || "");
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Adaptive Engine local calculation
  const computedRecommendation = useMemo(() => {
    return computeAdaptiveRecommendation({
      profile,
      exams,
      assignments,
      quizResults,
      subjects,
      tasks,
    });
  }, [profile, exams, assignments, quizResults, subjects, tasks]);

  // AI-overridden recommendation if user requested deep generative synthesis
  const [aiCustomRecommendation, setAiCustomRecommendation] = useState<AdaptiveRecommendation | null>(null);
  const [isSynthesizingAi, setIsSynthesizingAi] = useState(false);

  const activeRecommendation = aiCustomRecommendation || computedRecommendation;

  const handleDeepAiRecommendation = async () => {
    playClickBeep();
    setIsSynthesizingAi(true);
    try {
      const res = await getAdaptiveRecommendation(profile, exams, assignments, quizResults, subjects);
      if (res && res.topic) {
        setAiCustomRecommendation({
          subject: res.subject,
          topic: res.topic,
          urgency: res.urgency,
          reason: res.reason,
          recommendedAction: res.recommendedAction,
          actionType: res.actionType,
          suggestedDurationMinutes: res.suggestedDurationMinutes || 35,
          dataBacking: res.dataBacking || "AI synthesized from comprehensive academic profile",
        });
      }
    } catch (err) {
      console.warn("Deep AI recommendation fallback to deterministic engine:", err);
    } finally {
      setIsSynthesizingAi(false);
    }
  };

  const handleExecuteAdaptiveAction = () => {
    playClickBeep();
    const { actionType, topic, subject } = activeRecommendation;
    if (actionType === "tutor") {
      if (onLaunchTutorTopic) {
        onLaunchTutorTopic(topic, subject);
      } else {
        setActiveTab("tutor");
      }
    } else if (actionType === "quiz") {
      if (onLaunchQuizFromTopic) {
        onLaunchQuizFromTopic(topic, subject);
      } else {
        setActiveTab("quiz");
      }
    } else if (actionType === "exam") {
      const targetExam = exams.find((e) => e.subjectName === subject || e.topics.includes(topic)) || exams[0];
      if (targetExam && onSelectExamForPrep) {
        onSelectExamForPrep(targetExam.id);
      }
      setActiveTab("examprep");
    } else if (actionType === "notes") {
      setActiveTab("notes");
    } else {
      setActiveTab("tutor");
    }
  };

  // Date and greeting
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = today.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Calculations
  const todayTasks = tasks.filter((t) => {
    const todayISO = today.toISOString().split("T")[0];
    return t.date === todayISO || !t.date;
  });
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const totalTodayTasks = todayTasks.length;
  const tasksPercent =
    totalTodayTasks > 0 ? Math.round((completedTodayCount / totalTodayTasks) * 100) : 0;

  // Average quiz score
  const avgQuizScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizResults.length
        )
      : 0;

  // Nearest upcoming exam
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );
  const nearestExam = sortedExams[0];
  let daysToNearestExam = 0;
  if (nearestExam) {
    const diffTime = new Date(nearestExam.examDate).getTime() - today.getTime();
    daysToNearestExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Active assignments
  const pendingAssignments = assignments
    .filter((a) => a.status !== "Completed")
    .slice(0, 3);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const subjectObj = subjects.find((s) => s.id === newTaskSubjectId) || subjects[0];
    onAddTask({
      title: newTaskTitle.trim(),
      subjectId: subjectObj?.id || "sub-1",
      subjectName: subjectObj?.name || "General",
      durationMinutes: Number(newTaskDuration),
      priority: newTaskPriority,
      date: today.toISOString().split("T")[0],
      completed: false,
    });

    setNewTaskTitle("");
    setShowAddTask(false);
    playClickBeep();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* 1. Header Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl dark:border-zinc-800 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <span>{dateStr}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-blue-300" />
                {profile.degree || profile.major}
              </span>
              {(profile.year || profile.semester) && (
                <>
                  <span>•</span>
                  <span>{profile.year} ({profile.semester})</span>
                </>
              )}
            </div>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
              {greeting}, {profile.name ? profile.name.split(" ")[0] : "Student"} 👋
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-blue-100/90 sm:text-sm">
              {profile.academicGoal ? (
                <>Goal: <span className="font-semibold text-amber-300">{profile.academicGoal}</span> • </>
              ) : null}
              You have <span className="font-bold text-amber-300">{totalTodayTasks - completedTodayCount} tasks remaining</span> today. Let's make every study hour count!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dash-quick-ask"
              onClick={() => setActiveTab("tutor")}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-blue-900 shadow-md transition hover:bg-blue-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Ask AI Tutor</span>
            </button>
            <button
              id="dash-quick-timer"
              onClick={() => setActiveTab("tools")}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Clock className="h-4 w-4 text-amber-300" />
              <span>Pomodoro</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-48 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      {/* 2. Adaptive Study Focus Recommendation Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/80 p-5 sm:p-6 shadow-sm dark:border-indigo-900/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                <Brain className="h-3.5 w-3.5" />
                <span>ADAPTIVE STUDY FOCUS</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  activeRecommendation.urgency === "Critical"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : activeRecommendation.urgency === "High"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                }`}
              >
                <Zap className="h-3 w-3" />
                <span>{activeRecommendation.urgency} Priority</span>
              </span>

              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{activeRecommendation.suggestedDurationMinutes} mins suggested
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {activeRecommendation.subject}: <span className="text-indigo-600 dark:text-indigo-400">{activeRecommendation.topic}</span>
              </h3>
              <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
                {activeRecommendation.recommendedAction}
              </p>
            </div>

            {/* Why This Was Prioritized Rationale Box */}
            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/60 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">Why this was prioritized: </span>
                  <span className="text-zinc-600 dark:text-zinc-300">{activeRecommendation.reason}</span>
                  <div className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    Evidence Signal: {activeRecommendation.dataBacking}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
            <button
              onClick={handleExecuteAdaptiveAction}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-blue-700 transition"
            >
              <span>Start Session Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleDeepAiRecommendation}
              disabled={isSynthesizingAi}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition"
              title="Run deep generative synthesis across all academic signals"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-indigo-500 ${isSynthesizingAi ? "animate-spin" : ""}`} />
              <span>{isSynthesizingAi ? "Analyzing..." : "Re-evaluate with AI"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Metric 1: Tasks */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Today's Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {completedTodayCount}/{totalTodayTasks}
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {tasksPercent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
              style={{ width: `${tasksPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Streak */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Study Streak</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Flame className="h-4 w-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {profile.streakDays}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Days 🔥
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Keep it alive today!</p>
        </div>

        {/* Metric 3: Quiz Score */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Quiz Average</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {avgQuizScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {quizResults.length} quizzes
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Across all subjects</p>
        </div>

        {/* Metric 4: Upcoming Exam */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Next Exam</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {daysToNearestExam}d
            </span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[80px]">
              {nearestExam?.subjectName?.split(" ")[0] || "None"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            {nearestExam ? new Date(nearestExam.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "All clear"}
          </p>
        </div>

        {/* Metric 5: Study Hours */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Study Logged</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {(todayStudyMinutes / 60).toFixed(1)}h
            </span>
            <span className="text-xs font-medium text-zinc-500">
              / {profile.dailyStudyGoalHours}h
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {profile.totalStudyHoursLogged}h all-time
          </p>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Quick Study Actions
          </h2>
          <span className="text-xs text-zinc-400">One-click academic power tools</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button
            id="action-ask-ai"
            onClick={() => setActiveTab("tutor")}
            className="group flex flex-col items-start rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm dark:border-blue-950/60 dark:bg-blue-950/20 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition">
              <Bot className="h-5 w-5" />
            </div>
            <span className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">Ask AI Tutor</span>
            <span className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">Explain any concept</span>
          </button>

          <button
            id="action-study-topic"
            onClick={() => setActiveTab("subjects")}
            className="group flex flex-col items-start rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm dark:border-emerald-950/60 dark:bg-emerald-950/20 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">Study a Topic</span>
            <span className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">Course syllabus & notes</span>
          </button>

          <button
            id="action-generate-quiz"
            onClick={() => setActiveTab("quiz")}
            className="group flex flex-col items-start rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm dark:border-amber-950/60 dark:bg-amber-950/20 dark:hover:border-amber-800 dark:hover:bg-amber-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs group-hover:scale-105 transition">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">Generate Quiz</span>
            <span className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">Custom MCQs & review</span>
          </button>

          <button
            id="action-analyze-notes"
            onClick={() => setActiveTab("notes")}
            className="group flex flex-col items-start rounded-2xl border border-purple-100 bg-purple-50/50 p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm dark:border-purple-950/60 dark:bg-purple-950/20 dark:hover:border-purple-800 dark:hover:bg-purple-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs group-hover:scale-105 transition">
              <FileText className="h-5 w-5" />
            </div>
            <span className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">Analyze Notes</span>
            <span className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">Summaries & key formulas</span>
          </button>

          <button
            id="action-study-planner"
            onClick={() => setActiveTab("planner")}
            className="group flex flex-col items-start rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm dark:border-indigo-950/60 dark:bg-indigo-950/20 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs group-hover:scale-105 transition">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">Study Planner</span>
            <span className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">Weekly schedule generator</span>
          </button>

          <button
            id="action-exam-prep"
            onClick={() => setActiveTab("examprep")}
            className="group flex flex-col items-start rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-left transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:shadow-sm dark:border-rose-950/60 dark:bg-rose-950/20 dark:hover:border-rose-800 dark:hover:bg-rose-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs group-hover:scale-105 transition">
              <Target className="h-5 w-5" />
            </div>
            <span className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">Exam Prep</span>
            <span className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">High-yield study master</span>
          </button>
        </div>
      </div>

      {/* 4. Two Column Layout: Tasks & Assignments/Exams */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Today's Tasks (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Today's Study Tasks</h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {todayTasks.length}
              </span>
            </div>
            <button
              id="add-task-toggle-btn"
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Inline Add Task Form */}
          {showAddTask && (
            <form
              onSubmit={handleCreateTask}
              className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                New Study Task
              </h3>
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Solve 5 problems on Binary Search Trees..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  autoFocus
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newTaskSubjectId}
                    onChange={(e) => setNewTaskSubjectId(e.target.value)}
                    className="rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className="rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Task list items */}
          <div className="space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
                <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                <p className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">All clear for today!</p>
                <p className="text-xs text-zinc-400">Add a task or generate your weekly study plan.</p>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="mt-3 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                >
                  + Add task
                </button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`group flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition ${
                    task.completed
                      ? "border-zinc-200/60 bg-zinc-50/60 opacity-60 dark:border-zinc-800/60 dark:bg-zinc-900/40"
                      : "border-zinc-200/80 bg-white hover:border-blue-200 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label="Toggle task"
                      className="mt-0.5 text-zinc-400 transition group-hover:scale-110"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-400 group-hover:text-blue-500" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          task.completed
                            ? "text-zinc-400 line-through dark:text-zinc-600"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {task.subjectName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.durationMinutes} mins
                        </span>
                        {task.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-zinc-400">{task.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      task.priority === "High"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        : task.priority === "Medium"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Assignments & Exams (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Upcoming Exams card */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Upcoming Exams</h3>
              </div>
              <button
                onClick={() => setActiveTab("examprep")}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {sortedExams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-5 text-center dark:border-zinc-800">
                  <Target className="mx-auto h-7 w-7 text-zinc-300 dark:text-zinc-600" />
                  <h4 className="mt-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">No upcoming exams</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Add midterms or finals to unlock high-yield prep plans & countdowns.
                  </p>
                  <button
                    onClick={() => setActiveTab("examprep")}
                    className="mt-2.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  >
                    + Add Exam
                  </button>
                </div>
              ) : (
                sortedExams.slice(0, 2).map((exam) => {
                  const diff = Math.max(
                    0,
                    Math.ceil(
                      (new Date(exam.examDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    )
                  );
                  return (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 transition hover:border-rose-200 dark:border-zinc-800/80 dark:bg-zinc-800/40"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {exam.subjectName}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {new Date(exam.examDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {exam.examTime && `at ${exam.examTime}`}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {exam.topics.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 shadow-2xs dark:bg-zinc-900 dark:text-zinc-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block rounded-xl bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          {diff}d left
                        </span>
                        <button
                          onClick={() => {
                            if (onSelectExamForPrep) onSelectExamForPrep(exam.id);
                            setActiveTab("examprep");
                          }}
                          className="mt-1.5 block text-[10px] font-bold text-rose-600 hover:underline dark:text-rose-400"
                        >
                          Prep Plan →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Assignments & Projects
                </h3>
              </div>
              <button
                onClick={() => setActiveTab("assignments")}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
              >
                <span>Manage</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {pendingAssignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-5 text-center dark:border-zinc-800">
                  <AlertCircle className="mx-auto h-7 w-7 text-zinc-300 dark:text-zinc-600" />
                  <h4 className="mt-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">No pending assignments</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Track coursework deadlines and project milestones.
                  </p>
                  <button
                    onClick={() => setActiveTab("assignments")}
                    className="mt-2.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    + Add Assignment
                  </button>
                </div>
              ) : (
                pendingAssignments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setActiveTab("assignments")}
                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 transition hover:border-blue-200 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                        {a.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {a.subjectName} • Due: {a.deadline}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {a.status}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Subject Mastery Snapshot */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <BookMarked className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Subject Mastery & Curriculum Progress
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Estimated comprehension based on quizzes, notes & completed tasks
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("progress")}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
          >
            <span>Detailed Analytics</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
              <BookOpen className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <h4 className="mt-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">No courses enrolled yet</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Enroll your semester courses to track mastery and generate practice quizzes.</p>
              <button onClick={() => setActiveTab("subjects")} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700">
                + Manage Courses
              </button>
            </div>
          ) : (
            subjects.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setActiveTab("subjects")}
                className="group cursor-pointer rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 transition hover:border-zinc-300 hover:bg-white hover:shadow-xs dark:border-zinc-800/80 dark:bg-zinc-800/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sub.emoji}</span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                        {sub.name}
                      </h4>
                      <span className="text-[10px] font-medium text-zinc-400">{sub.code}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                    {sub.masteryPercentage}%
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${sub.masteryPercentage}%` }}
                  />
                </div>

                <p className="mt-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {sub.importantTopics.slice(0, 2).join(", ")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
