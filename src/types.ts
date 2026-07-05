// The spine: at most ten of these, each meant to hold for a decade.
export interface DecadeGoal {
  id: string;
  title: string;
  createdAt: number;
}

// A recurring 10-minute goal — the bare-minimum unit of action
// that keeps a decade goal alive today.
export interface Goal {
  id: string;
  title: string;
  createdAt: number;
  lastUsedAt: number;
  decadeGoalId?: string; // absent only on v0.1 data; adopted on next use
}

export interface Session {
  id: string;
  goalId: string;
  goalTitle: string;
  decadeGoalId?: string;
  decadeGoalTitle?: string;
  dateKey: string; // local date "YYYY-MM-DD"
  startedAt: number;
  endedAt: number | null;
  completed: boolean;
}
