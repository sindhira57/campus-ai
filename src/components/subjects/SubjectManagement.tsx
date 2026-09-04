import React, { useState } from "react";
import {
  BookMarked,
  Plus,
  Sparkles,
  HelpCircle,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Subject, NavigationTab } from "../../types";
import { playClickBeep } from "../../utils/sound";

interface SubjectManagementProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
  onSelectSubjectAction: (subjectName: string, action: "tutor" | "quiz" | "notes") => void;
}

export const SubjectManagement: React.FC<SubjectManagementProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  setActiveTab,
  onSelectSubjectAction,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [description, setDescription] = useState("");
  const [topicsStr, setTopicsStr] = useState("");

  const emojisList = ["💻", "🧠", "📐", "🔬", "⚡", "📊", "📘", "📗", "📙", "📕", "⚙️", "🌐"];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const topics = topicsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || `CRS-${Math.floor(Math.random() * 800 + 100)}`,
      emoji,
      color: "blue",
      description: description.trim() || `Course study hub for ${name.trim()}`,
      masteryPercentage: 65,
      importantTopics: topics.length > 0 ? topics : ["Fundamentals", "Core Theory", "Exam Practice"],
    };

    onAddSubject(newSub);
    setName("");
    setCode("");
    setDescription("");
    setTopicsStr("");
    setShowAddModal(false);
    playClickBeep();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <BookMarked className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Enrolled Course Modules & Subjects
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Manage your academic courses, track syllabus mastery, and launch subject-specific AI study sessions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 dark:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-800">
                    {sub.emoji}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {sub.name}
                    </h3>
                    <span className="text-xs font-semibold text-zinc-400">{sub.code}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteSubject(sub.id)}
                  title="Remove course"
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {sub.description}
              </p>

              {/* Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-500">Syllabus Mastery</span>
                  <span className="text-blue-600 dark:text-blue-400">{sub.masteryPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${sub.masteryPercentage}%` }}
                  />
                </div>
              </div>

              {/* Topics chips */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {sub.importantTopics.slice(0, 3).map((topic, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <button
                onClick={() => onSelectSubjectAction(sub.name, "tutor")}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI</span>
              </button>

              <button
                onClick={() => onSelectSubjectAction(sub.name, "quiz")}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline dark:text-amber-400"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Quiz</span>
              </button>

              <button
                onClick={() => onSelectSubjectAction(sub.name, "notes")}
                className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline dark:text-purple-400"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Notes</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Add New Course / Subject
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Course Icon
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {emojisList.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`h-9 w-9 rounded-xl border text-base transition ${
                      emoji === em
                        ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Course Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Course Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CS-301"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Key Topics (Comma-separated)
              </label>
              <input
                type="text"
                value={topicsStr}
                onChange={(e) => setTopicsStr(e.target.value)}
                placeholder="e.g. Process Scheduling, Virtual Memory, Deadlocks"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
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
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500"
              >
                Save Subject
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
