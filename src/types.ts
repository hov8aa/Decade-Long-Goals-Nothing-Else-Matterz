export interface Goal {
  id: string;
  title: string;
  createdAt: number;
  lastUsedAt: number;
}

export interface Session {
  id: string;
  goalId: string;
  goalTitle: string;
  dateKey: string; // local date "YYYY-MM-DD"
  startedAt: number;
  endedAt: number | null;
  completed: boolean;
}
