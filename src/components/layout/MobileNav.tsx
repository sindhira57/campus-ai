import React from "react";
import {
  LayoutDashboard,
  Bot,
  HelpCircle,
  Calendar,
  MoreHorizontal,
  X,
  FileText,
  ClipboardList,
  Target,
  BarChart3,
  Wrench,
  BookMarked,
  Settings,
} from "lucide-react";
import { NavigationTab } from "../../types";

interface MobileNavProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const primaryTabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "tutor", label: "AI Tutor", icon: Bot },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
    { id: "planner", label: "Planner", icon: Calendar },
  ];

  const allTabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tutor", label: "AI Tutor & Explainer", icon: Bot },
    { id: "notes", label: "Notes Analyzer", icon: FileText },
    { id: "quiz", label: "Quiz Generator", icon: HelpCircle },
    { id: "planner", label: "Study Planner", icon: Calendar },
    { id: "assignments", label: "Assignment Helper", icon: ClipboardList },
    { id: "examprep", label: "Exam Preparation Mode", icon: Target },
    { id: "progress", label: "Progress & Metrics", icon: BarChart3 },
    { id: "tools", label: "Pomodoro & Quick Tools", icon: Wrench },
    { id: "subjects", label: "My Subjects", icon: BookMarked },
    { id: "settings", label: "Settings & Profile", icon: Settings },
  ];

  return (
    <>
      {/* Bottom bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/95 px-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-bottom-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                setIsOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* More drawer toggle */}
        <button
          id="mobile-bottom-more"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition ${
            isOpen
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-medium">All Tools</span>
        </button>
      </div>

      {/* Full screen Drawer menu for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/80 backdrop-blur-sm md:hidden">
          <div className="mt-auto max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">CampusAI Features</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">All tools & learning modules</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 py-3">
              <div>
                <div className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Learning
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "tutor", label: "AI Tutor", icon: Bot },
                    { id: "notes", label: "Notes Analyzer", icon: FileText },
                    { id: "quiz", label: "Quiz Generator", icon: HelpCircle },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`mobile-drawer-${tab.id}`}
                        onClick={() => {
                          setActiveTab(tab.id as NavigationTab);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                          isActive
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500"}`} />
                        <span className="text-xs font-semibold leading-tight line-clamp-1">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Planning
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "planner", label: "Study Planner", icon: Calendar },
                    { id: "assignments", label: "Assignments", icon: ClipboardList },
                    { id: "examprep", label: "Exam Prep", icon: Target },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`mobile-drawer-${tab.id}`}
                        onClick={() => {
                          setActiveTab(tab.id as NavigationTab);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                          isActive
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500"}`} />
                        <span className="text-xs font-semibold leading-tight line-clamp-1">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Progress & Management
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "progress", label: "Progress", icon: BarChart3 },
                    { id: "tools", label: "Quick Tools", icon: Wrench },
                    { id: "subjects", label: "My Subjects", icon: BookMarked },
                    { id: "settings", label: "Settings", icon: Settings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`mobile-drawer-${tab.id}`}
                        onClick={() => {
                          setActiveTab(tab.id as NavigationTab);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                          isActive
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500"}`} />
                        <span className="text-xs font-semibold leading-tight line-clamp-1">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
