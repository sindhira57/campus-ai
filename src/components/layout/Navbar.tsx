import React from "react";
import {
  BookOpen,
  Sparkles,
  Flame,
  Clock,
  Sun,
  Moon,
  Menu,
  GraduationCap,
  Bell,
} from "lucide-react";
import { StudentProfile, NavigationTab } from "../../types";

interface NavbarProps {
  profile: StudentProfile;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  toggleMobileMenu: () => void;
  todayStudyMinutes: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  toggleMobileMenu,
  todayStudyMinutes,
}) => {
  const hours = (todayStudyMinutes / 60).toFixed(1);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          id="brand-home-btn"
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 text-left transition focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20 dark:bg-blue-500">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                CampusAI
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                PRO
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-zinc-500 dark:text-zinc-400 sm:block">
              Study smarter. Stay organized.
            </p>
          </div>
        </button>
      </div>

      {/* Middle: Quick Action pill */}
      <div className="hidden items-center gap-2 md:flex">
        <button
          id="nav-quick-ask-ai"
          onClick={() => setActiveTab("tutor")}
          className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100/80 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask AI Tutor</span>
          <kbd className="ml-1 rounded bg-blue-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            AI
          </kbd>
        </button>
      </div>

      {/* Right: Metrics & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak pill */}
        <div
          title={`${profile.streakDays} day study streak!`}
          className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
        >
          <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{profile.streakDays}d</span>
        </div>

        {/* Today's study time */}
        <div
          title={`Today: ${hours}h / ${profile.dailyStudyGoalHours}h target`}
          className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 sm:flex"
        >
          <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{hours}h</span>
        </div>

        {/* Dark/Light mode toggle */}
        <div
          id="theme-toggle-btn"
          role="group"
          aria-label="Theme switcher"
          className="flex items-center rounded-xl border border-zinc-300/80 bg-zinc-100 p-1 shadow-2xs dark:border-zinc-700/70 dark:bg-zinc-800/80"
        >
          <button
            type="button"
            id="theme-toggle-light"
            onClick={() => {
              if (theme !== "light") toggleTheme();
            }}
            aria-pressed={theme === "light"}
            title="Switch to Light Mode"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
              theme === "light"
                ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200/80 dark:bg-zinc-700 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Sun className={`h-3.5 w-3.5 ${theme === "light" ? "text-amber-500 fill-amber-400/30" : "text-zinc-500"}`} />
            <span className="hidden sm:inline">Light</span>
          </button>

          <button
            type="button"
            id="theme-toggle-dark"
            onClick={() => {
              if (theme !== "dark") toggleTheme();
            }}
            aria-pressed={theme === "dark"}
            title="Switch to Dark Mode"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
              theme === "dark"
                ? "bg-zinc-900 text-zinc-50 shadow-xs ring-1 ring-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Moon className={`h-3.5 w-3.5 ${theme === "dark" ? "text-blue-400 fill-blue-400/20" : "text-zinc-500"}`} />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* Profile Avatar Pill */}
        <button
          id="nav-profile-btn"
          onClick={() => setActiveTab("settings")}
          className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 pr-3 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
            {profile.name.charAt(0) || "S"}
          </div>
          <span className="hidden text-xs font-medium text-zinc-700 dark:text-zinc-300 md:inline-block max-w-[100px] truncate">
            {profile.name.split(" ")[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
