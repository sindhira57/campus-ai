import React, { useState } from "react";
import {
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Clock,
  Layers,
  Search,
  Check,
  ShieldAlert,
} from "lucide-react";
import { Assignment, Subject, AssignmentDeconstruction } from "../../types";
import { deconstructAssignment } from "../../services/aiService";
import { playClickBeep } from "../../utils/sound";

interface AssignmentHelperProps {
  subjects: Subject[];
  assignments: Assignment[];
  onAddAssignment: (assignment: Assignment) => void;
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
}

export const AssignmentHelper: React.FC<AssignmentHelperProps> = ({
  subjects,
  assignments,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    assignments[0] || null
  );

  // New assignment modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || "");
  const [newDeadline, setNewDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });
  const [newDescription, setNewDescription] = useState("");

  // Deconstruction AI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Assignment = {
      id: `assign-${Date.now()}`,
      title: newTitle.trim(),
      subjectName: newSubject,
      deadline: newDeadline,
      status: "Not Started",
      description: newDescription.trim(),
      checklist: [
        { id: `c-1`, title: "Understand requirements & criteria rubric", completed: false },
        { id: `c-2`, title: "Gather references, datasets, or lecture slides", completed: false },
        { id: `c-3`, title: "Draft core solution / implementation", completed: false },
        { id: `c-4`, title: "Review results, test edge cases, and finalize report", completed: false },
      ],
    };

    onAddAssignment(created);
    setSelectedAssignment(created);
    setNewTitle("");
    setNewDescription("");
    setShowNewModal(false);
    playClickBeep();
  };

  const handleDeconstruct = async () => {
    if (!selectedAssignment) return;
    setLoading(true);
    setErrorMsg(null);

    const promptText = `${selectedAssignment.title}\n\n${selectedAssignment.description || ""}`;
    try {
      const result: AssignmentDeconstruction = await deconstructAssignment(
        promptText,
        selectedAssignment.subjectName
      );

      const updatedChecklist = result.checklist.map((item, idx) => ({
        id: `c-ai-${idx}-${Date.now()}`,
        title: item,
        completed: false,
      }));

      const updatedAssignment: Assignment = {
        ...selectedAssignment,
        deconstruction: result,
        checklist: updatedChecklist.length > 0 ? updatedChecklist : selectedAssignment.checklist,
      };

      setSelectedAssignment(updatedAssignment);
      onUpdateAssignment(updatedAssignment);
      playClickBeep();
    } catch (err: any) {
      console.error("Deconstruct error:", err);
      setErrorMsg(err?.message || "Gemini is temporarily busy. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!selectedAssignment) return;
    playClickBeep();

    const updatedChecklist = (selectedAssignment.checklist || []).map((item) => {
      if (item.id === itemId) return { ...item, completed: !item.completed };
      return item;
    });

    const allDone = updatedChecklist.every((i) => i.completed);
    const anyDone = updatedChecklist.some((i) => i.completed);

    const nextStatus = allDone
      ? "Completed"
      : anyDone
      ? "In Progress"
      : selectedAssignment.status;

    const updated: Assignment = {
      ...selectedAssignment,
      checklist: updatedChecklist,
      status: nextStatus,
    };

    setSelectedAssignment(updated);
    onUpdateAssignment(updated);
  };

  const handleStatusChange = (status: Assignment["status"]) => {
    if (!selectedAssignment) return;
    const updated: Assignment = { ...selectedAssignment, status };
    setSelectedAssignment(updated);
    onUpdateAssignment(updated);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Academic Integrity Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <span className="font-bold">Academic Integrity & Learning Companion: </span>
          CampusAI helps you dissect complex assignment rubrics, outline clean structures, and understand core technical concepts step-by-step so you learn effectively and write your own original work.
        </div>
      </div>

      {/* Main Grid: Assignment List (4 cols) & Detail/Deconstruction View (8 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Assignment List */}
        <div className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Active Assignments ({assignments.length})
            </h2>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {assignments.map((a) => {
              const isSelected = selectedAssignment?.id === a.id;
              const completedCount = (a.checklist || []).filter((c) => c.completed).length;
              const totalCount = (a.checklist || []).length;

              return (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedAssignment(a);
                    playClickBeep();
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60 shadow-xs dark:border-blue-600 dark:bg-blue-950/40"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-xs font-bold ${
                        isSelected ? "text-blue-900 dark:text-blue-200" : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {a.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        a.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : a.status === "In Progress"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>{a.subjectName}</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      Due {a.deadline}
                    </span>
                  </div>

                  {totalCount > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{
                            width: `${Math.round((completedCount / totalCount) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-500">
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Assignment Workspace */}
        <div className="space-y-6 lg:col-span-8">
          {selectedAssignment ? (
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {selectedAssignment.subjectName}
                    </span>
                    <span className="text-xs text-zinc-400">Due: {selectedAssignment.deadline}</span>
                  </div>
                  <h2 className="mt-1.5 text-lg font-black text-zinc-900 dark:text-zinc-50 sm:text-xl">
                    {selectedAssignment.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedAssignment.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={handleDeconstruct}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{loading ? "Analyzing..." : "Deconstruct with AI Helper"}</span>
                  </button>
                </div>
              </div>

              {/* Assignment Prompt / Description */}
              {selectedAssignment.description && (
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">Assignment Rubric: </span>
                  {selectedAssignment.description}
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                  <button
                    onClick={handleDeconstruct}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Milestone Checklist */}
              <div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Step-by-Step Completion Checklist
                  </h3>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {(selectedAssignment.checklist || []).filter((c) => c.completed).length}/
                    {(selectedAssignment.checklist || []).length} done
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {(selectedAssignment.checklist || []).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                        item.completed
                          ? "border-zinc-200 bg-zinc-50/60 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/30"
                          : "border-zinc-200/80 bg-white hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-800/50"
                      }`}
                    >
                      <button type="button" className="mt-0.5">
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-400" />
                        )}
                      </button>
                      <span
                        className={`text-xs font-medium ${
                          item.completed
                            ? "text-zinc-400 line-through dark:text-zinc-600"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Deconstruction Breakdown Cards */}
              {selectedAssignment.deconstruction && (
                <div className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Layers className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      AI Structural Roadmap & Research Strategy
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Understanding & Approach */}
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-800/40 space-y-3">
                      <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        1. Core Objective & Scope
                      </h4>
                      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {selectedAssignment.deconstruction.understanding}
                      </p>

                      <h4 className="pt-2 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        2. Step-by-Step Approach
                      </h4>
                      <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                        {selectedAssignment.deconstruction.stepByStepApproach.map((st, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="font-bold text-indigo-500">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Structural Outline & Difficult Concepts */}
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-800/40 space-y-3">
                      <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        3. Suggested Document Outline
                      </h4>
                      <div className="space-y-2">
                        {selectedAssignment.deconstruction.outline.map((sec, i) => (
                          <div key={i} className="rounded-xl bg-white p-2.5 dark:bg-zinc-900 shadow-2xs">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {sec.section}
                            </span>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {sec.guidance}
                            </p>
                          </div>
                        ))}
                      </div>

                      <h4 className="pt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        4. Research & Citation Angles
                      </h4>
                      <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                        {selectedAssignment.deconstruction.researchSuggestions.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Search className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
              <ClipboardList className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
              <h3 className="mt-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No Assignment Selected
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Choose an assignment from the list or create a new one to get AI structural guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Assignment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateAssignment}
            className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Add New Assignment / Project
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Assignment Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Distributed Database Replication Report..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Subject
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
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
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Assignment Prompt / Instructions
              </label>
              <textarea
                rows={4}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Paste the professor's rubric, grading requirements, and deliverables..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500"
              >
                Save Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
