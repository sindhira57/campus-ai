import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  Clock,
  Check,
  ChevronRight,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Subject, QuizQuestion, QuizResultRecord, NavigationTab } from "../../types";
import { generateQuiz } from "../../services/aiService";
import { playCelebrationChord, playClickBeep } from "../../utils/sound";

interface QuizGeneratorProps {
  subjects: Subject[];
  initialTopic?: string;
  initialSubject?: string;
  initialNotesContext?: string;
  onSaveQuizResult: (record: QuizResultRecord) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  subjects,
  initialTopic = "",
  initialSubject = "",
  initialNotesContext = "",
  onSaveQuizResult,
  setActiveTab,
}) => {
  // Setup State
  const [selectedSubject, setSelectedSubject] = useState(
    initialSubject || subjects[0]?.name || "Data Structures & Algorithms"
  );
  const [topic, setTopic] = useState(initialTopic || "Dynamic Programming & Graph Traversal");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [notesContext, setNotesContext] = useState(initialNotesContext || "");

  // Quiz Execution State
  const [quizState, setQuizState] = useState<"setup" | "active" | "results">("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Sync initial props if changed from another tab
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialNotesContext) setNotesContext(initialNotesContext);
  }, [initialTopic, initialSubject, initialNotesContext]);

  // Quiz timer
  useEffect(() => {
    let timer: any;
    if (quizState === "active") {
      timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [quizState]);

  const handleStartQuiz = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await generateQuiz(
        selectedSubject,
        topic || "Core Concepts",
        difficulty,
        questionCount,
        notesContext
      );

      if (!res.questions || res.questions.length === 0) {
        throw new Error("No questions returned from quiz generator.");
      }

      setQuestions(res.questions);
      setUserAnswers(new Array(res.questions.length).fill(-1));
      setCurrentQuestionIndex(0);
      setTimeElapsed(0);
      setQuizState("active");
      playClickBeep();
    } catch (err: any) {
      console.error("Quiz Generator error:", err);
      setErrorMsg(err?.message || "Gemini is temporarily busy. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    playClickBeep();
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = optionIndex;
    setUserAnswers(updated);
  };

  const handleSubmitQuiz = () => {
    // Calculate final score
    let score = 0;
    const weakTopicsList: string[] = [];

    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        score++;
      } else {
        if (q.topic && !weakTopicsList.includes(q.topic)) {
          weakTopicsList.push(q.topic);
        }
      }
    });

    const percentage = Math.round((score / questions.length) * 100);

    const record: QuizResultRecord = {
      id: `quiz-rec-${Date.now()}`,
      subject: selectedSubject,
      topic,
      difficulty,
      score,
      totalQuestions: questions.length,
      percentage,
      date: new Date().toISOString().split("T")[0],
      questions,
      userAnswers,
      weakTopics: weakTopicsList,
    };

    onSaveQuizResult(record);
    setQuizState("results");

    if (percentage >= 70) {
      playCelebrationChord();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    }
  };

  // Results calculation helpers
  const correctCount = questions.reduce(
    (acc, q, idx) => (userAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc),
    0
  );
  const incorrectCount = questions.length - correctCount;
  const scorePercent = Math.round((correctCount / (questions.length || 1)) * 100);

  const weakTopics = Array.from(
    new Set(
      questions
        .filter((q, idx) => userAnswers[idx] !== q.correctAnswerIndex)
        .map((q) => q.topic)
        .filter(Boolean)
    )
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* 1. Setup Screen */}
      {quizState === "setup" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
                  Interactive Quiz Generator
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Generate tailored multiple-choice tests with comprehensive mistake breakdowns and diagnostic feedback.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            {/* Subject & Topic */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Topic / Exam Chapter
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Asymptotic Notation, Dijkstra, Normalization..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Difficulty & Number of Questions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Difficulty Level
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["Easy", "Medium", "Hard"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        difficulty === lvl
                          ? "border-amber-500 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-200"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Number of Questions
                </label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        questionCount === num
                          ? "border-amber-500 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-200"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Notes Context indicator */}
            {notesContext && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 dark:border-purple-900/50 dark:bg-purple-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                    📄 Generating quiz exclusively from uploaded lecture notes
                  </span>
                  <button
                    onClick={() => setNotesContext("")}
                    className="text-[11px] font-semibold text-purple-600 hover:underline dark:text-purple-400"
                  >
                    Clear notes filter
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {notesContext}
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={handleStartQuiz}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                id="start-quiz-btn"
                onClick={handleStartQuiz}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-7 py-3 text-xs font-extrabold text-white shadow-md shadow-amber-500/20 transition hover:from-amber-700 hover:to-orange-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? "Generating Questions..." : "Start Interactive Quiz"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Quiz Runner */}
      {quizState === "active" && questions.length > 0 && (
        <div className="space-y-6">
          {/* Header Status */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white px-5 py-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {selectedSubject}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {Math.floor(timeElapsed / 60)}:
                {(timeElapsed % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Card */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <h2 className="text-base sm:text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
              {questions[currentQuestionIndex].question}
            </h2>

            {/* Options list */}
            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/80 shadow-xs dark:border-amber-500 dark:bg-amber-950/40"
                        : "border-zinc-200 bg-zinc-50/60 hover:border-amber-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? "bg-amber-600 text-white"
                          : "border border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {letter}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium leading-normal ${
                        isSelected
                          ? "text-amber-950 font-bold dark:text-amber-100"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 dark:bg-amber-500"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submit & Review Score</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Post-Quiz Review Screen */}
      {quizState === "results" && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Award className="h-7 w-7" />
            </div>

            <h2 className="mt-3 text-2xl font-black text-zinc-900 dark:text-zinc-50">
              Quiz Completed!
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {selectedSubject} • {topic}
            </p>

            <div className="mt-6 flex justify-center gap-6">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 min-w-[110px] dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                  {scorePercent}%
                </span>
                <p className="text-[11px] font-semibold text-zinc-400">Score</p>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-emerald-50/60 p-4 min-w-[110px] dark:border-emerald-950/40 dark:bg-emerald-950/20">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {correctCount}
                </span>
                <p className="text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-300">
                  Correct
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-rose-50/60 p-4 min-w-[110px] dark:border-rose-950/40 dark:bg-rose-950/20">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {incorrectCount}
                </span>
                <p className="text-[11px] font-semibold text-rose-700/80 dark:text-rose-300">
                  Incorrect
                </p>
              </div>
            </div>

            {/* Topics needing improvement */}
            {weakTopics.length > 0 && (
              <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span>Topics Needing Improvement:</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {weakTopics.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-2xs dark:bg-zinc-900 dark:text-amber-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                id="retry-quiz-btn"
                onClick={() => setQuizState("setup")}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 dark:bg-amber-500"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry Quiz</span>
              </button>

              <button
                onClick={() => setActiveTab("tutor")}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>Ask AI Tutor About Mistakes</span>
              </button>
            </div>
          </div>

          {/* Detailed Question by Question Mistake Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Detailed Question Review & Explanations
            </h3>

            {questions.map((q, idx) => {
              const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
              return (
                <div
                  key={idx}
                  className={`rounded-3xl border p-5 transition ${
                    isCorrect
                      ? "border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-950/60 dark:bg-emerald-950/10"
                      : "border-rose-200/80 bg-rose-50/20 dark:border-rose-950/60 dark:bg-rose-950/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {q.question}
                        </h4>
                        <span className="text-[10px] font-semibold text-zinc-400">
                          Subtopic: {q.topic}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </span>
                  </div>

                  {/* Options display */}
                  <div className="mt-3.5 space-y-1.5 pl-8">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = userAnswers[idx] === oIdx;
                      const isActualCorrect = q.correctAnswerIndex === oIdx;

                      return (
                        <div
                          key={oIdx}
                          className={`rounded-xl px-3 py-2 text-xs font-medium ${
                            isActualCorrect
                              ? "border border-emerald-300 bg-emerald-50 text-emerald-900 font-bold dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                              : isChosen
                              ? "border border-rose-300 bg-rose-50 text-rose-900 line-through dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                              : "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                          {isActualCorrect && " (Correct Answer)"}
                          {isChosen && !isActualCorrect && " (Your Choice)"}
                        </div>
                      );
                    })}
                  </div>

                  {/* In-depth explanation */}
                  <div className="mt-3.5 rounded-2xl border border-zinc-200/60 bg-white p-3.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 ml-8">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      💡 Explanation & Key Insight:{" "}
                    </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
