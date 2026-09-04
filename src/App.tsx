/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  NavigationTab,
  StudentProfile,
  Subject,
  StudyTask,
  Assignment,
  Exam,
  NoteAnalysis,
  QuizResultRecord,
  DayPlan,
  StudySessionLog,
} from "./types";
import {
  loadStoredProfile,
  saveStoredProfile,
  loadStoredSubjects,
  saveStoredSubjects,
  loadStoredTasks,
  saveStoredTasks,
  loadStoredAssignments,
  saveStoredAssignments,
  loadStoredExams,
  saveStoredExams,
  loadStoredNotes,
  saveStoredNotes,
  loadStoredQuizResults,
  saveStoredQuizResults,
  loadStoredWeeklyPlan,
  saveStoredWeeklyPlan,
  loadStoredSessionLogs,
  saveStoredSessionLogs,
  loadDemoDataset,
  resetAllStorage,
} from "./utils/storage";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileNav } from "./components/layout/MobileNav";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { HomeDashboard } from "./components/dashboard/HomeDashboard";
import { AiTutor } from "./components/tutor/AiTutor";
import { NotesAnalyzer } from "./components/notes/NotesAnalyzer";
import { QuizGenerator } from "./components/quiz/QuizGenerator";
import { StudyPlanner } from "./components/planner/StudyPlanner";
import { AssignmentHelper } from "./components/assignments/AssignmentHelper";
import { ExamPrepMode } from "./components/examprep/ExamPrepMode";
import { ProgressTracker } from "./components/progress/ProgressTracker";
import { QuickStudyTools } from "./components/tools/QuickStudyTools";
import { SubjectManagement } from "./components/subjects/SubjectManagement";
import { SettingsView } from "./components/settings/SettingsView";
import { playClickBeep } from "./utils/sound";

export default function App() {
  // State Initialization from Persistent LocalStorage
  const [profile, setProfile] = useState<StudentProfile>(loadStoredProfile);
  const [subjects, setSubjects] = useState<Subject[]>(loadStoredSubjects);
  const [tasks, setTasks] = useState<StudyTask[]>(loadStoredTasks);
  const [assignments, setAssignments] = useState<Assignment[]>(loadStoredAssignments);
  const [exams, setExams] = useState<Exam[]>(loadStoredExams);
  const [savedNotes, setSavedNotes] = useState<NoteAnalysis[]>(loadStoredNotes);
  const [quizResults, setQuizResults] = useState<QuizResultRecord[]>(loadStoredQuizResults);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(loadStoredWeeklyPlan);
  const [sessionLogs, setSessionLogs] = useState<StudySessionLog[]>(loadStoredSessionLogs);

  // Active Navigation & Navigation Contexts
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("campusai_theme") as "dark" | "light") || "light";
  });

  // Cross-module trigger contexts
  const [quizTopicContext, setQuizTopicContext] = useState("");
  const [quizSubjectContext, setQuizSubjectContext] = useState("");
  const [quizNotesContext, setQuizNotesContext] = useState("");
  const [tutorTopicContext, setTutorTopicContext] = useState("");
  const [tutorSubjectContext, setTutorSubjectContext] = useState("");
  const [selectedExamIdContext, setSelectedExamIdContext] = useState<string>("");

  // Today study minutes logged
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(75);

  // Sync theme class to <html>
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("campusai_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    playClickBeep();
  };

  // Sync state mutations to storage
  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleUpdateSubjects = (updated: Subject[]) => {
    setSubjects(updated);
    saveStoredSubjects(updated);
  };

  const handleAddSubject = (newSubject: Subject) => {
    const updated = [...subjects, newSubject];
    handleUpdateSubjects(updated);
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    handleUpdateSubjects(updated);
  };

  const handleToggleTask = (taskId: string) => {
    playClickBeep();
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const handleAddTask = (taskData: Partial<StudyTask>) => {
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: taskData.title || "Study Session",
      subjectId: taskData.subjectId || subjects[0]?.id || "sub-1",
      subjectName: taskData.subjectName || subjects[0]?.name || "General",
      durationMinutes: taskData.durationMinutes || 30,
      priority: taskData.priority || "Medium",
      completed: false,
      date: taskData.date || new Date().toISOString().split("T")[0],
      notes: taskData.notes,
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const handleAddAssignment = (newAssignment: Assignment) => {
    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    saveStoredAssignments(updated);
  };

  const handleUpdateAssignment = (updatedAssignment: Assignment) => {
    const updated = assignments.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a));
    setAssignments(updated);
    saveStoredAssignments(updated);
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    saveStoredAssignments(updated);
  };

  const handleSaveNote = (newNote: NoteAnalysis) => {
    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    saveStoredNotes(updated);
  };

  const handleSaveQuizResult = (record: QuizResultRecord) => {
    const updated = [record, ...quizResults];
    setQuizResults(updated);
    saveStoredQuizResults(updated);

    // Update subject mastery score slightly based on performance
    const matchSub = subjects.find((s) => s.name === record.subject);
    if (matchSub) {
      const newMastery = Math.min(100, Math.max(30, Math.round((matchSub.masteryPercentage + record.percentage) / 2)));
      const updatedSubjects = subjects.map((s) => (s.id === matchSub.id ? { ...s, masteryPercentage: newMastery } : s));
      handleUpdateSubjects(updatedSubjects);
    }
  };

  const handleUpdateWeeklyPlan = (plan: DayPlan[]) => {
    setWeeklyPlan(plan);
    saveStoredWeeklyPlan(plan);
  };

  const handleLogStudySession = (minutes: number, subjectName: string) => {
    setTodayStudyMinutes((prev) => prev + minutes);
    const newLog: StudySessionLog = {
      id: `log-${Date.now()}`,
      subject: subjectName,
      durationMinutes: minutes,
      type: "Pomodoro",
      date: new Date().toISOString().split("T")[0],
    };
    const updatedLogs = [newLog, ...sessionLogs];
    setSessionLogs(updatedLogs);
    saveStoredSessionLogs(updatedLogs);

    // Increment overall total hours
    const updatedProfile = {
      ...profile,
      totalStudyHoursLogged: Number((profile.totalStudyHoursLogged + minutes / 60).toFixed(1)),
    };
    handleUpdateProfile(updatedProfile);
  };

  const handleResetData = () => {
    resetAllStorage();
    window.location.reload();
  };

  // Cross-Navigation Helpers
  const handleLaunchQuizFromTopic = (topic: string, subject: string) => {
    setQuizTopicContext(topic);
    setQuizSubjectContext(subject);
    setQuizNotesContext("");
    setActiveTab("quiz");
    playClickBeep();
  };

  const handleLaunchQuizFromNotes = (notesText: string, subject: string, topic: string) => {
    setQuizNotesContext(notesText);
    setQuizSubjectContext(subject);
    setQuizTopicContext(topic);
    setActiveTab("quiz");
    playClickBeep();
  };

  const handleLaunchMockExam = (subject: string, topic: string) => {
    setQuizTopicContext(`Exam Mock: ${topic}`);
    setQuizSubjectContext(subject);
    setQuizNotesContext("");
    setActiveTab("quiz");
    playClickBeep();
  };

  const handleSaveNoteFromTutor = (title: string, content: string, subject: string) => {
    const newNote: NoteAnalysis = {
      id: `note-${Date.now()}`,
      title,
      subject: subject || subjects[0]?.name || "General",
      rawText: content,
      summary: content.slice(0, 300) + "...",
      importantTopics: ["AI Tutor Session", subject],
      definitions: [],
      importantQuestions: [],
      revisionNotes: [content.slice(0, 150)],
      examQuestions: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    handleSaveNote(newNote);
  };

  const handleSelectSubjectAction = (subjectName: string, action: "tutor" | "quiz" | "notes") => {
    if (action === "tutor") {
      setTutorSubjectContext(subjectName);
      setTutorTopicContext("");
      setActiveTab("tutor");
    } else if (action === "quiz") {
      setQuizSubjectContext(subjectName);
      setActiveTab("quiz");
    } else if (action === "notes") {
      setActiveTab("notes");
    }
  };

  const handleLaunchTutorTopic = (topic: string, subject: string) => {
    setTutorSubjectContext(subject);
    setTutorTopicContext(`Explain ${topic} in detail with step-by-step concepts, formulas, and real-world examples.`);
    setActiveTab("tutor");
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const upcomingExamsCount = exams.length;

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      {/* 1. First-time Onboarding Modal */}
      {!profile.onboardingCompleted && (
        <OnboardingModal
          onComplete={(newProf, newSubs, createdExam) => {
            const mergedProfile: StudentProfile = {
              ...profile,
              ...newProf,
              onboardingCompleted: true,
            };
            handleUpdateProfile(mergedProfile);
            handleUpdateSubjects(newSubs);

            if (createdExam) {
              setExams([createdExam]);
              saveStoredExams([createdExam]);
            }
          }}
          onLoadPreset={(presetKey) => {
            const data = loadDemoDataset(presetKey);
            setProfile(data.profile);
            setSubjects(data.subjects);
            setTasks(data.tasks);
            setExams(data.exams);
            setAssignments(data.assignments);
            setQuizResults(data.quizResults);
          }}
        />
      )}

      {/* 2. Top Header Navigation Bar */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        todayStudyMinutes={todayStudyMinutes}
      />

      {/* 3. Main Body Structure: Sidebar + Active View Viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingTasksCount={pendingTasksCount}
          upcomingExamsCount={upcomingExamsCount}
          profile={profile}
        />

        {/* Dynamic Main Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "dashboard" && (
            <HomeDashboard
              profile={profile}
              subjects={subjects}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              assignments={assignments}
              exams={exams}
              quizResults={quizResults}
              setActiveTab={setActiveTab}
              onSelectExamForPrep={(examId) => {
                setSelectedExamIdContext(examId);
                setActiveTab("examprep");
              }}
              todayStudyMinutes={todayStudyMinutes}
              onLaunchQuizFromTopic={handleLaunchQuizFromTopic}
              onLaunchTutorTopic={handleLaunchTutorTopic}
            />
          )}

          {activeTab === "tutor" && (
            <AiTutor
              subjects={subjects}
              setActiveTab={setActiveTab}
              onLaunchQuizFromTopic={handleLaunchQuizFromTopic}
              onSaveNoteFromAI={handleSaveNoteFromTutor}
              profile={profile}
              initialSubject={tutorSubjectContext}
              initialPrompt={tutorTopicContext}
              exams={exams}
            />
          )}

          {activeTab === "notes" && (
            <NotesAnalyzer
              subjects={subjects}
              savedNotes={savedNotes}
              onSaveNote={handleSaveNote}
              setActiveTab={setActiveTab}
              onLaunchQuizFromNotes={handleLaunchQuizFromNotes}
            />
          )}

          {activeTab === "quiz" && (
            <QuizGenerator
              subjects={subjects}
              initialTopic={quizTopicContext}
              initialSubject={quizSubjectContext}
              initialNotesContext={quizNotesContext}
              onSaveQuizResult={handleSaveQuizResult}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "planner" && (
            <StudyPlanner
              subjects={subjects}
              exams={exams}
              weeklyPlan={weeklyPlan}
              onUpdateWeeklyPlan={handleUpdateWeeklyPlan}
              onAddTaskToDashboard={handleAddTask}
              setActiveTab={setActiveTab}
              dailyGoalHours={profile.dailyStudyGoalHours}
              profile={profile}
            />
          )}

          {activeTab === "assignments" && (
            <AssignmentHelper
              subjects={subjects}
              assignments={assignments}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}

          {activeTab === "examprep" && (
            <ExamPrepMode
              subjects={subjects}
              exams={exams}
              selectedExamId={selectedExamIdContext}
              onLaunchMockExam={handleLaunchMockExam}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "progress" && (
            <ProgressTracker
              profile={profile}
              subjects={subjects}
              quizResults={quizResults}
              sessionLogs={sessionLogs}
              setActiveTab={setActiveTab}
              todayStudyMinutes={todayStudyMinutes}
            />
          )}

          {activeTab === "tools" && (
            <QuickStudyTools
              subjects={subjects}
              onLogStudySession={handleLogStudySession}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "subjects" && (
            <SubjectManagement
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onUpdateSubject={(sub) => {
                const updated = subjects.map((s) => (s.id === sub.id ? sub : s));
                handleUpdateSubjects(updated);
              }}
              onDeleteSubject={handleDeleteSubject}
              setActiveTab={setActiveTab}
              onSelectSubjectAction={handleSelectSubjectAction}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              theme={theme}
              toggleTheme={toggleTheme}
              onResetData={handleResetData}
              onRestartOnboarding={() => {
                const resetOnboard = { ...profile, onboardingCompleted: false };
                handleUpdateProfile(resetOnboard);
              }}
            />
          )}
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation Bar & Modal Drawer */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
      />
    </div>
  );
}
