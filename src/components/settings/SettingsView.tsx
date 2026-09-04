import React, { useState } from "react";
import {
  Settings,
  User,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  GraduationCap,
} from "lucide-react";
import { StudentProfile } from "../../types";
import { playClickBeep } from "../../utils/sound";

interface SettingsViewProps {
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  onResetData: () => void;
  onRestartOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  theme,
  toggleTheme,
  onResetData,
  onRestartOnboarding,
}) => {
  const [name, setName] = useState(profile.name);
  const [major, setMajor] = useState(profile.major);
  const [year, setYear] = useState(profile.year);
  const [dailyHours, setDailyHours] = useState(profile.dailyStudyGoalHours);
  const [targetGpa, setTargetGpa] = useState(profile.targetGpa);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      major,
      year,
      dailyStudyGoalHours: Number(dailyHours),
      targetGpa,
    });
    setSavedSuccess(true);
    playClickBeep();
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      profile,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campusai-study-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Settings className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Student Profile & Platform Preferences
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Customize your academic goals, display themes, study capacity, and local data persistence.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Student Academic Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Full Name / Preferred Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              College Major / Degree Course
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Academic Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="1st Year / Freshman">1st Year (Freshman)</option>
              <option value="2nd Year / Sophomore">2nd Year (Sophomore)</option>
              <option value="3rd Year / Junior">3rd Year (Junior)</option>
              <option value="4th Year / Senior">4th Year (Senior)</option>
              <option value="Graduate / Master's">Graduate / Master's</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Target Cumulative GPA
            </label>
            <input
              type="text"
              value={targetGpa}
              onChange={(e) => setTargetGpa(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Daily Capacity Slider */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>Daily Study Target Goal</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {dailyHours} Hours/day
            </span>
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

        <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500"
          >
            {savedSuccess ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            <span>{savedSuccess ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>
      </form>

      {/* Preferences & Reset */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Appearance & Data Management
        </h3>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Dark Mode toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Display Theme</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Switch between high-contrast light and eye-safe dark mode
              </p>
            </div>
            <div
              role="group"
              aria-label="Display Theme"
              className="flex items-center rounded-xl border border-zinc-300/80 bg-zinc-100 p-1 shadow-2xs dark:border-zinc-700/70 dark:bg-zinc-800/80"
            >
              <button
                type="button"
                id="settings-theme-light"
                onClick={() => {
                  if (theme !== "light") toggleTheme();
                }}
                aria-pressed={theme === "light"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  theme === "light"
                    ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200/80 dark:bg-zinc-700 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Sun className={`h-3.5 w-3.5 ${theme === "light" ? "text-amber-500 fill-amber-400/30" : "text-zinc-500"}`} />
                <span>Light</span>
              </button>

              <button
                type="button"
                id="settings-theme-dark"
                onClick={() => {
                  if (theme !== "dark") toggleTheme();
                }}
                aria-pressed={theme === "dark"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  theme === "dark"
                    ? "bg-zinc-900 text-zinc-50 shadow-xs ring-1 ring-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Moon className={`h-3.5 w-3.5 ${theme === "dark" ? "text-blue-400 fill-blue-400/20" : "text-zinc-500"}`} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Export JSON */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Export Study Data</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Download your notes, quizzes, and study schedule as a JSON backup
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Restart Tour */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Onboarding Setup</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Re-run the welcome setup flow to reconfigure courses and goals
              </p>
            </div>
            <button
              onClick={onRestartOnboarding}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Restart Tour</span>
            </button>
          </div>

          {/* Reset All Data */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Reset Local Records</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Restore all study tasks, subjects, and sample metrics to default state
              </p>
            </div>
            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
