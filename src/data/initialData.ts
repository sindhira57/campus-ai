import {
  StudentProfile,
  Subject,
  StudyTask,
  Assignment,
  Exam,
  QuizResultRecord,
  NoteAnalysis,
  StudyPlan,
  StudySessionLog,
  FlashcardDeck,
} from "../types";

export const defaultEmptyProfile: StudentProfile = {
  name: "",
  degree: "",
  department: "",
  major: "",
  year: "1st Year",
  semester: "Semester 1",
  academicGoal: "",
  weakSubjects: [],
  weakTopics: [],
  dailyStudyGoalHours: 2.5,
  preferredStudyStyle: "step-by-step",
  targetGpa: "3.8",
  streakDays: 0,
  lastStudyDate: "",
  onboardingCompleted: false,
  totalStudyHoursLogged: 0,
};

export const initialProfile: StudentProfile = {
  name: "Alex Rivera",
  degree: "B.Tech Computer Science & Engineering",
  department: "Computer Science & Engineering",
  major: "Computer Science & Engineering",
  year: "3rd Year / Junior",
  semester: "Semester 5",
  academicGoal: "Target 9.0+ CGPA & crack campus technical interviews",
  weakSubjects: ["Data Structures & Algorithms", "Computer Architecture"],
  weakTopics: ["Dynamic Programming (Knapsack)", "RISC Pipelining Hazards"],
  dailyStudyGoalHours: 3.5,
  preferredStudyStyle: "step-by-step",
  targetGpa: "3.8",
  streakDays: 6,
  lastStudyDate: new Date().toISOString().split("T")[0],
  onboardingCompleted: true,
  totalStudyHoursLogged: 42.5,
};

export interface AcademicStreamPreset {
  id: string;
  label: string;
  degree: string;
  department: string;
  year: string;
  semester: string;
  academicGoal: string;
  weakSubjects: string[];
  weakTopics: string[];
  dailyStudyGoalHours: number;
  preferredStudyStyle: "step-by-step" | "practice-heavy" | "visual-analogy" | "exam-cram";
  subjects: Subject[];
}

export const academicPresets: Record<string, AcademicStreamPreset> = {
  btech_ai: {
    id: "btech_ai",
    label: "B.Tech AI & Data Science",
    degree: "B.Tech Artificial Intelligence & Data Science",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    semester: "Semester 5",
    academicGoal: "Target 9.0+ CGPA & publish undergraduate research in Deep Learning",
    weakSubjects: ["Deep Neural Networks", "Probability & Linear Algebra"],
    weakTopics: ["Backpropagation & Gradient Descent", "Eigenvectors & PCA"],
    dailyStudyGoalHours: 3.5,
    preferredStudyStyle: "practice-heavy",
    subjects: [
      {
        id: "sub-ai-1",
        name: "Python for Machine Learning",
        code: "AI-301",
        emoji: "🤖",
        color: "blue",
        description: "Scikit-Learn, PyTorch tensors, feature engineering, and model evaluation metrics.",
        masteryPercentage: 82,
        importantTopics: ["PyTorch Tensor Operations", "Cross-Validation & AUC-ROC", "Feature Standardization", "Gradient Boosted Trees"],
      },
      {
        id: "sub-ai-2",
        name: "Deep Neural Networks",
        code: "AI-320",
        emoji: "🧠",
        color: "purple",
        description: "CNNs for Computer Vision, Transformers, Attention Mechanisms, and Optimizer dynamics.",
        masteryPercentage: 64,
        importantTopics: ["Backpropagation Mathematics", "Self-Attention Mechanism", "Convolutional Filters & Pooling", "Dropout & Regularization"],
      },
      {
        id: "sub-ai-3",
        name: "Probability & Linear Algebra for AI",
        code: "MATH-310",
        emoji: "📐",
        color: "amber",
        description: "Multivariate normal distributions, SVD, Matrix decomposition, and Bayesian inference.",
        masteryPercentage: 68,
        importantTopics: ["Singular Value Decomposition (SVD)", "Bayesian Inference", "Eigenvalues & PCA", "Maximum Likelihood Estimation"],
      },
      {
        id: "sub-ai-4",
        name: "Data Structures & Algorithms",
        code: "CS-201",
        emoji: "🌲",
        color: "emerald",
        description: "Trees, Graphs, Dynamic Programming, and complexity analysis for competitive programming.",
        masteryPercentage: 76,
        importantTopics: ["Dynamic Programming", "Dijkstra & Graph Traversal", "Binary Search Trees", "Hash Table Collision Resolution"],
      },
      {
        id: "sub-ai-5",
        name: "Database & Big Data Systems",
        code: "CS-340",
        emoji: "💾",
        color: "cyan",
        description: "Distributed storage, SQL optimization, ACID transactions, and Spark query execution.",
        masteryPercentage: 78,
        importantTopics: ["ACID Properties", "B+ Tree Indexing", "3NF Normalization", "Distributed MapReduce"],
      },
    ],
  },
  btech_cs: {
    id: "btech_cs",
    label: "B.Tech Computer Science",
    degree: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    semester: "Semester 5",
    academicGoal: "Target 9.0+ CGPA & crack campus technical interviews",
    weakSubjects: ["Computer Architecture", "Data Structures & Algorithms"],
    weakTopics: ["RISC Pipelining Hazards", "Dynamic Programming (Knapsack)"],
    dailyStudyGoalHours: 3.5,
    preferredStudyStyle: "step-by-step",
    subjects: [
      {
        id: "sub-cs-1",
        name: "Data Structures & Algorithms",
        code: "CS-301",
        emoji: "📗",
        color: "emerald",
        description: "Trees, Graphs, Dynamic Programming, Sorting algorithms, and Big-O asymptotic analysis.",
        masteryPercentage: 72,
        importantTopics: ["Binary Search Trees", "Dijkstra & BFS/DFS", "Dynamic Programming (Knapsack)", "Heap & Priority Queues"],
      },
      {
        id: "sub-cs-2",
        name: "Computer Architecture",
        code: "CS-320",
        emoji: "📕",
        color: "rose",
        description: "Pipelining, instruction set architectures, cache hierarchies, and ALU design.",
        masteryPercentage: 58,
        importantTopics: ["5-Stage RISC Pipelining", "Hazard Mitigation", "Cache Associativity & Hit Rates", "Virtual Memory & TLBs"],
      },
      {
        id: "sub-cs-3",
        name: "Database Management Systems",
        code: "CS-340",
        emoji: "📒",
        color: "cyan",
        description: "Relational algebra, SQL query optimization, B+ Tree indexing, and ACID transactions.",
        masteryPercentage: 78,
        importantTopics: ["ACID Properties", "B+ Tree Indexing", "3NF & BCNF Normalization", "Query Optimization"],
      },
      {
        id: "sub-cs-4",
        name: "Operating Systems",
        code: "CS-330",
        emoji: "⚙️",
        color: "blue",
        description: "Process synchronization, semaphores, virtual memory paging, and file systems.",
        masteryPercentage: 74,
        importantTopics: ["Process Scheduling (Round Robin)", "Deadlock Banker's Algorithm", "Demand Paging", "Semaphores & Mutex"],
      },
    ],
  },
  bcom: {
    id: "bcom",
    label: "B.Com Commerce & Finance",
    degree: "Bachelor of Commerce (Honours)",
    department: "Commerce & Financial Studies",
    year: "2nd Year",
    semester: "Semester 4",
    academicGoal: "Clear CA Foundation/Inter & secure placement in Corporate Banking",
    weakSubjects: ["Corporate Financial Accounting", "Direct & Indirect Taxation"],
    weakTopics: ["Cash Flow Statements (AS-3)", "GST Input Tax Credit (ITC)"],
    dailyStudyGoalHours: 3.0,
    preferredStudyStyle: "visual-analogy",
    subjects: [
      {
        id: "sub-com-1",
        name: "Corporate Financial Accounting",
        code: "COM-201",
        emoji: "📊",
        color: "blue",
        description: "Company final accounts, share capital forfeiture, amalgamation, and cash flow statements.",
        masteryPercentage: 66,
        importantTopics: ["Cash Flow Statement (AS-3)", "Forfeiture & Re-issue of Shares", "Amalgamation Accounting", "Internal Reconstruction"],
      },
      {
        id: "sub-com-2",
        name: "Business & Mercantile Law",
        code: "COM-202",
        emoji: "⚖️",
        color: "amber",
        description: "Indian Contract Act 1872, Sale of Goods Act, Companies Act 2013, and Negotiable Instruments.",
        masteryPercentage: 75,
        importantTopics: ["Breach of Contract Remedies", "Doctrine of Ultra Vires", "Holder in Due Course", "Conditions vs Warranties"],
      },
      {
        id: "sub-com-3",
        name: "Macroeconomics & Public Finance",
        code: "ECO-203",
        emoji: "📈",
        color: "emerald",
        description: "National income accounting, Keynesian multiplier, monetary policy, and fiscal deficits.",
        masteryPercentage: 80,
        importantTopics: ["Keynesian Investment Multiplier", "IS-LM Curve Model", "RBI Monetary Tools (Repo Rate)", "Fiscal Deficit Components"],
      },
      {
        id: "sub-com-4",
        name: "Cost & Management Accounting",
        code: "COM-204",
        emoji: "📑",
        color: "purple",
        description: "Marginal costing, break-even analysis, standard costing, and budgetary controls.",
        masteryPercentage: 62,
        importantTopics: ["Break-Even Analysis (P/V Ratio)", "Standard Costing Variances", "Process Costing (Normal Loss)", "Flexible Budgeting"],
      },
    ],
  },
  bba: {
    id: "bba",
    label: "BBA Business Administration",
    degree: "Bachelor of Business Administration",
    department: "Department of Management Studies",
    year: "2nd Year",
    semester: "Semester 3",
    academicGoal: "Maintain 3.9 GPA & build profile for Top Tier MBA Entrance",
    weakSubjects: ["Financial Management", "Business Analytics"],
    weakTopics: ["Capital Budgeting (NPV vs IRR)", "Hypothesis Testing (Z-Test/T-Test)"],
    dailyStudyGoalHours: 2.5,
    preferredStudyStyle: "visual-analogy",
    subjects: [
      {
        id: "sub-bba-1",
        name: "Financial Management",
        code: "BBA-201",
        emoji: "💼",
        color: "emerald",
        description: "Time value of money, Capital budgeting, Cost of capital (WACC), and Working capital management.",
        masteryPercentage: 68,
        importantTopics: ["Net Present Value (NPV) & IRR", "Weighted Average Cost of Capital", "Working Capital Cycle", "Operating vs Financial Leverage"],
      },
      {
        id: "sub-bba-2",
        name: "Marketing Management & Strategy",
        code: "BBA-202",
        emoji: "🎯",
        color: "rose",
        description: "Segmentation, targeting, positioning (STP), 4Ps Marketing mix, consumer behavior, and brand equity.",
        masteryPercentage: 85,
        importantTopics: ["STP Framework", "Product Life Cycle Strategies", "Customer Lifetime Value", "Brand Resonance Model"],
      },
      {
        id: "sub-bba-3",
        name: "Organizational Behavior",
        code: "BBA-203",
        emoji: "👥",
        color: "blue",
        description: "Motivation theories, leadership models, conflict resolution, and organizational culture.",
        masteryPercentage: 88,
        importantTopics: ["Maslow & Herzberg Motivation", "Transformational Leadership", "Cognitive Dissonance Theory", "Team Dynamics & Groupthink"],
      },
      {
        id: "sub-bba-4",
        name: "Business Analytics & Statistics",
        code: "BBA-204",
        emoji: "📉",
        color: "cyan",
        description: "Descriptive statistics, hypothesis testing, linear regression, and predictive business metrics.",
        masteryPercentage: 60,
        importantTopics: ["Hypothesis Testing (p-value)", "Multiple Linear Regression", "ANOVA Variance Analysis", "Decision Trees for Managers"],
      },
    ],
  },
  bsc_phys: {
    id: "bsc_phys",
    label: "B.Sc Physics",
    degree: "Bachelor of Science in Physics",
    department: "Department of Physics",
    year: "3rd Year",
    semester: "Semester 5",
    academicGoal: "Score top percentile in Graduate Physics Entrance & pursue Masters",
    weakSubjects: ["Quantum Mechanics", "Classical Electrodynamics"],
    weakTopics: ["Time-Independent Schrödinger Equation", "Maxwell's Equations & Poynting Vector"],
    dailyStudyGoalHours: 3.5,
    preferredStudyStyle: "step-by-step",
    subjects: [
      {
        id: "sub-phy-1",
        name: "Quantum Mechanics",
        code: "PHY-301",
        emoji: "⚛️",
        color: "purple",
        description: "Wave-particle duality, Schrödinger equation, 1D potential wells, and harmonic oscillators.",
        masteryPercentage: 62,
        importantTopics: ["Particle in a 1D Box", "Harmonic Oscillator Ladder Operators", "Heisenberg Uncertainty Principle", "Quantum Tunneling"],
      },
      {
        id: "sub-phy-2",
        name: "Classical Electrodynamics",
        code: "PHY-302",
        emoji: "⚡",
        color: "amber",
        description: "Electrostatics, boundary value problems, Maxwell's equations, and electromagnetic wave propagation.",
        masteryPercentage: 65,
        importantTopics: ["Maxwell's Equations in Matter", "Poynting Vector & Energy Flow", "Method of Images", "Wave Equation in Dielectrics"],
      },
      {
        id: "sub-phy-3",
        name: "Thermodynamics & Statistical Physics",
        code: "PHY-303",
        emoji: "🔥",
        color: "rose",
        description: "Carnot engines, Maxwell relations, Fermi-Dirac and Bose-Einstein distributions.",
        masteryPercentage: 74,
        importantTopics: ["Maxwell Thermodynamic Relations", "Partition Function", "Bose-Einstein Condensation", "Entropy & Microstates"],
      },
    ],
  },
  bsc_math: {
    id: "bsc_math",
    label: "B.Sc Mathematics",
    degree: "Bachelor of Science in Mathematics",
    department: "Department of Mathematics",
    year: "2nd Year",
    semester: "Semester 3",
    academicGoal: "Maintain > 9.2 CGPA and prepare for National Mathematics Olympiad/Exams",
    weakSubjects: ["Real Analysis", "Abstract Algebra"],
    weakTopics: ["Epsilon-Delta Continuity Proofs", "Group Isomorphism Theorems"],
    dailyStudyGoalHours: 3.0,
    preferredStudyStyle: "step-by-step",
    subjects: [
      {
        id: "sub-math-1",
        name: "Real Analysis",
        code: "MATH-201",
        emoji: "♾️",
        color: "blue",
        description: "Completeness axiom, sequences and series convergence, Riemann integration, and topology of R.",
        masteryPercentage: 63,
        importantTopics: ["Cauchy Sequences & Bolzano-Weierstrass", "Riemann Integrability Criteria", "Uniform vs Pointwise Convergence", "Epsilon-Delta Proofs"],
      },
      {
        id: "sub-math-2",
        name: "Abstract Algebra",
        code: "MATH-202",
        emoji: "🧮",
        color: "purple",
        description: "Groups, cyclic subgroups, Lagrange's Theorem, normal subgroups, quotient groups, and ring theory.",
        masteryPercentage: 60,
        importantTopics: ["First Isomorphism Theorem", "Lagrange's Theorem & Cosets", "Sylow Theorems", "Ideals and Quotient Rings"],
      },
      {
        id: "sub-math-3",
        name: "Ordinary Differential Equations",
        code: "MATH-203",
        emoji: "📈",
        color: "emerald",
        description: "First order ODEs, linear second order ODEs with constant coefficients, and Laplace transforms.",
        masteryPercentage: 78,
        importantTopics: ["Laplace Transforms & Inverses", "Wronskian & Linear Independence", "Variation of Parameters", "Exact Differential Equations"],
      },
    ],
  },
};


export const initialSubjects: Subject[] = [
  {
    id: "sub-1",
    name: "Python Programming",
    code: "CS-201",
    emoji: "📘",
    color: "blue",
    description: "Object-oriented programming, data structures, generators, decorators & async programming.",
    masteryPercentage: 84,
    importantTopics: ["List Comprehensions", "Generators & Iterators", "Decorators", "OOP & Dunder Methods", "AsyncIO"],
  },
  {
    id: "sub-2",
    name: "Data Structures & Algorithms",
    code: "CS-301",
    emoji: "📗",
    color: "emerald",
    description: "Trees, Graphs, Dynamic Programming, Sorting algorithms, and Big-O asymptotic analysis.",
    masteryPercentage: 72,
    importantTopics: ["Binary Search Trees", "Dijkstra & BFS/DFS", "Dynamic Programming (Knapsack)", "Heap & Priority Queues"],
  },
  {
    id: "sub-3",
    name: "Discrete Mathematics & Calculus",
    code: "MATH-210",
    emoji: "📙",
    color: "amber",
    description: "Graph theory, combinatorics, recurrence relations, proofs by induction, and matrix calculus.",
    masteryPercentage: 65,
    importantTopics: ["Mathematical Induction", "Recurrence Relations", "Graph Coloring", "Bayesian Probability", "Eigenvalues"],
  },
  {
    id: "sub-4",
    name: "Computer Architecture",
    code: "CS-320",
    emoji: "📕",
    color: "rose",
    description: "Pipelining, instruction set architectures, cache hierarchies, memory management, and ALU design.",
    masteryPercentage: 58,
    importantTopics: ["5-Stage RISC Pipelining", "Hazard Mitigation", "Cache Associativity & Hit Rates", "Virtual Memory & TLBs"],
  },
  {
    id: "sub-5",
    name: "Database Management Systems",
    code: "CS-340",
    emoji: "📒",
    color: "cyan",
    description: "Relational algebra, SQL query optimization, B+ Tree indexing, ACID transactions, and normalization.",
    masteryPercentage: 78,
    importantTopics: ["ACID Properties", "B+ Tree Indexing", "3NF & BCNF Normalization", "Query Optimization", "Concurrency Locking"],
  },
];

// Helper to get formatted date string offset from today
export function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const initialTasks: StudyTask[] = [
  {
    id: "task-1",
    subjectId: "sub-2",
    subjectName: "Data Structures & Algorithms",
    title: "Implement Dijkstra's Algorithm in Python & verify min-heap priority",
    durationMinutes: 45,
    date: getDateOffset(0),
    priority: "High",
    completed: true,
    notes: "Review edge weights and visited set logic.",
  },
  {
    id: "task-2",
    subjectId: "sub-1",
    subjectName: "Python Programming",
    title: "Complete AsyncIO concurrency practice quiz & event loop review",
    durationMinutes: 30,
    date: getDateOffset(0),
    priority: "Medium",
    completed: true,
    notes: "Focus on asyncio.gather vs TaskGroup.",
  },
  {
    id: "task-3",
    subjectId: "sub-4",
    subjectName: "Computer Architecture",
    title: "Solve 4 Pipelining Hazard simulation problems (Data vs Control hazards)",
    durationMinutes: 60,
    date: getDateOffset(0),
    priority: "High",
    completed: false,
    notes: "Chapter 4.6 in textbook.",
  },
  {
    id: "task-4",
    subjectId: "sub-3",
    subjectName: "Discrete Mathematics & Calculus",
    title: "Derive Master Theorem recurrence relations for divide & conquer",
    durationMinutes: 40,
    date: getDateOffset(0),
    priority: "Medium",
    completed: false,
  },
  {
    id: "task-5",
    subjectId: "sub-5",
    subjectName: "Database Management Systems",
    title: "Review B+ Tree leaf node splitting and index balancing slides",
    durationMinutes: 35,
    date: getDateOffset(1),
    priority: "Low",
    completed: false,
  },
  {
    id: "task-6",
    subjectId: "sub-2",
    subjectName: "Data Structures & Algorithms",
    title: "Practice 0/1 Knapsack & Unbounded Knapsack DP memorization",
    durationMinutes: 50,
    date: getDateOffset(1),
    priority: "High",
    completed: false,
  },
];

export const initialAssignments: Assignment[] = [
  {
    id: "assign-1",
    subjectId: "sub-2",
    subjectName: "Data Structures & Algorithms",
    title: "Graph Routing Simulation & Benchmark Analysis",
    deadline: getDateOffset(3),
    description:
      "Construct a network graph routing simulator in Python comparing BFS, Dijkstra, and A* search on road maps with 10,000 nodes. Output execution time, memory usage, and path optimality in a benchmark report.",
    status: "In Progress",
    priority: "High",
    aiHelp: {
      understanding:
        "This project evaluates your ability to implement shortest-path algorithms efficiently, choose appropriate graph representations (Adjacency List vs Matrix), and profile asymptotic runtimes on dense datasets.",
      steps: [
        { stepNumber: 1, title: "Graph Class & Adjacency List", description: "Design a weighted Graph structure using dictionaries and adjacency lists for fast lookup." },
        { stepNumber: 2, title: "Dijkstra & A* Priority Queue", description: "Integrate Python's heapq for O((V + E) log V) performance." },
        { stepNumber: 3, title: "Benchmark Script & Metrics", description: "Use Python's timeit and tracemalloc to record execution metrics across synthetic grid maps." },
        { stepNumber: 4, title: "Report & Visual Graphs", description: "Plot logarithmic performance curves and compare heuristic accuracy." },
      ],
      outline: [
        { section: "1. Problem Formulation & Graph Theory", keyPoints: ["Network topology specs", "Heuristic admissibility definition"] },
        { section: "2. Algorithm Implementation Architecture", keyPoints: ["Min-heap queue handling", "Tie-breaking heuristics", "Cycle detection"] },
        { section: "3. Experimental Benchmark Results", keyPoints: ["Empirical runtime tables", "Memory profile graphs"] },
        { section: "4. Trade-off Analysis & Conclusions", keyPoints: ["When Dijkstra outperforms A*", "Real-world GPS navigation implications"] },
      ],
      difficultConcepts: [
        {
          concept: "Admissible & Consistent Heuristics in A*",
          explanation:
            "A heuristic h(n) is admissible if it never overestimates the actual cost to reach the goal. For Euclidean distance on maps, straight-line distance is always admissible.",
        },
      ],
      researchApproach:
        "Consult Sedgewick Algorithms Chapter 4 and Python heapq documentation. Test edge cases with disconnected nodes and zero-weight cycles.",
      checklist: [
        { id: "c1", task: "Setup Graph data structure with node weights", completed: true },
        { id: "c2", task: "Implement Dijkstra algorithm using heapq", completed: true },
        { id: "c3", task: "Implement A* algorithm with Euclidean distance heuristic", completed: false },
        { id: "c4", task: "Generate 10k node benchmark test suite", completed: false },
        { id: "c5", task: "Compile results into final PDF analysis report", completed: false },
      ],
    },
  },
  {
    id: "assign-2",
    subjectId: "sub-5",
    subjectName: "Database Management Systems",
    title: "E-Commerce Database Schema Design & 3NF Normalization",
    deadline: getDateOffset(6),
    description:
      "Design an enterprise relational database schema for an e-commerce order management platform. Decompose un-normalized tables into 3NF and BCNF, define foreign key constraints, and write 5 complex analytical queries with indexing strategies.",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "assign-3",
    subjectId: "sub-4",
    subjectName: "Computer Architecture",
    title: "MIPS 5-Stage Pipeline Hazard Mitigation Lab",
    deadline: getDateOffset(10),
    description:
      "Analyze instruction streams for Read-After-Write (RAW) data hazards and branch control hazards. Compute cycles per instruction (CPI) with and without forwarding hardware.",
    status: "Not Started",
    priority: "High",
  },
];

export const initialExams: Exam[] = [
  {
    id: "exam-1",
    subjectId: "sub-2",
    subjectName: "Data Structures & Algorithms",
    examDate: getDateOffset(5),
    examTime: "09:30 AM",
    room: "Science Hall 204",
    topics: ["Graph Traversal (BFS/DFS)", "Dijkstra & Shortest Path", "Dynamic Programming", "Heap / Priority Queues", "Asymptotic Analysis"],
    priority: "High",
    prepPlan: {
      priorityTopics: [
        { topic: "Dynamic Programming (1D & 2D tables)", weight: "High", estimatedQuestions: "35%", strategy: "Master state transition formulation and base conditions." },
        { topic: "Graph Shortest Path & MST", weight: "High", estimatedQuestions: "30%", strategy: "Practice step-by-step tracing on weighted graph diagrams." },
        { topic: "Binary Search Trees & AVL Balancing", weight: "Medium", estimatedQuestions: "20%", strategy: "Review single and double rotation steps." },
        { topic: "Big-O Asymptotic Proofs", weight: "Low", estimatedQuestions: "15%", strategy: "Memorize formal limits definition of O, Omega, and Theta." },
      ],
      revisionSchedule: [
        { phase: "Day 1-2: Core Algorithms & Tracing", focus: "Hand-trace Dijkstra and Kruskal algorithms on sample matrices.", hoursRecommended: 3.5 },
        { phase: "Day 3-4: Dynamic Programming & Coding", focus: "Solve 6 classic DP problems (Knapsack, LCS, Coin Change).", hoursRecommended: 4.0 },
        { phase: "Day 5: Timed Mock Exam", focus: "Complete full 90-minute timed past exam under test conditions.", hoursRecommended: 2.5 },
      ],
      importantConcepts: [
        { title: "Optimal Substructure Property", summary: "An optimal solution to any instance contains optimal solutions to its sub-problems." },
        { title: "Greedy Choice Property", summary: "A globally optimal solution can be reached by making locally optimal decisions without backtracking." },
      ],
      practiceQuestions: [
        { question: "Explain why Dijkstra fails with negative edge weights and what algorithm should be used instead.", answerGuide: "Dijkstra assumes once a node is visited its distance is minimized. With negative weights, greedy selection is invalid. Bellman-Ford (O(VE)) or Johnson's algorithm should be used instead." },
        { question: "Derive the recurrence for Longest Common Subsequence of strings X and Y.", answerGuide: "If X[i] == Y[j], LCS(i,j) = 1 + LCS(i-1, j-1); else max(LCS(i-1, j), LCS(i, j-1)). Base case LCS(0, j) = 0." },
      ],
      quickRevisionNotes: [
        "Priority queue in Python is min-heap by default via heapq.",
        "DFS uses stack/recursion; BFS uses FIFO queue.",
        "Space complexity for recursive DP is O(N) stack depth unless memoized or tabulated iteratively.",
      ],
    },
  },
  {
    id: "exam-2",
    subjectId: "sub-4",
    subjectName: "Computer Architecture",
    examDate: getDateOffset(12),
    examTime: "02:00 PM",
    room: "Engineering Hall 101",
    topics: ["5-Stage Pipeline", "Data Hazards & Forwarding", "Branch Prediction", "Cache Mapping (Direct vs Set-Associative)", "Virtual Memory"],
    priority: "High",
  },
  {
    id: "exam-3",
    subjectId: "sub-3",
    subjectName: "Discrete Mathematics & Calculus",
    examDate: getDateOffset(18),
    examTime: "11:00 AM",
    room: "Math Building 302",
    topics: ["Mathematical Induction", "Recurrence Relations", "Graph Coloring & Euler Paths", "Matrix Diagonalization"],
    priority: "Medium",
  },
];

export const initialQuizResults: QuizResultRecord[] = [
  {
    id: "quiz-1",
    subject: "Python Programming",
    topic: "Generators & Iterators",
    difficulty: "Medium",
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    date: getDateOffset(-1),
    questions: [
      {
        id: "q1",
        question: "What keyword is used to pause function execution and return a value from a generator?",
        options: ["return", "yield", "pause", "emit"],
        correctAnswerIndex: 1,
        explanation: "The 'yield' keyword suspends execution, returning the current item and preserving state.",
        topic: "Generators",
      },
    ],
    userAnswers: [1],
    weakTopics: [],
  },
  {
    id: "quiz-2",
    subject: "Data Structures & Algorithms",
    topic: "Binary Search Trees & Traversals",
    difficulty: "Hard",
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    date: getDateOffset(-2),
    questions: [
      {
        id: "q2",
        question: "Which traversal of a Binary Search Tree produces elements in non-decreasing sorted order?",
        options: ["Pre-order", "In-order", "Post-order", "Level-order"],
        correctAnswerIndex: 1,
        explanation: "In-order traversal visits left subtree, root, then right subtree, producing strictly sorted keys for BSTs.",
        topic: "Tree Traversals",
      },
    ],
    userAnswers: [1],
    weakTopics: ["AVL Tree Rotations"],
  },
  {
    id: "quiz-3",
    subject: "Computer Architecture",
    topic: "Cache Hierarchies & Associativity",
    difficulty: "Medium",
    score: 3,
    totalQuestions: 5,
    percentage: 60,
    date: getDateOffset(-4),
    questions: [],
    userAnswers: [0, 1, 2, 0, 1],
    weakTopics: ["Direct Mapped Cache Indexing", "Write-Through vs Write-Back Policies"],
  },
];

export const initialNotes: NoteAnalysis[] = [
  {
    id: "note-1",
    title: "Lecture 8: Advanced Dynamic Programming Strategies",
    subject: "Data Structures & Algorithms",
    rawText: `Dynamic Programming (DP) is an algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems and storing results to avoid duplicate computation.
    
    Two Essential Properties:
    1. Optimal Substructure: An optimal solution contains within it optimal solutions to subproblems.
    2. Overlapping Subproblems: The problem can be broken down into subproblems which are reused several times.
    
    Approaches:
    - Top-Down (Memoization): Recursive approach where subproblem results are stored in a cache/hash table.
    - Bottom-Up (Tabulation): Iterative approach starting from base cases and filling a DP table.
    
    Classic Examples:
    - 0/1 Knapsack: Choose items with weight w_i and value v_i to maximize value within capacity W.
    - Longest Common Subsequence (LCS): Finding longest subsequence present in both sequences in order.
    - Matrix Chain Multiplication: Minimizing scalar multiplications for matrix products.`,
    summary:
      "Comprehensive breakdown of Dynamic Programming principles, comparing Top-Down Memoization with Bottom-Up Tabulation, and detailing state transition formulations for Knapsack and LCS problems.",
    importantTopics: ["Optimal Substructure", "Overlapping Subproblems", "Memoization vs Tabulation", "0/1 Knapsack State Equations", "Space Optimization Techniques"],
    definitions: [
      { term: "Optimal Substructure", definition: "A characteristic of problems where the overall optimal solution is composed of optimal solutions to its subproblems." },
      { term: "Memoization", definition: "A top-down optimization technique that caches recursive function results based on parameter states." },
      { term: "Tabulation", definition: "A bottom-up iterative method that pre-computes DP states in an array from base cases upwards." },
      { term: "State Transition Equation", definition: "The recurrence relation defining how a current DP state dp[i][j] is computed from previously solved subproblems." },
    ],
    importantQuestions: [
      "How do you determine whether a problem requires Dynamic Programming versus a Greedy algorithm?",
      "When is Top-Down Memoization preferable over Bottom-Up Tabulation?",
      "How can you reduce the space complexity of 0/1 Knapsack from O(N*W) to O(W)?",
    ],
    revisionNotes: [
      "Always identify the state variables (what uniquely defines a subproblem).",
      "Write down the base cases explicitly before building recurrence loops.",
      "Check if you only need the previous row or state to optimize memory usage to O(N).",
    ],
    examQuestions: [
      "Define the state transition formula for 0/1 Knapsack and explain the time & space complexity.",
      "Given two strings X='ABCBDAB' and Y='BDCABA', trace the 2D DP matrix to find the LCS.",
      "Explain the trade-offs between recursion overhead in memoization vs full table allocation in tabulation.",
    ],
    createdAt: getDateOffset(-2),
  },
];

export const initialStudyPlan: StudyPlan = {
  id: "plan-current",
  createdAt: getDateOffset(0),
  summary: "Targeted 3.5-hour daily study routine prioritizing DSA Exam in 5 days while maintaining steady coursework in Computer Architecture & Python.",
  days: [
    {
      dayName: "Monday",
      focus: "DSA Graph Algorithms & Python Concurrency",
      totalHours: 3.5,
      tasks: [
        { id: "p1", title: "Dijkstra & Priority Queue Implementation", durationMinutes: 60, subject: "Data Structures & Algorithms", priority: "High", completed: true },
        { id: "p2", title: "Python AsyncIO & Event Loop deep dive", durationMinutes: 45, subject: "Python Programming", priority: "Medium", completed: true },
        { id: "p3", title: "Pipelining Hazard Problem Sets", durationMinutes: 60, subject: "Computer Architecture", priority: "High", completed: false },
        { id: "p4", title: "Active Recall Flashcards & Flash Revision", durationMinutes: 45, subject: "General", priority: "Low", completed: false },
      ],
    },
    {
      dayName: "Tuesday",
      focus: "Dynamic Programming & Math Recurrences",
      totalHours: 3.5,
      tasks: [
        { id: "p5", title: "0/1 Knapsack & Subset Sum variations", durationMinutes: 75, subject: "Data Structures & Algorithms", priority: "High", completed: false },
        { id: "p6", title: "Discrete Math Inductive Proofs", durationMinutes: 60, subject: "Discrete Mathematics & Calculus", priority: "Medium", completed: false },
        { id: "p7", title: "Pomodoro Session: DBMS Indexing", durationMinutes: 50, subject: "Database Management Systems", priority: "Medium", completed: false },
      ],
    },
    {
      dayName: "Wednesday",
      focus: "High-Yield Exam Prep & Timed Quiz",
      totalHours: 3.5,
      tasks: [
        { id: "p8", title: "DSA Full-Length Timed Mock Quiz (15 Qs)", durationMinutes: 60, subject: "Data Structures & Algorithms", priority: "High", completed: false },
        { id: "p9", title: "Architecture Cache Associativity Calculations", durationMinutes: 60, subject: "Computer Architecture", priority: "High", completed: false },
        { id: "p10", title: "Review Weak Topics & Formula Sheet", durationMinutes: 60, subject: "General", priority: "Medium", completed: false },
      ],
    },
  ],
  tips: [
    "Use 25-minute Pomodoro intervals to prevent cognitive fatigue during DP algorithm tracing.",
    "Schedule your highest-difficulty task (DSA) in the morning when mental focus peaks.",
    "Review revision notes 30 minutes before sleep for optimal memory consolidation.",
  ],
};

export const initialStudyLogs: StudySessionLog[] = [
  { id: "log-1", subject: "Data Structures & Algorithms", durationMinutes: 45, type: "Pomodoro", date: getDateOffset(0) },
  { id: "log-2", subject: "Python Programming", durationMinutes: 30, type: "Revision", date: getDateOffset(0) },
  { id: "log-3", subject: "Computer Architecture", durationMinutes: 50, type: "Deep Work", date: getDateOffset(-1) },
  { id: "log-4", subject: "Data Structures & Algorithms", durationMinutes: 60, type: "Pomodoro", date: getDateOffset(-1) },
  { id: "log-5", subject: "Discrete Mathematics & Calculus", durationMinutes: 45, type: "Deep Work", date: getDateOffset(-2) },
  { id: "log-6", subject: "Database Management Systems", durationMinutes: 40, type: "Revision", date: getDateOffset(-3) },
  { id: "log-7", subject: "Python Programming", durationMinutes: 55, type: "Pomodoro", date: getDateOffset(-4) },
];

export const initialFlashcardDeck: FlashcardDeck = {
  id: "deck-1",
  subject: "Data Structures & Algorithms",
  topic: "Graph Algorithms & Shortest Path",
  createdAt: getDateOffset(-1),
  cards: [
    {
      id: "fc-1",
      front: "What is the time complexity of Dijkstra's algorithm implemented with a Min-Heap (priority queue)?",
      back: "O((V + E) log V) where V is the number of vertices and E is the number of edges.",
      known: true,
    },
    {
      id: "fc-2",
      front: "Why does Dijkstra's algorithm fail on graphs with negative edge weights?",
      back: "Dijkstra assumes that once a vertex is marked visited, its shortest distance is finalized. A negative edge encountered later could lower a previously finalized distance, violating the greedy invariant. Use Bellman-Ford instead.",
      known: true,
    },
    {
      id: "fc-3",
      front: "What is the difference between Prim's and Kruskal's algorithms for Minimum Spanning Trees (MST)?",
      back: "Prim's grows a single tree vertex by vertex using a priority queue (better for dense graphs). Kruskal's adds edges globally in ascending weight order using a Disjoint Set (Union-Find) structure (better for sparse graphs).",
      known: false,
    },
    {
      id: "fc-4",
      front: "What condition must a heuristic function h(n) satisfy to guarantee that A* search is optimal?",
      back: "h(n) must be admissible (it never overestimates the actual cost from n to the goal). For graph search, it should also be consistent / monotonic (h(n) <= c(n, p) + h(p)).",
      known: false,
    },
  ],
};
