import React from "react";
import {
  BarChart3,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  StudentProfile,
  Subject,
  QuizResultRecord,
  StudySessionLog,
  NavigationTab,
} from "../../types";

interface ProgressTrackerProps {
  profile: StudentProfile;
  subjects: Subject[];
  quizResults: QuizResultRecord[];
  sessionLogs: StudySessionLog[];
  setActiveTab: (tab: NavigationTab) => void;
  todayStudyMinutes: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  profile,
  subjects,
  quizResults,
  sessionLogs,
  setActiveTab,
  todayStudyMinutes,
}) => {
  // Aggregate weak topics from all quizzes
  const allWeakTopics: Record<string, number> = {};
  quizResults.forEach((q) => {
    (q.weakTopics || []).forEach((t) => {
      allWeakTopics[t] = (allWeakTopics[t] || 0) + 1;
    });
  });

  const sortedWeakTopics = Object.entries(allWeakTopics).sort((a, b) => b[1] - a[1]);

  // Aggregate strong topics from subjects
  const strongSubjects = [...subjects].sort((a, b) => b.masteryPercentage - a.masteryPercentage);

  // Weekly study distribution mockup calculation
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyHours = [3.2, 4.0, 2.5, 4.5, 3.8, 5.0, (todayStudyMinutes / 60) || 2.0];
  const maxHour = Math.max(...weeklyHours, 5);

  const totalQuizzes = quizResults.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(quizResults.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
      : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Academic Progress & Analytics
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Real-time breakdown of subject mastery, study streaks, quiz performance, and weak area diagnostics.
          </p>
        </div>
      </div>

      {/* Top 4 Performance Badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>Current Streak</span>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {profile.streakDays} Days
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Active habit maintained
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>Total Study Hours</span>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {(profile.totalStudyHoursLogged + todayStudyMinutes / 60).toFixed(1)}h
          </p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            {profile.dailyStudyGoalHours}h daily target
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Award className="h-4 w-4 text-emerald-500" />
            <span>Quiz Average</span>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {avgQuizScore}%
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {totalQuizzes} assessments taken
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span>Target GPA</span>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {profile.targetGpa}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {profile.year}
          </span>
        </div>
      </div>

      {/* Two Column Grid: Subject Mastery & Weekly Bar Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Subject Mastery Progress Bars (6 cols) */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Subject Mastery Scores
              </h2>
            </div>
            <button
              onClick={() => setActiveTab("subjects")}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Manage Subjects
            </button>
          </div>

          <div className="space-y-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <span>{sub.emoji}</span>
                    <span>{sub.name}</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400">
                    {sub.masteryPercentage}%
                  </span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${sub.masteryPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Study Hours Bar Chart (6 cols) */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Weekly Study Time (Hours)
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-medium">This Week</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex h-48 items-end justify-between gap-3 pt-6 px-2">
            {daysOfWeek.map((day, idx) => {
              const val = weeklyHours[idx];
              const heightPercent = Math.round((val / maxHour) * 100);
              const isToday = idx === 6; // Sunday/Today

              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                    {val.toFixed(1)}h
                  </span>
                  <div className="w-full max-w-[36px] rounded-t-xl bg-zinc-100 dark:bg-zinc-800 h-32 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-blue-600 to-indigo-500"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-400"
                    }`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Diagnostics: Weak vs Strong Areas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Weak Topics */}
        <div className="rounded-3xl border border-rose-200/80 bg-rose-50/30 p-6 shadow-xs dark:border-rose-950/60 dark:bg-rose-950/20 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="text-sm font-bold">Identified Weak Areas (Needs Revision)</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Extracted from recent quiz errors and self-assessments.
          </p>

          <div className="space-y-2 pt-2">
            {sortedWeakTopics.length > 0 ? (
              sortedWeakTopics.slice(0, 4).map(([t, count], idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-2xs dark:bg-zinc-900"
                >
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {t}
                  </span>
                  <button
                    onClick={() => setActiveTab("tutor")}
                    className="text-[11px] font-bold text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Review with AI →
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs italic text-zinc-400">
                No weak topics logged yet! Keep taking quizzes to populate diagnostics.
              </p>
            )}
          </div>
        </div>

        {/* Strong Topics */}
        <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/30 p-6 shadow-xs dark:border-emerald-950/60 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Award className="h-4 w-4" />
            <h3 className="text-sm font-bold">Strong Topics & Mastered Concepts</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Subjects and chapters with &gt;75% estimated mastery.
          </p>

          <div className="space-y-2 pt-2">
            {strongSubjects.slice(0, 4).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-2xs dark:bg-zinc-900"
              >
                <div className="flex items-center gap-2">
                  <span>{sub.emoji}</span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {sub.name}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {sub.masteryPercentage}% Mastered
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz History Records Table */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Quiz History & Assessment Logs
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("quiz")}
            className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
          >
            + Take New Quiz
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 dark:border-zinc-800">
                <th className="pb-3 font-semibold">Subject / Topic</th>
                <th className="pb-3 font-semibold">Difficulty</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Percentage</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {quizResults.map((rec) => (
                <tr key={rec.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">
                    <div>{rec.subject}</div>
                    <div className="text-[11px] font-normal text-zinc-400">{rec.topic}</div>
                  </td>
                  <td className="py-3">
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {rec.difficulty}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    {rec.score} / {rec.totalQuestions}
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-black ${
                        rec.percentage >= 70
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {rec.percentage}%
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">{rec.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
