import React, { useState, useEffect } from "react";
import {
  Target,
  Sparkles,
  Clock,
  Award,
  BookOpen,
  HelpCircle,
  Zap,
  CheckCircle2,
  Layers,
  ChevronRight,
  AlertCircle,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import { Subject, Exam, ExamPrepGuide, NavigationTab } from "../../types";
import { generateExamPrepGuide } from "../../services/aiService";
import { playClickBeep } from "../../utils/sound";

interface ExamPrepModeProps {
  subjects: Subject[];
  exams: Exam[];
  selectedExamId?: string;
  onLaunchMockExam: (subject: string, topic: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const ExamPrepMode: React.FC<ExamPrepModeProps> = ({
  subjects,
  exams,
  selectedExamId,
  onLaunchMockExam,
  setActiveTab,
}) => {
  const [activeExamId, setActiveExamId] = useState<string>(
    selectedExamId || exams[0]?.id || ""
  );
  const [loading, setLoading] = useState(false);
  const [prepGuides, setPrepGuides] = useState<Record<string, ExamPrepGuide>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const activeExam = exams.find((e) => e.id === activeExamId) || exams[0];

  useEffect(() => {
    if (selectedExamId) {
      setActiveExamId(selectedExamId);
    }
  }, [selectedExamId]);

  // Live ticking countdown
  useEffect(() => {
    if (!activeExam?.examDate) return;

    const calculateTime = () => {
      const target = new Date(`${activeExam.examDate}T09:00:00`).getTime();
      const now = new Date().getTime();
      const difference = Math.max(0, target - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeExam]);

  // Load or generate prep guide
  const handleFetchPrepGuide = async () => {
    if (!activeExam) return;
    setLoading(true);
    setErrorMsg(null);

    const topicsStr = activeExam.topics.join(", ") || "Full Course Syllabus";
    try {
      const guide = await generateExamPrepGuide(
        activeExam.subjectName,
        activeExam.examDate,
        topicsStr
      );
      setPrepGuides((prev) => ({ ...prev, [activeExam.id]: guide }));
      playClickBeep();
    } catch (err: any) {
      console.error("Prep guide error:", err);
      setErrorMsg(err?.message || "Gemini is temporarily busy. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const currentGuide = activeExam ? prepGuides[activeExam.id] : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <Target className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Exam War Room & High-Yield Prep Mode
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Targeted revision schedules, high-yield topic distribution, model answers, and timed mock assessments.
          </p>
        </div>

        {/* Subject selector tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {exams.map((exam) => {
            const isSelected = activeExamId === exam.id;
            return (
              <button
                key={exam.id}
                onClick={() => {
                  setActiveExamId(exam.id);
                  playClickBeep();
                }}
                className={`rounded-2xl border px-4 py-2 text-xs font-bold transition ${
                  isSelected
                    ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {exam.subjectName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Countdown Card */}
      {activeExam && (
        <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-950 via-zinc-950 to-neutral-950 p-6 text-white shadow-xl dark:border-rose-900/50 sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300">
                <Target className="h-4 w-4 text-rose-400" />
                <span>Upcoming University Exam</span>
              </div>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                {activeExam.subjectName}
              </h2>
              <p className="mt-1 text-xs text-rose-200/80">
                Exam Date:{" "}
                {new Date(activeExam.examDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Countdown Tiles */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-3 min-w-[64px] sm:min-w-[76px] backdrop-blur-md">
                <span className="text-2xl sm:text-3xl font-black text-rose-400">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                  Days
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-3 min-w-[64px] sm:min-w-[76px] backdrop-blur-md">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                  Hours
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-3 min-w-[64px] sm:min-w-[76px] backdrop-blur-md">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {timeLeft.minutes}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                  Mins
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-3 min-w-[64px] sm:min-w-[76px] backdrop-blur-md">
                <span className="text-2xl sm:text-3xl font-black text-rose-400">
                  {timeLeft.seconds}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                  Secs
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-rose-200 font-semibold">Key Topics Covered:</span>
              {activeExam.topics.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-white/10 px-2 py-0.5 text-xs text-white"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onLaunchMockExam(
                    activeExam.subjectName,
                    activeExam.topics.join(", ") || "Final Exam Review"
                  )
                }
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-rose-700"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Launch Timed Mock Exam (10 Qs)</span>
              </button>

              <button
                onClick={handleFetchPrepGuide}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-900 shadow-md transition hover:bg-zinc-100 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                <span>{loading ? "Synthesizing Guide..." : "Generate AI Exam Guide"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={handleFetchPrepGuide}
            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Prep Guide Breakdown */}
      {currentGuide ? (
        <div className="space-y-6">
          {/* 1. High Yield Topics & Phased Strategy */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* High Yield Matrix (6 cols) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-rose-600 dark:text-rose-400">
                <Target className="h-4 w-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  High-Yield Topic Priority Matrix
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {currentGuide.highYieldTopics.map((topicItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {topicItem.topic}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            topicItem.importance === "High"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : topicItem.importance === "Medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {topicItem.importance} Yield
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {topicItem.reason}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-xl bg-white px-2 py-1 text-xs font-black text-rose-600 shadow-2xs dark:bg-zinc-900 dark:text-rose-400">
                      {topicItem.estimatedMarksPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phased Strategy (6 cols) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-blue-600 dark:text-blue-400">
                <Clock className="h-4 w-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Phased Countdown Revision Roadmap
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {currentGuide.revisionStrategy.map((strat, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        {strat.phase}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {strat.focus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Practice Questions with Model Answers */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-purple-600 dark:text-purple-400">
              <Award className="h-4 w-4" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Frequently Tested Exam Questions & High-Scoring Model Answers
              </h3>
            </div>

            <div className="space-y-4">
              {currentGuide.practiceQuestions.map((pq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-800/40 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      Q{idx + 1}: {pq.question}
                    </h4>
                    <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {pq.marks} Marks
                    </span>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-white p-3 text-xs leading-relaxed text-zinc-700 dark:border-purple-950/60 dark:bg-zinc-900 dark:text-zinc-300 shadow-2xs">
                    <span className="font-bold text-purple-900 dark:text-purple-300">
                      Model Answer:{" "}
                    </span>
                    {pq.modelAnswer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Quick Revision Cheat Sheet */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400">
              <Zap className="h-4 w-4" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Rapid Cheat Sheet & Memory Invariants
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {currentGuide.cheatSheetBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-zinc-800 dark:border-emerald-950/50 dark:bg-emerald-950/20 dark:text-zinc-200"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <Target className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
          <h3 className="mt-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No Exam Guide Generated Yet
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Click "Generate AI Exam Guide" above to build high-yield revision matrices and model answers.
          </p>
        </div>
      )}
    </div>
  );
};
