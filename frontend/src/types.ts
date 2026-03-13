export interface Attempt {
  id: number;
  problem: number;
  solved_at: string;
  status: 'OWN' | 'PARTIAL' | 'HINT' | 'FAILED';
  notes: string | null;
}

export interface Problem {
  id: number;
  problem_name: string;
  pattern: number;
  difficulty: 'HARD' | 'MEDIUM' | 'EASY';
  link: string;
  reminder: string | null;
  notes: string | null;
  latest_attempt: Attempt | null;
}

export interface Pattern {
  id: number;
  pattern: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'BLIND';
  notes: string | null;
  problems_solved: number;
}

export interface DashboardData {
  total_problems: number;
  by_pattern: { pattern: string; problem_count: number; confidence: string }[];
  by_difficulty: { difficulty: string; count: number }[];
  by_status: { status: string; count: number }[];
  due_for_revision: { id: number; problem_name: string; difficulty: string; reminder: string }[];
  recent_attempts: { problem__problem_name: string; status: string; solved_at: string }[];
  weak_patterns: { pattern: string; confidence: string }[];
}
