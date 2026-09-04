import React, { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  HelpCircle,
  BookmarkPlus,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Award,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Subject, NoteAnalysis, NavigationTab } from "../../types";
import { analyzeNotes } from "../../services/aiService";
import { playClickBeep } from "../../utils/sound";

interface NotesAnalyzerProps {
  subjects: Subject[];
  savedNotes: NoteAnalysis[];
  onSaveNote: (note: NoteAnalysis) => void;
  setActiveTab: (tab: NavigationTab) => void;
  onLaunchQuizFromNotes: (notesContext: string, subject: string, topic: string) => void;
}

export const NotesAnalyzer: React.FC<NotesAnalyzerProps> = ({
  subjects,
  savedNotes,
  onSaveNote,
  setActiveTab,
  onLaunchQuizFromNotes,
}) => {
  const [subject, setSubject] = useState(subjects[0]?.name || "Data Structures & Algorithms");
  const [noteTitle, setNoteTitle] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<NoteAnalysis | null>(savedNotes[0] || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sampleMaterials = [
    {
      title: "Lecture 8: Dynamic Programming & Knapsack",
      subject: "Data Structures & Algorithms",
      content: `Dynamic Programming (DP) is an algorithmic design technique used for optimization problems that exhibit two essential properties:
1. Optimal Substructure: An optimal solution to the problem contains within it optimal solutions to subproblems.
2. Overlapping Subproblems: A recursive solution contains a small number of distinct subproblems which are solved repeatedly.

Approaches:
- Top-Down (Memoization): Recursive implementation with a hash table/array storing computed solutions.
- Bottom-Up (Tabulation): Iterative implementation building solutions in topological order from base cases.

0/1 Knapsack Problem:
Given N items with weights w_i and values v_i, maximize total value within weight capacity W.
State definition: dp[i][w] = maximum value using a subset of items from 1..i with weight <= w.
Recurrence: dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + v_i) if w >= w_i else dp[i-1][w].
Time Complexity: O(N * W). Space Complexity: O(N * W), which can be optimized to O(W) using a 1D array traversed backwards.`,
    },
    {
      title: "Lecture 5: Pipelining & Hazard Mitigation",
      subject: "Computer Architecture",
      content: `Pipelining is an implementation technique where multiple instructions are overlapped in execution.
The standard 5-Stage RISC Pipeline stages are:
1. IF: Instruction Fetch from Instruction Memory
2. ID: Instruction Decode & Register Read
3. EX: Execute Operation or Calculate Address
4. MEM: Data Memory Access (Load/Store)
5. WB: Write Back result into Register File

Pipeline Hazards:
- Structural Hazard: Hardware cannot support all combinations of instructions simultaneously (e.g., single memory for instructions and data).
- Data Hazard: Instruction depends on result of previous instruction still in pipeline (Read-After-Write / RAW). Mitigated by Data Forwarding / Bypassing and load-use delays.
- Control Hazard: Branch decision is made after subsequent instructions are already fetched. Mitigated by Branch Prediction (Static / Dynamic 2-bit branch history tables) and Branch Delay Slots.

Ideal Speedup = Number of Pipeline Stages. CPI (Cycles Per Instruction) ideally equals 1, but hazards increase stall cycles.`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNoteTitle(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawContent(text || "");
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sample: (typeof sampleMaterials)[0]) => {
    setSubject(sample.subject);
    setNoteTitle(sample.title);
    setRawContent(sample.content);
    playClickBeep();
  };

  const handleAnalyze = async () => {
    if (!rawContent.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const result = await analyzeNotes(rawContent, subject);
      const newAnalysis: NoteAnalysis = {
        id: `note-${Date.now()}`,
        title: noteTitle || `Notes on ${subject} (${new Date().toLocaleDateString()})`,
        subject,
        rawText: rawContent,
        summary: result.summary,
        importantTopics: result.importantTopics || [],
        definitions: result.definitions || [],
        importantQuestions: result.importantQuestions || [],
        revisionNotes: result.revisionNotes || [],
        examQuestions: result.examQuestions || [],
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCurrentAnalysis(newAnalysis);
    } catch (err: any) {
      console.error("Analyze error:", err);
      setErrorMsg(err?.message || "Gemini is temporarily busy. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToRepository = () => {
    if (!currentAnalysis) return;
    onSaveNote(currentAnalysis);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopy = (secName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(secName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <FileText className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              AI Notes Analyzer & Exam Extractor
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Upload lecture notes, slides, or study documents to instantly extract organized study cards, key definitions & quiz questions.
          </p>
        </div>

        {/* Quick sample loader pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">Quick Samples:</span>
          {sampleMaterials.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(s)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {s.title.split(":")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Subject / Course
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-purple-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
              Note Title / Lecture Name
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Chapter 4: Graph Routing & Bellman-Ford..."
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-purple-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Paste Notes Text or Upload File (.txt, .md, .csv)
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300">
              <Upload className="h-3 w-3" />
              <span>Choose Document</span>
              <input
                type="file"
                accept=".txt,.md,.json,.csv,.doc"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <textarea
            rows={5}
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="Paste your lecture slides text, transcript, professor's notes, or syllabus here..."
            className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50/50 p-3.5 text-xs font-medium text-zinc-900 shadow-inner focus:border-purple-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400">
            {rawContent.length > 0 ? `${rawContent.length} characters loaded` : "No text input yet"}
          </span>

          <button
            onClick={handleAnalyze}
            disabled={!rawContent.trim() || loading}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? "Analyzing Notes..." : "Deconstruct & Analyze Notes"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={handleAnalyze}
            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Structured Output Cards */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Action header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-purple-50/70 p-4 dark:border-purple-950/60 dark:bg-purple-950/30">
            <div>
              <h2 className="text-sm font-extrabold text-purple-900 dark:text-purple-200">
                {currentAnalysis.title}
              </h2>
              <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
                {currentAnalysis.subject} • Analyzed on {currentAnalysis.createdAt}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  onLaunchQuizFromNotes(
                    currentAnalysis.rawText,
                    currentAnalysis.subject,
                    currentAnalysis.title
                  )
                }
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 dark:bg-amber-500"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Create Quiz From This Note</span>
              </button>

              <button
                onClick={handleSaveToRepository}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 dark:bg-purple-500"
              >
                {saveSuccess ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                <span>{saveSuccess ? "Saved to Library!" : "Save Note"}</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Card 1: Executive Summary (12 cols) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-12">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <BookOpen className="h-4 w-4" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Executive Overview & Core Focus
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy("summary", currentAnalysis.summary)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {copiedSection === "summary" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {currentAnalysis.summary}
              </p>

              {/* Important Topics Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 mr-1">Key Modules:</span>
                {currentAnalysis.importantTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2: Key Definitions & Formulas (6 cols) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-blue-600 dark:text-blue-400">
                <Layers className="h-4 w-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Key Definitions & Formulas
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {currentAnalysis.definitions.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/40"
                  >
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400">
                      {item.term}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Short Revision Notes (6 cols) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-4 w-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  5-Minute Rapid Revision Bullets
                </h3>
              </div>

              <ul className="mt-4 space-y-2.5">
                {currentAnalysis.revisionNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 4: Conceptual Questions (6 cols) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
                <HelpCircle className="h-4 w-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Key Conceptual Review Questions
                </h3>
              </div>

              <div className="mt-4 space-y-2.5">
                {currentAnalysis.importantQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 text-xs text-zinc-800 dark:border-zinc-800/60 dark:bg-zinc-800/30 dark:text-zinc-200"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800 text-[10px] dark:bg-amber-950 dark:text-amber-300">
                      {idx + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Possible Exam Questions (6 cols) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800 text-rose-600 dark:text-rose-400">
                <Award className="h-4 w-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Predicted University Exam Questions
                </h3>
              </div>

              <div className="mt-4 space-y-2.5">
                {currentAnalysis.examQuestions.map((eq, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-xs text-zinc-800 dark:border-rose-950/60 dark:bg-rose-950/20 dark:text-zinc-200"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 font-bold text-rose-800 text-[10px] dark:bg-rose-900 dark:text-rose-300">
                      Q{idx + 1}
                    </span>
                    <span>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
