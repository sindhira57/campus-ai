import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Sliders,
  Check,
} from "lucide-react";
import { Subject, Exam, DayPlan, StudyTask, NavigationTab, StudentProfile } from "../../types";
import { generateStudyPlan } from "../../services/aiService";
import { playClickBeep } from "../../utils/sound";

interface StudyPlannerProps {
  subjects: Subject[];
  exams: Exam[];
  weeklyPlan: DayPlan[];
  onUpdateWeeklyPlan: (plan: DayPlan[]) => void;
  onAddTaskToDashboard: (task: Partial<StudyTask>) => void;
  setActiveTab: (tab: NavigationTab) => void;
  dailyGoalHours: number;
  profile?: StudentProfile;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  subjects,
  exams,
  weeklyPlan,
  onUpdateWeeklyPlan,
  onAddTaskToDashboard,
  setActiveTab,
  dailyGoalHours,
  profile,
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    subjects.map((s) => s.name)
  );
  const [availableHours, setAvailableHours] = useState(dailyGoalHours || 3.5);
  const [weakAreas, setWeakAreas] = useState<string>(() => {
    if (profile?.weakTopics && profile.weakTopics.length > 0) {
      return profile.weakTopics.join(", ");
    }
    const fromSubjects = subjects.flatMap((s) => s.weakTopics || []);
    if (fromSubjects.length > 0) {
      return fromSubjects.slice(0, 3).join(", ");
    }
    return "Core foundations, high-weight exam chapters";
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // New Custom Task Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTaskTitle, setCustomTaskTitle] = useState("");
  const [customTaskSubject, setCustomTaskSubject] = useState(subjects[0]?.name || "");
  const [customTaskDuration, setCustomTaskDuration] = useState(45);
  const [customTaskPriority, setCustomTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const handleToggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleGenerateSchedule = async () => {
    setLoading(true);
    setErrorMsg(null);

    const examDatesObj = exams.reduce((acc, ex) => {
      acc[ex.subjectName] = ex.examDate;
      return acc;
    }, {} as Record<string, string>);

    try {
      const res = await generateStudyPlan(
        selectedSubjects,
        examDatesObj,
        Number(availableHours),
        weakAreas,
        "High",
        profile?.degree || profile?.major,
        profile?.semester
      );

      if (res.days && res.days.length > 0) {
        onUpdateWeeklyPlan(res.days);
        setActiveDayIndex(0);
      }
    } catch (err: any) {
      console.error("Study Planner error:", err);
      setErrorMsg(err?.message || "Gemini is temporarily busy. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlanTask = (dayIdx: number, taskId: string) => {
    playClickBeep();
    const updatedPlan = [...weeklyPlan];
    const day = { ...updatedPlan[dayIdx] };
    day.tasks = day.tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return { ...t, completed: nextCompleted };
      }
      return t;
    });
    updatedPlan[dayIdx] = day;
    onUpdateWeeklyPlan(updatedPlan);
  };

  const handleAddCustomTaskToDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: customTaskTitle.trim(),
      subjectId: "custom",
      subjectName: customTaskSubject,
      durationMinutes: Number(customTaskDuration),
      priority: customTaskPriority,
      completed: false,
      date: new Date().toISOString().split("T")[0],
    };

    const updatedPlan = [...weeklyPlan];
    if (updatedPlan[activeDayIndex]) {
      updatedPlan[activeDayIndex].tasks.push(newTask);
      onUpdateWeeklyPlan(updatedPlan);
    }

    onAddTaskToDashboard(newTask);
    setCustomTaskTitle("");
    setShowAddModal(false);
    playClickBeep();
  };

  const currentDay = weeklyPlan[activeDayIndex] || weeklyPlan[0];
  const completedInCurrentDay =
    currentDay?.tasks.filter((t) => t.completed).length || 0;
  const totalInCurrentDay = currentDay?.tasks.length || 0;
  const dayPercent =
    totalInCurrentDay > 0
      ? Math.round((completedInCurrentDay / totalInCurrentDay) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Calendar className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Intelligent Weekly Study Planner
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Generate an optimal study schedule that balances theory revision, problem sets, exam countdowns, and rest intervals.
          </p>
        </div>
      </div>

      {/* Generator Configuration Panel */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Plan Configuration & Study Constraints
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Subjects selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Active Enrolled Subjects
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {subjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.name);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleToggleSubject(sub.name)}
                    className={`rounded-xl border px-2.5 py-1 text-xs font-medium transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {sub.emoji} {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Study Capacity */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Daily Study Capacity</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {availableHours} Hours/day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={availableHours}
              onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
              className="mt-3 w-full accent-indigo-600"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Includes spaced 10-min breaks between sessions.
            </p>
          </div>

          {/* Priority Weak Areas */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Priority Revision / Weak Topics
            </label>
            <input
              type="text"
              value={weakAreas}
              onChange={(e) => setWeakAreas(e.target.value)}
              placeholder="e.g. Dynamic Programming, Normalization..."
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={handleGenerateSchedule}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex justify-end border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            id="generate-plan-btn"
            onClick={handleGenerateSchedule}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? "Optimizing Weekly Schedule..." : "Generate AI Study Schedule"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Day Tabs & Schedule Display */}
      <div className="space-y-4">
        {/* Day selection tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {weeklyPlan.map((day, idx) => {
            const isSelected = activeDayIndex === idx;
            const completedCount = day.tasks.filter((t) => t.completed).length;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveDayIndex(idx);
                  playClickBeep();
                }}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm dark:bg-indigo-600"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{day.day}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {completedCount}/{day.tasks.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Agenda Card */}
        {currentDay && (
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                    {currentDay.day}'s Study Schedule
                  </h3>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {currentDay.focusSubject}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Focus: {currentDay.focusSubject} • {currentDay.tasks.length} targeted study intervals
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {dayPercent}% Completed
                  </span>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${dayPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              {currentDay.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTogglePlanTask(activeDayIndex, task.id)}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition ${
                    task.completed
                      ? "border-zinc-200 bg-zinc-50/60 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/30"
                      : "border-zinc-200/80 bg-white hover:border-indigo-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label="Toggle task"
                      className="mt-0.5 text-zinc-400 transition"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-400 hover:text-indigo-500" />
                      )}
                    </button>

                    <div>
                      <h4
                        className={`text-sm font-medium ${
                          task.completed
                            ? "text-zinc-400 line-through dark:text-zinc-600"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {task.title}
                      </h4>
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
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {task.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
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
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAddCustomTaskToDay}
            className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Add Task to {currentDay?.day}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Task Description
              </label>
              <input
                type="text"
                value={customTaskTitle}
                onChange={(e) => setCustomTaskTitle(e.target.value)}
                placeholder="e.g. Practice 3 LeetCode DP problems..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Subject
                </label>
                <select
                  value={customTaskSubject}
                  onChange={(e) => setCustomTaskSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Duration (mins)
                </label>
                <select
                  value={customTaskDuration}
                  onChange={(e) => setCustomTaskDuration(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-500"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
