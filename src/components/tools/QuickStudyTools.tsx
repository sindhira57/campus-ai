import React, { useState, useEffect } from "react";
import {
  Wrench,
  Sparkles,
  Clock,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Zap,
  Layers,
  Copy,
  Check,
  Award,
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { Subject, Flashcard, NavigationTab } from "../../types";
import { generateFlashcards, generateFormulasAndMnemonics } from "../../services/aiService";
import { playCelebrationChord, playClickBeep, playTimerCompleteChime } from "../../utils/sound";

interface QuickStudyToolsProps {
  subjects: Subject[];
  onLogStudySession: (minutes: number, subjectName: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const QuickStudyTools: React.FC<QuickStudyToolsProps> = ({
  subjects,
  onLogStudySession,
  setActiveTab,
}) => {
  const [activeTool, setActiveTool] = useState<"pomodoro" | "flashcards" | "formulas" | "drill">("pomodoro");

  // Pomodoro state
  const [timerMode, setTimerMode] = useState<"study" | "shortBreak" | "longBreak">("study");
  const [customMinutes, setCustomMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActiveTimer, setIsActiveTimer] = useState(false);
  const [timerSubject, setTimerSubject] = useState(subjects[0]?.name || "General Study");
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Flashcards state
  const [fcSubject, setFcSubject] = useState(subjects[0]?.name || "Data Structures & Algorithms");
  const [fcTopic, setFcTopic] = useState("Binary Search Trees & Graph Invariants");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "fc-1",
      front: "What are the two key properties required for Dynamic Programming?",
      back: "1. Optimal Substructure: An optimal solution contains optimal solutions to its subproblems.\n2. Overlapping Subproblems: The recursive problem re-computes the same subproblems repeatedly.",
      mastered: false,
    },
    {
      id: "fc-2",
      front: "What is the worst-case and average-case time complexity of QuickSort?",
      back: "Worst Case: O(N²) when pivot choices are highly unbalanced.\nAverage / Best Case: O(N log N) with randomized pivot partitioning.",
      mastered: false,
    },
    {
      id: "fc-3",
      front: "Explain Data Forwarding (Bypassing) in RISC pipelining.",
      back: "A hardware optimization that routes result data directly from the ALU (EX/MEM stage) to earlier instruction pipeline stages (ID/EX) without waiting for Write-Back (WB), resolving RAW data hazards.",
      mastered: false,
    },
  ]);
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fcLoading, setFcLoading] = useState(false);

  // Formula & Cheat Sheet state
  const [formulaSubject, setFormulaSubject] = useState(subjects[0]?.name || "Data Structures & Algorithms");
  const [formulaTopic, setFormulaTopic] = useState("Recurrence Relations & Master Theorem");
  const [formulasContent, setFormulasContent] = useState<string>("");
  const [formulaLoading, setFormulaLoading] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);

  // 60-Second Rapid Drill state
  const [drillTopic, setDrillTopic] = useState("QuickSort vs MergeSort in 60 seconds");
  const [drillBulletPoints, setDrillBulletPoints] = useState<string[]>([
    "MergeSort is stable with guaranteed O(N log N) time, but requires O(N) auxiliary space.",
    "QuickSort operates in-place (O(1) auxiliary space, O(log N) call stack), but worst-case is O(N²).",
    "MergeSort is preferred for linked lists and external sorting on disks.",
    "QuickSort is preferred in practice for arrays due to superior cache locality and lower constant factors.",
  ]);

  // Pomodoro Ticker
  useEffect(() => {
    let interval: any = null;
    if (isActiveTimer && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActiveTimer) {
      setIsActiveTimer(false);
      playTimerCompleteChime();

      if (timerMode === "study") {
        onLogStudySession(customMinutes, timerSubject);
        setCompletedSessionsCount((prev) => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isActiveTimer, secondsRemaining, timerMode, customMinutes, timerSubject, onLogStudySession]);

  const handleSetTimerPreset = (mode: "study" | "shortBreak" | "longBreak", mins: number) => {
    setIsActiveTimer(false);
    setTimerMode(mode);
    setCustomMinutes(mins);
    setSecondsRemaining(mins * 60);
    playClickBeep();
  };

  const handleGenerateFlashcards = async () => {
    setFcLoading(true);
    try {
      const res = await generateFlashcards(fcSubject, fcTopic, 6);
      if (res.flashcards && res.flashcards.length > 0) {
        setFlashcards(res.flashcards);
        setCurrentFcIndex(0);
        setIsFlipped(false);
        playCelebrationChord();
      }
    } catch (err) {
      console.error("Flashcards err:", err);
    } finally {
      setFcLoading(false);
    }
  };

  const handleGenerateFormulas = async () => {
    setFormulaLoading(true);
    try {
      const res = await generateFormulasAndMnemonics(formulaSubject, formulaTopic);
      setFormulasContent(res.text);
      playClickBeep();
    } catch (err) {
      console.error("Formulas err:", err);
    } finally {
      setFormulaLoading(false);
    }
  };

  const handleToggleMastered = () => {
    const updated = [...flashcards];
    updated[currentFcIndex].mastered = !updated[currentFcIndex].mastered;
    setFlashcards(updated);
    playClickBeep();
  };

  // Timer formatted strings
  const timerMins = Math.floor(secondsRemaining / 60);
  const timerSecs = secondsRemaining % 60;
  const timerTotalSeconds = customMinutes * 60;
  const timerProgress = ((timerTotalSeconds - secondsRemaining) / timerTotalSeconds) * 100;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Wrench className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Study Power Tools & Focus Boosters
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Pomodoro focus timer, AI 3D flashcard decks, formula cheat-sheets, and 60-second rapid revision drills.
          </p>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white p-1 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {[
            { id: "pomodoro", label: "Pomodoro Timer", icon: Clock },
            { id: "flashcards", label: "AI Flashcards", icon: Layers },
            { id: "formulas", label: "Cheat Sheet", icon: BookOpen },
            { id: "drill", label: "Rapid Drill", icon: Zap },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id as any);
                  playClickBeep();
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs dark:bg-blue-600"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Pomodoro Focus Timer */}
      {activeTool === "pomodoro" && (
        <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-md dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-6">
          {/* Preset buttons */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleSetTimerPreset("study", 25)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                timerMode === "study"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => handleSetTimerPreset("shortBreak", 5)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                timerMode === "shortBreak"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleSetTimerPreset("longBreak", 15)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                timerMode === "longBreak"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Subject tag */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Subject Log:</span>
            <select
              value={timerSubject}
              onChange={(e) => setTimerSubject(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-bold text-zinc-800 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Big Timer Display */}
          <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-full border-8 border-zinc-100 bg-zinc-50/50 shadow-inner dark:border-zinc-800 dark:bg-zinc-950/40">
            <div>
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
                {timerMins.toString().padStart(2, "0")}:{timerSecs.toString().padStart(2, "0")}
              </div>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {timerMode === "study" ? "Deep Work Session" : "Rest & Recharge"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => {
                setIsActiveTimer(!isActiveTimer);
                playClickBeep();
              }}
              className={`flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-extrabold text-white shadow-md transition ${
                isActiveTimer
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500"
              }`}
            >
              {isActiveTimer ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isActiveTimer ? "Pause" : "Start Focus"}</span>
            </button>

            <button
              onClick={() => handleSetTimerPreset(timerMode, customMinutes)}
              className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              title="Reset Timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="pt-2 text-xs font-semibold text-zinc-400">
            🔥 Completed {completedSessionsCount} sessions today • Automatically logs study hours!
          </div>
        </div>
      )}

      {/* 2. Flashcard Deck Generator & Reviewer */}
      {activeTool === "flashcards" && (
        <div className="space-y-6">
          {/* Deck Configuration */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Subject
                </label>
                <select
                  value={fcSubject}
                  onChange={(e) => setFcSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Topic / Exam Chapter
                </label>
                <input
                  type="text"
                  value={fcTopic}
                  onChange={(e) => setFcTopic(e.target.value)}
                  placeholder="e.g. Graph Traversal, Pipelining Hazards..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleGenerateFlashcards}
                disabled={fcLoading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500"
              >
                <Sparkles className="h-4 w-4" />
                <span>{fcLoading ? "Generating Cards..." : "Generate AI Flashcards Deck"}</span>
              </button>
            </div>
          </div>

          {/* 3D Flip Card Canvas */}
          {flashcards.length > 0 && (
            <div className="mx-auto max-w-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                <span>
                  Card {currentFcIndex + 1} of {flashcards.length}
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {flashcards.filter((f) => f.mastered).length} Mastered
                </span>
              </div>

              {/* Clickable Flip Card */}
              <div
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  playClickBeep();
                }}
                className={`relative h-64 w-full cursor-pointer rounded-3xl border p-6 shadow-md transition duration-300 flex flex-col justify-between ${
                  isFlipped
                    ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-950 dark:border-indigo-800 dark:from-indigo-950/60 dark:to-zinc-900 dark:text-indigo-100"
                    : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <span>{isFlipped ? "Answer / Explanation" : "Question / Concept"}</span>
                  <span className="rounded-full bg-zinc-200/60 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Click to flip 🔄
                  </span>
                </div>

                <div className="my-auto text-center">
                  <p className="text-base sm:text-lg font-bold leading-relaxed whitespace-pre-line">
                    {isFlipped
                      ? flashcards[currentFcIndex].back
                      : flashcards[currentFcIndex].front}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{fcSubject}</span>
                  {flashcards[currentFcIndex].mastered && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Mastered
                    </span>
                  )}
                </div>
              </div>

              {/* Flashcard Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setCurrentFcIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                    playClickBeep();
                  }}
                  disabled={currentFcIndex === 0}
                  className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleToggleMastered}
                  className={`rounded-xl px-4 py-2 text-xs font-bold shadow-2xs transition ${
                    flashcards[currentFcIndex].mastered
                      ? "bg-emerald-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {flashcards[currentFcIndex].mastered ? "✓ Mastered" : "Mark as Mastered"}
                </button>

                <button
                  onClick={() => {
                    setCurrentFcIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                    setIsFlipped(false);
                    playClickBeep();
                  }}
                  disabled={currentFcIndex === flashcards.length - 1}
                  className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-30 dark:bg-blue-500"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Formula & Cheat Sheet Builder */}
      {activeTool === "formulas" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Subject
                </label>
                <select
                  value={formulaSubject}
                  onChange={(e) => setFormulaSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Topic / Exam Area
                </label>
                <input
                  type="text"
                  value={formulaTopic}
                  onChange={(e) => setFormulaTopic(e.target.value)}
                  placeholder="e.g. Master Theorem, Calculus Derivatives, Amdahl's Law..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleGenerateFormulas}
                disabled={formulaLoading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500"
              >
                <Sparkles className="h-4 w-4" />
                <span>{formulaLoading ? "Compiling Cheat Sheet..." : "Generate Formula Cheat Sheet"}</span>
              </button>
            </div>
          </div>

          {formulasContent && (
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {formulaSubject} • {formulaTopic} Formula Guide
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(formulasContent);
                    setCopiedFormula(true);
                    setTimeout(() => setCopiedFormula(false), 2000);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                >
                  {copiedFormula ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedFormula ? "Copied!" : "Copy Sheet"}</span>
                </button>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                {formulasContent}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. 60-Second Rapid Revision Drill */}
      {activeTool === "drill" && (
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              60-Second Rapid Memory Drill
            </h3>
          </div>

          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Topic: {drillTopic}
            </h4>
            <ul className="mt-3 space-y-2">
              {drillBulletPoints.map((b, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveTab("tutor")}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Ask AI for Another Drill
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
