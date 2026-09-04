import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  BookOpen,
  Target,
  Brain,
  Clock,
  Calendar,
  Plus,
  X,
  Zap,
} from "lucide-react";
import { StudentProfile, Subject, Exam } from "../../types";
import { academicPresets } from "../../data/initialData";

interface OnboardingModalProps {
  onComplete: (profile: Partial<StudentProfile>, subjects: Subject[], exam?: Exam) => void;
  onLoadPreset?: (presetKey: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onLoadPreset }) => {
  const [step, setStep] = useState(1);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("btech_ai");
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("B.Tech Artificial Intelligence & Data Science");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [year, setYear] = useState("3rd Year");
  const [semester, setSemester] = useState("Semester 5");
  const [academicGoal, setAcademicGoal] = useState("Target 9.0+ CGPA & crack campus technical placements");
  const [targetGpa, setTargetGpa] = useState("3.8");
  const [dailyHours, setDailyHours] = useState(3.5);
  const [preferredStudyStyle, setPreferredStudyStyle] = useState<
    "step-by-step" | "practice-heavy" | "visual-analogy" | "exam-cram"
  >("step-by-step");

  // Weak topics
  const [weakTopics, setWeakTopics] = useState<string[]>([
    "Backpropagation & Gradient Descent",
    "Dynamic Programming",
  ]);
  const [newWeakTopicInput, setNewWeakTopicInput] = useState("");

  // Subjects
  const [subjectsList, setSubjectsList] = useState<Subject[]>(() => {
    return academicPresets.btech_ai ? [...academicPresets.btech_ai.subjects] : [];
  });
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");

  // Exam
  const [hasUpcomingExam, setHasUpcomingExam] = useState(true);
  const [examSubject, setExamSubject] = useState("");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });

  // Handle Preset Switching
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    if (key === "custom") {
      setIsCustomMode(true);
      setDegree("");
      setDepartment("");
      setAcademicGoal("");
      setSubjectsList([]);
      setWeakTopics([]);
      return;
    }

    setIsCustomMode(false);
    const preset = academicPresets[key];
    if (preset) {
      setDegree(preset.degree);
      setDepartment(preset.department);
      setYear(preset.year);
      setSemester(preset.semester);
      setAcademicGoal(preset.academicGoal);
      setDailyHours(preset.dailyStudyGoalHours);
      setPreferredStudyStyle(preset.preferredStudyStyle);
      setWeakTopics([...preset.weakTopics]);
      setSubjectsList([...preset.subjects]);
      if (preset.subjects.length > 0) {
        setExamSubject(preset.subjects[0].name);
      }
    }
  };

  const handleAddWeakTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWeakTopicInput.trim();
    if (trimmed && !weakTopics.includes(trimmed)) {
      setWeakTopics([...weakTopics, trimmed]);
      setNewWeakTopicInput("");
    }
  };

  const handleRemoveWeakTopic = (topic: string) => {
    setWeakTopics(weakTopics.filter((t) => t !== topic));
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const sName = newSubjectName.trim();
    if (!sName) return;

    const colors = ["blue", "emerald", "amber", "rose", "purple", "cyan", "indigo"];
    const emojis = ["📘", "📗", "📙", "📕", "📒", "💻", "🔬", "📐", "⚡", "🧠"];
    const idx = subjectsList.length;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: sName,
      code: newSubjectCode.trim() || `CRS-${100 + idx * 10}`,
      emoji: emojis[idx % emojis.length],
      color: colors[idx % colors.length],
      description: `Course curriculum for ${sName}.`,
      masteryPercentage: 65,
      importantTopics: ["Core Foundations", "Problem Formulations", "Key Theorems"],
    };

    setSubjectsList([...subjectsList, newSub]);
    setNewSubjectName("");
    setNewSubjectCode("");
    if (!examSubject) {
      setExamSubject(sName);
    }
  };

  const handleRemoveSubject = (id: string) => {
    if (subjectsList.length <= 1) return;
    setSubjectsList(subjectsList.filter((s) => s.id !== id));
  };

  const finishOnboarding = () => {
    const studentName = name.trim() || "Student";
    const finalSubjects =
      subjectsList.length > 0
        ? subjectsList
        : [
            {
              id: "sub-1",
              name: "General Core Studies",
              code: "CRS-101",
              emoji: "📘",
              color: "blue",
              description: "Foundations & Core syllabus.",
              masteryPercentage: 70,
              importantTopics: ["Foundations", "Principles", "Applications"],
            },
          ];

    let createdExam: Exam | undefined = undefined;
    if (hasUpcomingExam && examDate) {
      const targetSub = finalSubjects.find((s) => s.name === examSubject) || finalSubjects[0];
      createdExam = {
        id: `exam-${Date.now()}`,
        subjectId: targetSub.id,
        subjectName: targetSub.name,
        examDate,
        examTime: "09:30 AM",
        room: "Exam Hall A",
        topics: targetSub.importantTopics || ["Foundations", "Core Principles"],
        priority: "High",
      };
    }

    onComplete(
      {
        name: studentName,
        degree: degree || "Undergraduate Program",
        department: department || "Academic Studies",
        major: department || degree,
        year,
        semester,
        academicGoal,
        targetGpa,
        dailyStudyGoalHours: Number(dailyHours),
        preferredStudyStyle,
        weakTopics,
        onboardingCompleted: true,
        streakDays: 1,
        lastStudyDate: new Date().toISOString().split("T")[0],
      },
      finalSubjects,
      createdExam
    );
  };

  const handleQuickDemoClick = () => {
    if (onLoadPreset) {
      onLoadPreset("btech_ai");
    } else {
      handleSelectPreset("btech_ai");
      setName("Alex Rivera");
      setTimeout(() => {
        finishOnboarding();
      }, 50);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header with Title & Step Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">Welcome to CampusAI</h2>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    Academic Setup
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">
                  Universal study companion for Engineering, Commerce, Science & Management
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoClick}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition backdrop-blur-xs border border-white/20"
              title="Instantly populate sample student profile"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>Load Sample Profile</span>
            </button>
          </div>

          {/* Stepper progress */}
          <div className="mt-5 flex gap-2">
            {[
              { num: 1, label: "Program & Goals" },
              { num: 2, label: "Course Enrollment" },
              { num: 3, label: "Adaptive Preferences" },
            ].map((s) => (
              <div key={s.num} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s.num <= step ? "bg-white" : "bg-white/25"
                  }`}
                />
                <p className="mt-1 text-[11px] font-medium text-blue-100 hidden sm:block">
                  {s.num}. {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {/* STEP 1: Program, Degree, Department */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Select your academic track or enter custom details
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  CampusAI adapts its tutor pedagogy, formula generators, and study recommendations to your specific academic discipline.
                </p>
              </div>

              {/* Stream Preset Chips */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Quick Academic Stream Preset:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: "btech_ai", label: "B.Tech AI & Data", icon: "🤖" },
                    { key: "btech_cs", label: "B.Tech Computer Sci", icon: "💻" },
                    { key: "bcom", label: "B.Com Commerce", icon: "📊" },
                    { key: "bba", label: "BBA Management", icon: "💼" },
                    { key: "bsc_math", label: "B.Sc Mathematics", icon: "📐" },
                    { key: "bsc_phys", label: "B.Sc Physics", icon: "⚛️" },
                    { key: "custom", label: "Custom Program", icon: "✏️" },
                  ].map((preset) => {
                    const isSelected = selectedPresetKey === preset.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handleSelectPreset(preset.key)}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-medium transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-200 shadow-xs"
                            : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
                        }`}
                      >
                        <span className="text-base">{preset.icon}</span>
                        <span className="truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanshu, Alex, Sophia"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Degree / Program
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech, B.Com, BBA, B.Sc"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Department / Major
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Artificial Intelligence, Finance, Physics"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={`Semester ${s}`}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Primary Academic Goal
                  </label>
                  <input
                    type="text"
                    value={academicGoal}
                    onChange={(e) => setAcademicGoal(e.target.value)}
                    placeholder="e.g. Target 9.0+ CGPA & prepare for campus placements"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Course / Subject Enrollment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Your Active Enrolled Courses ({subjectsList.length})
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  CampusAI monitors mastery and builds customized practice quizzes and formulas for each of these courses.
                </p>
              </div>

              {/* Subject list cards */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {subjectsList.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/60 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{sub.emoji || "📘"}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {sub.name}
                          </h4>
                          {sub.code && (
                            <span className="rounded-md bg-zinc-200/80 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                              {sub.code}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          Topics: {sub.importantTopics.slice(0, 3).join(", ")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(sub.id)}
                      className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-rose-500 transition"
                      title="Remove course"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add custom course form */}
              <form onSubmit={handleAddSubject} className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Add another enrolled course:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="Course name (e.g. Distributed Systems, Macroeconomics)"
                    className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <input
                    type="text"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="Code (optional)"
                    className="w-24 rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Learning Preferences & Adaptive Signals */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Adaptive Study Engine Calibration
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tell us where you struggle and how you learn best so our recommendation algorithm can calculate optimal study priorities.
                </p>
              </div>

              {/* Weak Topics */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Topics / Concepts you find tricky or challenging:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {weakTopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      <span>{topic}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWeakTopic(topic)}
                        className="text-amber-600 hover:text-rose-500 dark:text-amber-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {weakTopics.length === 0 && (
                    <span className="text-xs text-zinc-400 italic">No weak topics declared yet.</span>
                  )}
                </div>

                <form onSubmit={handleAddWeakTopic} className="flex gap-2">
                  <input
                    type="text"
                    value={newWeakTopicInput}
                    onChange={(e) => setNewWeakTopicInput(e.target.value)}
                    placeholder="+ Add a weak topic (e.g. Dynamic Programming, Cash Flow)"
                    className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-zinc-200 dark:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 transition"
                  >
                    Add Topic
                  </button>
                </form>
              </div>

              {/* Study Style */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Preferred AI Tutor Style:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "step-by-step", label: "Step-by-Step", desc: "Structured foundational breakdowns" },
                    { key: "practice-heavy", label: "Practice Heavy", desc: "Problems, code & exercises first" },
                    { key: "visual-analogy", label: "Visual / Analogy", desc: "Intuitive real-world metaphors" },
                    { key: "exam-cram", label: "Exam-Focused", desc: "High-scoring model answers & tips" },
                  ].map((style) => (
                    <button
                      key={style.key}
                      type="button"
                      onClick={() => setPreferredStudyStyle(style.key as any)}
                      className={`rounded-xl border p-2.5 text-left transition ${
                        preferredStudyStyle === style.key
                          ? "border-blue-500 bg-blue-50/70 text-blue-800 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200"
                          : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{style.label}</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily hours slider */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Daily Study Target:
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{dailyHours} hours/day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-blue-600"
                />
              </div>

              {/* Upcoming Exam */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    Do you have an upcoming exam soon?
                  </label>
                  <input
                    type="checkbox"
                    checked={hasUpcomingExam}
                    onChange={(e) => setHasUpcomingExam(e.target.checked)}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                </div>

                {hasUpcomingExam && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                        Exam Course
                      </span>
                      <select
                        value={examSubject}
                        onChange={(e) => setExamSubject(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {subjectsList.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                        Exam Date
                      </span>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleQuickDemoClick}
                className="sm:hidden text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                ⚡ Quick Demo Setup
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 dark:bg-blue-500"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishOnboarding}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/30 transition hover:opacity-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Adaptive Companion</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
