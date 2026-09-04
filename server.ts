import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Handle invalid JSON body syntax errors gracefully with application/json
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  next(err);
});

// Enforce application/json and prevent browser caching for all /api endpoints
app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  next();
});

// Lazy initialize Gemini client with telemetry User-Agent
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

interface ClassifiedError {
  statusCode: number;
  userMessage: string;
  isTransient: boolean;
}

// Error classifier: categorizes errors into clear, friendly messages according to requirements
function classifyGeminiError(error: any): ClassifiedError {
  const status = error?.status || error?.statusCode || error?.response?.status;
  const message = (error?.message || "").toLowerCase();
  const errorDetails = typeof error === "object" ? JSON.stringify(error).toLowerCase() : "";

  // 1. Missing or invalid API key / Authentication error
  if (
    message.includes("gemini_api_key_missing") ||
    status === 401 ||
    status === 403 ||
    message.includes("api key not valid") ||
    message.includes("api_key_invalid") ||
    message.includes("invalid api key") ||
    message.includes("unauthenticated") ||
    message.includes("permission_denied") ||
    errorDetails.includes("api_key_invalid")
  ) {
    return {
      statusCode: 401,
      userMessage: "Gemini API configuration is missing or invalid.",
      isTransient: false,
    };
  }

  // 2. Quota / Billing / Rate Limit error (429 / RESOURCE_EXHAUSTED)
  if (
    status === 429 ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("billing") ||
    message.includes("exceeded your current quota") ||
    errorDetails.includes("resource_exhausted")
  ) {
    return {
      statusCode: 429,
      userMessage: "The AI usage limit has been reached. Please try again later.",
      isTransient: false, // Do not repeatedly retry when quota is exceeded
    };
  }

  // 3. Temporary Server Error (503 / UNAVAILABLE / Overloaded)
  if (
    status === 503 ||
    status === 500 ||
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("temporarily unavailable") ||
    message.includes("high demand") ||
    message.includes("deadline exceeded")
  ) {
    return {
      statusCode: 503,
      userMessage: "The AI tutor is temporarily busy. Please try again in a moment.",
      isTransient: true, // Only retry temporary server errors
    };
  }

  return {
    statusCode: 500,
    userMessage: "An error occurred while processing your academic request. Please try again.",
    isTransient: false,
  };
}

// Supported Gemini models for text and reasoning in order of preference
// When gemini-3.8-flash hits temporary 503 (high demand) or 429 (quota rate-limit),
// gemini-3.1-flash-lite provides a high-speed, reliable fallback without downtime.
const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

const modelCooldowns = new Map<string, number>();

function isModelCoolingDown(model: string): boolean {
  const expiry = modelCooldowns.get(model);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    modelCooldowns.delete(model);
    return false;
  }
  return true;
}

function markModelCooldown(model: string, durationMs = 60000) {
  modelCooldowns.set(model, Date.now() + durationMs);
  console.warn(`[GeminiModelManager] Model ${model} marked cooling down for ${Math.round(durationMs / 1000)}s`);
}

function getCandidateModels(): string[] {
  const available = CANDIDATE_MODELS.filter((m) => !isModelCoolingDown(m));
  const cooling = CANDIDATE_MODELS.filter((m) => isModelCoolingDown(m));
  return [...available, ...cooling];
}

// Utility: Call Gemini with resilient multi-model fallback and retry handling
async function callGeminiWithRetry<T>(
  actionName: string,
  fn: (ai: GoogleGenAI, modelName: string) => Promise<T>
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error(`[${actionName}] Gemini API key is missing from environment.`);
    const err = new Error("GEMINI_API_KEY_MISSING");
    (err as any).status = 401;
    throw err;
  }

  const ai = getAI();
  if (!ai) {
    console.error(`[${actionName}] Failed to initialize GoogleGenAI client.`);
    const err = new Error("GEMINI_API_KEY_MISSING");
    (err as any).status = 401;
    throw err;
  }

  const models = getCandidateModels();
  let lastError: any = null;

  for (let mIdx = 0; mIdx < models.length; mIdx++) {
    const model = models[mIdx];
    const isLastModel = mIdx === models.length - 1;
    const maxAttempts = isLastModel ? 2 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(ai, model);
      } catch (error: any) {
        lastError = error;
        const classified = classifyGeminiError(error);
        const safeErrorMessage = (error?.message || "Unknown error").replace(/key=[A-Za-z0-9_\-]+/gi, "key=[REDACTED]");

        console.error(
          `[${actionName}] Model ${model} attempt ${attempt}/${maxAttempts} failed (${error?.status || classified.statusCode}): ${safeErrorMessage}`
        );

        // 503 (high demand / overloaded) or 429 (quota / rate limit on this model)
        if (classified.statusCode === 503 || classified.statusCode === 429) {
          let cooldownMs = 60000;
          if (typeof error?.message === "string") {
            const match = error.message.match(/retry in\s+([\d\.]+)s/i);
            if (match) {
              cooldownMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
            }
          }
          markModelCooldown(model, cooldownMs);

          // If another candidate model is available, fallback immediately
          if (!isLastModel) {
            console.warn(`[${actionName}] 503/429 on ${model}. Immediately falling back to ${models[mIdx + 1]}...`);
            break;
          }
        }

        // If transient error on the last model, retry once after a short delay
        if (attempt < maxAttempts && classified.isTransient) {
          const backoffMs = 1200;
          console.warn(`[${actionName}] Transient error on ${model}. Retrying in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        break;
      }
    }
  }

  throw lastError;
}

// Route error handler that returns clean user-facing errors
function handleRouteError(res: express.Response, actionName: string, error: any) {
  const classified = classifyGeminiError(error);
  const safeErrorMessage = (error?.message || "Unknown error").replace(/key=[A-Za-z0-9_\-]+/gi, "key=[REDACTED]");
  console.error(`[${actionName}] Handler caught error:`, {
    status: error?.status || classified.statusCode,
    message: safeErrorMessage,
  });

  return res.status(classified.statusCode).json({
    error: classified.userMessage,
  });
}

// Cleanly parse JSON from model responses, stripping markdown code blocks if necessary
function parseJSONFromText(text: string): any {
  if (!text || text.trim() === "") return {};
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  } else {
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (_err) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch (_) {}
    }
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
      } catch (_) {}
    }
    console.error("Failed to parse JSON from model output:", text.slice(0, 300));
    throw new Error("Failed to parse structured response from AI model.");
  }
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

// 2. AI Tutor & Concept Explainer with Student Personalization & Conversational Memory
app.post("/api/ai/ask", async (req, res) => {
  try {
    const {
      question,
      mode = "general",
      subject = "",
      context = "",
      studentProfile,
      academicContext,
      history = [],
    } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }

    const degree = studentProfile?.degree || studentProfile?.major || "Undergraduate Studies";
    const department = studentProfile?.department || "Academic Department";
    const year = studentProfile?.year || "Current Year";
    const semester = studentProfile?.semester || "Current Semester";
    const academicGoal = studentProfile?.academicGoal || "Academic Excellence";
    const studyStyle = studentProfile?.preferredStudyStyle || "step-by-step";
    const weakTopics = Array.isArray(studentProfile?.weakTopics) ? studentProfile.weakTopics.join(", ") : "";

    let instruction = `You are CampusAI, a world-class, patient, natural, and intellectually rigorous academic tutor dedicated to university students.
You are conversing with a student enrolled in:
- Degree / Program: ${degree}
- Department: ${department}
- Academic Level: ${year} (${semester})
- Academic Goal: ${academicGoal}
- Learning Style: ${studyStyle}
- Active Course / Subject: ${subject || "General Academic Studies"}
${weakTopics ? `- Identified Weak Areas: ${weakTopics}` : ""}

Core Tutoring & Conversational Principles:
1. CONVERSATIONAL CONTINUITY & PRONOUN RESOLUTION:
   - You have memory of this ongoing tutoring conversation. Understand what pronouns and references ('this', 'that', 'why is it O(log n)?', 'give me a problem', 'what does this mean?') refer to from previous turns.
   - When the student says "I don't understand", "I'm still confused", or "I got it wrong", DO NOT repeat the exact same explanation. Instead:
     * Simplify the concept down to fundamental intuition or first principles.
     * Use a fresh everyday analogy or visual metaphor.
     * Break the concept into bite-sized components.
     * Ask a friendly, focused check question to isolate what part they are stuck on.

2. TEACHING METHODOLOGY:
   - Understand the student's question and meet them at their current academic level.
   - Explain clearly with structured markdown when helpful (bold terms, bullet points, concise code or mathematical notation).
   - Provide concrete, relevant examples or analogies grounded in their field of study.
   - Ask a short, motivating check-for-understanding question or give a quick practice problem.
   - When the student attempts an answer, evaluate constructively: praise their reasoning, pinpoint errors with care, and guide them to the solution.

3. DISCIPLINE & SUBJECT ADAPTATION:
   - Adapt your vocabulary, examples, and mental models to their specific field:
     * AI & Computer Science: algorithms, computational complexity, memory layout, code traces.
     * Commerce & Business (B.Com): ledger entries, balance sheet equations, market equilibrium, legal precedents.
     * Physical Sciences & Engineering: force diagrams, energy conservation, differential equations, experimental models.
     * Health & Biological Sciences: physiological mechanisms, cellular pathways, genetic regulation.

4. VOICE & ACADEMIC INTEGRITY:
   - Be patient, encouraging, academically accurate, friendly, and professional.
   - Be concise when the question is simple; be thorough and structured when the topic is conceptually difficult.
   - Avoid generic chatbot filler like repeatedly exclaiming "Great question!" on every message.
   - Keep emojis restrained (0-2 max).
   - Help the student learn and reason through the problem; do not just output entire homework assignments blindly without pedagogical guidance.
   - If a student query is ambiguous, ask a brief clarifying question before guessing.`;

    if (mode === "simple") {
      instruction += `\nMode: ELI5 / Simplified Explanation. Explain this concept as simply as possible to a beginner, using intuitive real-world analogies and zero unnecessary jargon.`;
    } else if (mode === "example") {
      instruction += `\nMode: Real-World Example & Walkthrough. Focus deeply on concrete, practical, domain-specific examples, case studies, or step-by-step code/problem implementations.`;
    } else if (mode === "analogy") {
      instruction += `\nMode: Intuitive Analogy. Demystify this concept using a creative, memorable real-life analogy that makes the mechanism click immediately.`;
    } else if (mode === "step_by_step") {
      instruction += `\nMode: Step-by-Step Breakdown. Walk through this topic methodically in numbered sequential steps, explaining the 'why' behind each step.`;
    } else if (mode === "exam") {
      instruction += `\nMode: High-Scoring University Exam Model Answer. Structure your response for maximum marks: Definition, Core Theorem/Mechanism, Key Equations/Diagrams, Step-by-Step Explanation, and Common Pitfalls/Examiner Tips.`;
    } else if (mode === "summary") {
      instruction += `\nMode: Flash Revision Notes. Provide high-yield bullet points, core definitions, formulas, and memory aids for rapid review.`;
    } else if (mode === "practice") {
      instruction += `\nMode: Interactive Practice Problem. Present ONE realistic, exam-level practice problem testing this concept. Do NOT reveal the solution immediately; invite the student to attempt it or ask for a hint!`;
    } else if (mode === "hint") {
      instruction += `\nMode: Socratic Hint. Provide an insightful, progressive hint that steers the student towards the solution of their current problem without revealing the final answer.`;
    } else if (mode === "next_step") {
      instruction += `\nMode: Strategic Study Roadmap. Recommend the exact next 2-3 logical subtopics or problem types the student should study next in ${subject || "this course"}, with a brief reason for each.`;
    }

    if (academicContext?.upcomingExams?.length > 0) {
      instruction += `\nUpcoming Exams Context: ${JSON.stringify(academicContext.upcomingExams)}`;
    }
    if (context) {
      instruction += `\nAdditional Context / Reference Notes: ${context}`;
    }

    // Build chat contents including conversation history if provided
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      // Include last 10 turns for robust conversational context
      const recentHistory = history.slice(-10);
      for (const h of recentHistory) {
        const textVal = h.text || h.content || "";
        if (textVal && typeof textVal === "string" && textVal.trim()) {
          const roleVal = h.role === "assistant" || h.role === "model" ? "model" : "user";
          contents.push({
            role: roleVal,
            parts: [{ text: textVal.trim() }],
          });
        }
      }
    }
    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: question.trim() }],
    });

    const textResult = await callGeminiWithRetry("AITutor", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: instruction,
          temperature: 0.65,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      return response.text || "No response received from AI model.";
    });

    res.json({ text: textResult, mode });
  } catch (error: any) {
    return handleRouteError(res, "AITutor", error);
  }
});

// 3. Notes Analyzer
app.post("/api/ai/analyze-notes", async (req, res) => {
  try {
    const { content, subject = "" } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Study notes content is required" });
    }

    const prompt = `Analyze the following student notes/study material for the subject "${subject}". Extract key academic insights into a structured JSON response.

Content:
${content.slice(0, 15000)}`;

    const result = await callGeminiWithRetry("AnalyzeNotes", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert college academic summarizer. Extract structured, digestible, exam-focused study cards from student notes. Do not output rambling text. Output pure JSON matching the schema.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A concise 2-3 sentence overview of the document's main focus." },
              importantTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 3 to 6 major topics/sub-modules covered."
              },
              definitions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                  },
                  required: ["term", "definition"]
                },
                description: "Key vocabulary terms, formulas, or definitions with clear explanations."
              },
              importantQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key conceptual questions every student should be able to answer after reading."
              },
              revisionNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Quick bullet points for 5-minute pre-exam revision."
              },
              examQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Potential university exam questions (short and long answer style)."
              }
            },
            required: ["summary", "importantTopics", "definitions", "importantQuestions", "revisionNotes", "examQuestions"]
          }
        }
      });

      return parseJSONFromText(response.text || "{}");
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "AnalyzeNotes", error);
  }
});

// 4. Quiz Generator
app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { subject, topic, difficulty = "Medium", count = 5, notesContext = "" } = req.body;
    const numQuestions = Math.min(Math.max(Number(count) || 5, 3), 15);

    const prompt = notesContext
      ? `Generate a ${numQuestions}-question multiple choice quiz (${difficulty} difficulty) based EXCLUSIVELY on this provided study material:
Notes:
${notesContext.slice(0, 10000)}`
      : `Generate a ${numQuestions}-question multiple choice college quiz for subject "${subject || "General"}", topic "${topic || "Core Curriculum"}", difficulty level "${difficulty}". Ensure questions test deep understanding, not just trivial trivia. Provide realistic distractors and insightful explanations.`;

    const result = await callGeminiWithRetry("QuizGenerator", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are a university exam creator. Generate high quality multiple-choice questions with 4 distinct options, the 0-based index of the correct answer, a detailed explanation of why the answer is correct and why other options are wrong, and the specific subtopic tested.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 multiple choice options."
                    },
                    correctAnswerIndex: {
                      type: Type.INTEGER,
                      description: "The 0-based index (0, 1, 2, or 3) of the correct option."
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Clear explanation of the correct answer and common pitfalls."
                    },
                    topic: { type: Type.STRING }
                  },
                  required: ["id", "question", "options", "correctAnswerIndex", "explanation", "topic"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      return parseJSONFromText(response.text || '{"questions":[]}');
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "QuizGenerator", error);
  }
});

// 5. Study Planner Generator
app.post("/api/ai/study-plan", async (req, res) => {
  try {
    const {
      subjects,
      examDates,
      dailyHours = 3,
      topicsToCover = "",
      priority = "High",
      degree = "",
      semester = "",
    } = req.body;

    const prompt = `Create a realistic, week-long college study plan.
${degree ? `Student Program: ${degree} (${semester || "Current Semester"})` : ""}
Subjects: ${Array.isArray(subjects) ? subjects.join(", ") : (subjects || "General Coursework")}
Exam Dates: ${JSON.stringify(examDates || {})}
Daily Available Study Hours: ${dailyHours} hours/day
Topics to Cover: ${topicsToCover || "Current syllabus modules"}
Student Priority Level: ${priority || "High"}`;

    const result = await callGeminiWithRetry("StudyPlanner", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are a university academic advisor creating realistic, balanced, actionable weekly study schedules that prevent burnout. Break days into specific manageable sessions with realistic time allocations.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: { type: Type.STRING, description: "e.g. Monday, Tuesday..." },
                    focus: { type: Type.STRING, description: "Theme or focus of the day" },
                    totalHours: { type: Type.NUMBER },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          durationMinutes: { type: Type.INTEGER },
                          subject: { type: Type.STRING },
                          priority: { type: Type.STRING, description: "High, Medium, or Low" },
                          completed: { type: Type.BOOLEAN }
                        },
                        required: ["id", "title", "durationMinutes", "subject", "priority", "completed"]
                      }
                    }
                  },
                  required: ["dayName", "focus", "totalHours", "tasks"]
                }
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "days", "tips"]
          }
        }
      });

      return parseJSONFromText(response.text || "{}");
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "StudyPlanner", error);
  }
});

// 6. Assignment Helper
app.post("/api/ai/assignment-help", async (req, res) => {
  try {
    const { subject, title, deadline, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Assignment title and description are required" });
    }

    const prompt = `Analyze this college assignment for subject "${subject || "General"}".
Assignment Title: ${title}
Deadline: ${deadline || "Upcoming"}
Description/Prompt:
${description}

CRITICAL: Do NOT write the assignment for the student to submit. Instead, provide high-value academic guidance: clear understanding, breakdown of milestones, structural outline, explanation of tricky concepts, research strategy, and a ready checklist.`;

    const result = await callGeminiWithRetry("AssignmentHelp", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are a university academic coach who helps students deconstruct complex assignments, plan their workflow, and master challenging concepts with academic integrity.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              understanding: { type: Type.STRING, description: "Clear explanation of what the assignment is asking for and grading expectations." },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["stepNumber", "title", "description"]
                }
              },
              outline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    section: { type: Type.STRING },
                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["section", "keyPoints"]
                }
              },
              difficultConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["concept", "explanation"]
                }
              },
              researchApproach: { type: Type.STRING },
              checklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    task: { type: Type.STRING },
                    completed: { type: Type.BOOLEAN }
                  },
                  required: ["id", "task", "completed"]
                }
              }
            },
            required: ["understanding", "steps", "outline", "difficultConcepts", "researchApproach", "checklist"]
          }
        }
      });

      return parseJSONFromText(response.text || "{}");
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "AssignmentHelp", error);
  }
});

// 7. Exam Preparation Mode
app.post("/api/ai/exam-prep", async (req, res) => {
  try {
    const { subject, examDate, topics } = req.body;
    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }

    const prompt = `Create an intensive, high-yield college Exam Preparation Master Plan.
Subject: ${subject}
Exam Date: ${examDate || "Upcoming"}
Topics / Syllabus: ${Array.isArray(topics) ? topics.join(", ") : (topics || "Standard College Curriculum")}`;

    const result = await callGeminiWithRetry("ExamPrep", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are a top university exam strategist and tutor. Provide ultra-practical exam prep strategies, high-yield priority topic rankings, revision phases, and practice questions with model scoring criteria.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priorityTopics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    weight: { type: Type.STRING, description: "High, Medium, or Low" },
                    estimatedQuestions: { type: Type.STRING, description: "e.g. 30-40%" },
                    strategy: { type: Type.STRING }
                  },
                  required: ["topic", "weight", "estimatedQuestions", "strategy"]
                }
              },
              revisionSchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    hoursRecommended: { type: Type.NUMBER }
                  },
                  required: ["phase", "focus", "hoursRecommended"]
                }
              },
              importantConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING }
                  },
                  required: ["title", "summary"]
                }
              },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answerGuide: { type: Type.STRING }
                  },
                  required: ["question", "answerGuide"]
                }
              },
              quickRevisionNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["priorityTopics", "revisionSchedule", "importantConcepts", "practiceQuestions", "quickRevisionNotes"]
          }
        }
      });

      return parseJSONFromText(response.text || "{}");
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "ExamPrep", error);
  }
});

// 8. Quick Tools (Flashcards & Formula Sheet)
app.post("/api/ai/flashcards", async (req, res) => {
  try {
    const { subject, topic, count = 6 } = req.body;
    const prompt = `Generate ${count} high-yield, active recall flashcards for college subject "${subject || "General"}", topic "${topic || "Key Concepts"}". Front should be a focused question, prompt, or scenario; Back should be a concise, precise, easy-to-memorize answer.`;

    const result = await callGeminiWithRetry("Flashcards", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are an active recall flashcard expert for university students. Create high retention question-answer pairs in JSON.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["id", "front", "back"]
                }
              }
            },
            required: ["flashcards"]
          }
        }
      });

      return parseJSONFromText(response.text || '{"flashcards":[]}');
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "Flashcards", error);
  }
});

app.post("/api/ai/formula-sheet", async (req, res) => {
  try {
    const { subject, topic } = req.body;
    const prompt = `Generate a high-density, accurate, beautifully organized formula sheet / cheat sheet for college subject "${subject || "STEM"}", topic "${topic || "Key Equations"}". Include exact mathematical notations/formulas, definitions of variables, and memory aids/mnemonics.`;

    const result = await callGeminiWithRetry("FormulaSheet", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are a university STEM professor creating concise, clean formula cheat sheets with clear variable descriptions in JSON format.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              categories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    categoryName: { type: Type.STRING },
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          formula: { type: Type.STRING },
                          notes: { type: Type.STRING }
                        },
                        required: ["name", "formula", "notes"]
                      }
                    }
                  },
                  required: ["categoryName", "items"]
                }
              },
              examMnemonics: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "categories", "examMnemonics"]
          }
        }
      });

      return parseJSONFromText(response.text || "{}");
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "FormulaSheet", error);
  }
});

// 9. Adaptive Study Engine Recommendation
app.post("/api/ai/adaptive-recommendation", async (req, res) => {
  try {
    const { profile, exams = [], assignments = [], quizResults = [], subjects = [] } = req.body;

    const prompt = `You are the CampusAI Adaptive Study Engine.
Analyze the following student academic signals and determine the single highest-priority study focus right now.
Explain exactly WHY using the concrete facts provided (e.g. "Exam in 3 days", "Quiz score was 40% on Topic X", "Assignment due tomorrow").
Do NOT invent fake exams or fake scores not provided in the payload.

Student Data:
- Degree / Department: ${profile?.degree || profile?.major || "Undergraduate"} (${profile?.year || "Current Year"}, ${profile?.semester || "Current Sem"})
- Academic Goal: ${profile?.academicGoal || "Academic Growth"}
- Declared Weak Areas: ${(profile?.weakTopics || []).join(", ") || "None declared"}
- Daily Study Target: ${profile?.dailyStudyGoalHours || 3} hours
- Active Subjects: ${(subjects || []).map((s: any) => `${s.name} (${s.masteryPercentage || 50}% mastery)`).join("; ") || "None"}
- Upcoming Exams: ${JSON.stringify(exams || [])}
- Pending Assignments: ${JSON.stringify(assignments || [])}
- Recent Quiz History: ${JSON.stringify((quizResults || []).slice(-4).map((q: any) => ({ subject: q.subject, topic: q.topic, score: `${q.score}/${q.totalQuestions}`, percentage: q.percentage, weakTopics: q.weakTopics })))}`;

    const result = await callGeminiWithRetry("AdaptiveEngine", async (client, model) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are the core logic for the CampusAI Adaptive Study Engine. Analyze student signals to prioritize the most urgent, high-yield topic and provide an evidence-backed rationale explaining WHY. Return pure JSON matching the schema.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              urgency: { type: Type.STRING, description: "Critical, High, Medium, or Low" },
              reason: { type: Type.STRING, description: "Evidence-backed explanation of why this topic is prioritized based on exams, deadlines, or quiz scores." },
              recommendedAction: { type: Type.STRING, description: "Concrete next step (e.g. Ask AI Tutor, take diagnostic quiz, deconstruct assignment)." },
              actionType: { type: Type.STRING, description: "One of: tutor, quiz, notes, exam" },
              suggestedDurationMinutes: { type: Type.INTEGER },
              dataBacking: { type: Type.STRING, description: "Specific data signals that triggered this recommendation." }
            },
            required: ["subject", "topic", "urgency", "reason", "recommendedAction", "actionType", "suggestedDurationMinutes", "dataBacking"]
          }
        }
      });

      return parseJSONFromText(response.text || "{}");
    });

    res.json(result);
  } catch (error: any) {
    return handleRouteError(res, "AdaptiveEngine", error);
  }
});

// Strict API catch-all for unmatched /api routes (both with and without trailing slash)
app.all("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});
app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// JSON error handling middleware for unhandled express errors
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Unhandled server error:", err);
  const status = typeof err.status === "number" ? err.status : 500;
  res.status(status).json({
    error: err.message || "An unexpected error occurred",
  });
});

// Vite middleware & Static SPA Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Intercept: Never let Vite serve HTML or rewrite URL for any request starting with /api
    app.use((req, res, next) => {
      const url = req.originalUrl || req.url || "";
      if (url.startsWith("/api")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const url = req.originalUrl || req.url || "";
      if (url.startsWith("/api")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusAI server running at http://localhost:${PORT}`);
  });
}

start();
