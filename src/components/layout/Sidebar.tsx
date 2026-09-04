import React from "react";
import {
  LayoutDashboard,
  Bot,
  FileText,
  HelpCircle,
  Calendar,
  ClipboardList,
  Target,
  BarChart3,
  Wrench,
  BookMarked,
  Settings,
  Sparkles,
} from "lucide-react";
import { NavigationTab, StudentProfile } from "../../types";

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  pendingTasksCount: number;
  upcomingExamsCount: number;
  profile: StudentProfile;
}

interface NavSection {
  title?: string;
  items: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingTasksCount,
  upcomingExamsCount,
  profile,
}) => {
  const sections: NavSection[] = [
    {
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "LEARNING",
      items: [
        { id: "tutor", label: "AI Tutor", icon: Bot, badge: "AI", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
        { id: "notes", label: "Notes Analyzer", icon: FileText },
        { id: "quiz", label: "Quiz Generator", icon: HelpCircle },
      ],
    },
    {
      title: "PLANNING",
      items: [
        {
          id: "planner",
          label: "Study Planner",
          icon: Calendar,
          badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
          badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        },
        { id: "assignments", label: "Assignments", icon: ClipboardList },
        {
          id: "examprep",
          label: "Exam Prep",
          icon: Target,
          badge: upcomingExamsCount > 0 ? `${upcomingExamsCount} soon` : undefined,
          badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
        },
      ],
    },
    {
      title: "PROGRESS & TOOLS",
      items: [
        { id: "progress", label: "Progress Tracker", icon: BarChart3 },
        { id: "tools", label: "Quick Tools", icon: Wrench },
      ],
    },
    {
      title: "MANAGE",
      items: [
        { id: "subjects", label: "My Subjects", icon: BookMarked },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-zinc-200/80 bg-white p-4 transition-colors dark:border-zinc-800/80 dark:bg-[#111827] md:flex">
      {/* Navigation sections */}
      <nav className="space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <div className="px-3 pb-1.5 text-[11px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs font-semibold dark:bg-blue-600 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? "text-white" : "text-zinc-400 dark:text-zinc-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeColor || "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Mini AI Study Goal banner */}
      <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Daily Goal: {profile.dailyStudyGoalHours}h</span>
          </div>
          <span className="rounded-full bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Active
          </span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {profile.streakDays >= 3
            ? `🔥 ${profile.streakDays}-day streak active. Keep up the momentum!`
            : "🎯 Complete study goals today to build your streak!"}
        </p>
        <button
          id="sidebar-start-pomodoro"
          onClick={() => setActiveTab("tools")}
          className="mt-3 block w-full rounded-xl bg-blue-600 py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Study Tools
        </button>
      </div>
    </aside>
  );
};
