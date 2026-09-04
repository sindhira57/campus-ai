import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  BookmarkPlus,
  Lightbulb,
  GraduationCap,
  Trash2,
  AlertCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Subject, ChatMessage, NavigationTab, StudentProfile, Exam } from "../../types";
import { askAI, TutorInteractionMode } from "../../services/aiService";
import { playClickBeep } from "../../utils/sound";

interface AiTutorProps {
  subjects: Subject[];
  setActiveTab: (tab: NavigationTab) => void;
  onLaunchQuizFromTopic?: (topic: string, subject: string) => void;
  onSaveNoteFromAI?: (title: string, content: string, subject: string) => void;
  profile?: StudentProfile;
  initialSubject?: string;
  initialPrompt?: string;
  exams?: Exam[];
}

export const AiTutor: React.FC<AiTutorProps> = ({
  subjects,
  setActiveTab,
  onLaunchQuizFromTopic,
  onSaveNoteFromAI,
  profile,
  initialSubject,
  initialPrompt,
  exams = [],
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || subjects[0]?.name || ""
  );
  const [inputQuery, setInputQuery] = useState(initialPrompt || "");
  const [activeMode, setActiveMode] = useState<TutorInteractionMode>("general");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<{ query: string; mode: TutorInteractionMode } | null>(null);

  useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  useEffect(() => {
    if (initialPrompt) {
      setInputQuery(initialPrompt);
    }
  }, [initialPrompt]);

  const welcomeMessage: ChatMessage = {
    id: "m-welcome",
    sender: "assistant",
    text: `Hello! I'm your **CampusAI Academic Tutor** 👋

I'm personalized for your coursework in **${profile?.degree || profile?.major || "University Studies"}**${
      profile?.department ? ` (${profile.department})` : ""
    }.

Think of me as your dedicated study companion. We can have an ongoing conversation about any concept, problem, or exam question.

**Ways we can explore together:**
- 💡 **Understand Concepts**: Ask for deep explanations, simplified intuition (ELI5), or real-world analogies.
- 💻 **Practical Examples**: Walk through case studies, step-by-step logic, or code traces.
- 🎯 **Exam Preparation**: Get model high-scoring answers and key pitfalls.
- ✏️ **Active Practice**: Request university-level practice problems with guided Socratic hints.

*What would you like to work on right now?*`,
    timestamp: "Just now",
    mode: "general",
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Contextual quick actions that build upon the current topic
  const quickActions: { label: string; mode: TutorInteractionMode; prompt: string }[] = [
    {
      label: "Explain simpler",
      mode: "simple",
      prompt: "Could you explain that simpler with an intuitive everyday analogy?",
    },
    {
      label: "Give an example",
      mode: "example",
      prompt: "Could you provide a concrete, real-world example or walkthrough of what we just discussed?",
    },
    {
      label: "Give an analogy",
      mode: "analogy",
      prompt: "Can you give me an analogy to help me intuitively picture this concept?",
    },
    {
      label: "Explain step by step",
      mode: "step_by_step",
      prompt: "Can you break that down into clear, numbered step-by-step points?",
    },
    {
      label: "Quiz me",
      mode: "practice",
      prompt: "Give me an exam-level practice problem testing this concept without revealing the answer immediately.",
    },
    {
      label: "Give me a hint",
      mode: "hint",
      prompt: "Can you give me a progressive Socratic hint to help me think this through?",
    },
    {
      label: "Summarize",
      mode: "summary",
      prompt: "Can you summarize the most important takeaways, formulas, and definitions we just covered?",
    },
    {
      label: "What should I learn next?",
      mode: "next_step",
      prompt: "Based on what we just covered, what are the logical next 2-3 topics I should study?",
    },
  ];

  // Starter prompts when starting fresh
  const starterPrompts = [
    { label: "High-yield exam topics", query: `What are the highest-yield topics and scoring areas for ${selectedSubject || "my current courses"}?` },
    { label: "Step-by-step breakdown", query: `Walk me through a foundational concept in ${selectedSubject || "this course"} step by step.` },
    { label: "Practice problem", query: `Give me a medium-difficulty exam-level practice problem in ${selectedSubject || "this course"}.` },
    { label: "Intuitive analogy", query: `Explain a challenging mechanism in ${selectedSubject || "this course"} using an intuitive real-world analogy.` },
  ];

  const handleSend = async (
    queryText?: string,
    overrideMode?: TutorInteractionMode
  ) => {
    const query = (queryText !== undefined ? queryText : inputQuery).trim();
    if (!query || loading) return;

    const modeToUse = overrideMode || activeMode;
    const userMessageId = `usr-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      subject: selectedSubject,
      mode: modeToUse,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (queryText === undefined) setInputQuery("");
    setLoading(true);
    setLastFailedQuery(null);

    // Build chat history excluding welcome message and errors
    const historyPayload = messages
      .filter((m) => m.id !== "m-welcome" && !m.id.startsWith("err-"))
      .slice(-10)
      .map((m) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        text: m.text,
      }));

    // Academic Context
    const academicContext = {
      degree: profile?.degree || profile?.major,
      department: profile?.department,
      year: profile?.year,
      semester: profile?.semester,
      academicGoal: profile?.academicGoal,
      upcomingExams: exams.map((e) => ({
        subject: e.subjectName,
        date: e.examDate,
        priority: e.priority,
      })),
      weakTopics: profile?.weakTopics,
    };

    try {
      const response = await askAI({
        question: query,
        mode: modeToUse,
        subject: selectedSubject,
        studentProfile: profile,
        academicContext,
        history: historyPayload,
      });

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        subject: selectedSubject,
        mode: modeToUse,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("AI Tutor error:", err);
      const userMsg = err?.message || "The AI tutor is temporarily busy. Please try again in a moment.";
      setLastFailedQuery({ query, mode: modeToUse });

      const errorResponse: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: userMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (!lastFailedQuery) return;
    playClickBeep();
    // Remove the last error message from list before retrying
    setMessages((prev) => prev.filter((m) => !m.id.startsWith("err-")));
    handleSend(lastFailedQuery.query, lastFailedQuery.mode);
  };

  const handleClearConversation = () => {
    playClickBeep();
    if (window.confirm("Clear this tutoring conversation and start fresh?")) {
      setMessages([welcomeMessage]);
      setLastFailedQuery(null);
      setInputQuery("");
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNote = (id: string, text: string, subject: string) => {
    if (onSaveNoteFromAI) {
      const firstLine = text.split("\n")[0].replace(/[#*]/g, "").trim() || "AI Tutor Study Note";
      onSaveNoteFromAI(firstLine, text, subject || selectedSubject);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasNonWelcomeMessages = messages.some((m) => m.id !== "m-welcome");

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-5xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* 1. Tutor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/60 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs dark:bg-blue-500">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">CampusAI Academic Tutor</h1>
              {profile?.degree && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <GraduationCap className="h-3 w-3" />
                  {profile.degree}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Focus:</span>
              <div className="relative inline-block">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    playClickBeep();
                  }}
                  className="rounded-lg border border-zinc-300 bg-white py-0.5 pr-6 pl-2 text-xs font-semibold text-zinc-800 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="">General Academic Studies</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Conversation & Status */}
        <div className="flex items-center gap-2">
          {hasNonWelcomeMessages && (
            <button
              onClick={handleClearConversation}
              title="Clear conversation and start fresh"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isError = msg.id.startsWith("err-");

            if (isError) {
              return (
                <div key={msg.id} className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="flex-1 text-xs sm:text-sm">
                    <p className="font-semibold">{msg.text}</p>
                    {lastFailedQuery && (
                      <button
                        onClick={handleRetry}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Retry Question</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs dark:bg-blue-500">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[88%] rounded-2xl p-4 sm:p-5 shadow-xs transition ${
                    isUser
                      ? "bg-blue-600 text-white dark:bg-blue-600"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-100"
                  }`}
                >
                  {/* Subject and mode context badge */}
                  {!isUser && msg.subject && msg.id !== "m-welcome" && (
                    <div className="mb-2.5 flex items-center justify-between border-b border-zinc-200/80 pb-2 text-[11px] font-semibold text-zinc-500 dark:border-zinc-700/80 dark:text-zinc-400">
                      <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                        <BookOpen className="h-3 w-3" />
                        {msg.subject}
                      </span>
                      {msg.mode && msg.mode !== "general" && (
                        <span className="capitalize text-zinc-600 dark:text-zinc-300 font-medium">
                          {msg.mode.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {msg.text}
                  </div>

                  {/* Tutor response actions */}
                  {!isUser && msg.id !== "m-welcome" && (
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200/80 pt-2.5 dark:border-zinc-700/80">
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {msg.timestamp}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="Copy response"
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>

                        {onSaveNoteFromAI && (
                          <button
                            onClick={() => handleSaveNote(msg.id, msg.text, msg.subject || selectedSubject)}
                            title="Save as Study Note"
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                          >
                            {savedId === msg.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Saved</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-[11px]">Save Note</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-white shadow-xs dark:bg-zinc-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing / Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs dark:bg-blue-500 animate-pulse">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping dark:bg-blue-400" />
                  <span>CampusAI is formulating an academic breakdown...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Contextual Quick Actions (Horizontal scrollable chips) */}
      <div className="border-t border-zinc-200 bg-zinc-50/70 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Quick actions:
            </span>
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => {
                  playClickBeep();
                  handleSend(action.prompt, action.mode);
                }}
                className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/70 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/40"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Message Input Bar */}
      <div className="border-t border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask a question or request a walkthrough in ${selectedSubject || "your coursework"} (Enter to send, Shift+Enter for new line)...`}
              className="w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50/70 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:bg-zinc-900"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            title="Send message (Enter)"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
