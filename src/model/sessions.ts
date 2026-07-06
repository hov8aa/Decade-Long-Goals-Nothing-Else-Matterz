import { Chapter } from './chapters';

export const SESSION_SECONDS = 600;

export interface Session {
  id: string;
  goalId: string;
  goalTitle: string;
  chapterId: string;
  servedWording: string;
  servedVersion: number;
  dateKey: string; // local date "YYYY-MM-DD"
  startedAt: number;
  endedAt: number | null;
  completed: boolean;
}

export function todayKey(d?: Date): string {
  throw new Error('not implemented');
}

export function startSession(args: {
  goalId: string;
  goalTitle: string;
  live: Chapter;
  now: number;
  id: string;
}): Session {
  throw new Error('not implemented');
}

export function completeSession(
  sessions: Session[],
  id: string,
  now: number
): Session[] {
  throw new Error('not implemented');
}

export function giveUpSession(
  sessions: Session[],
  id: string,
  now: number
): Session[] {
  throw new Error('not implemented');
}

export function finalizeDangling(
  sessions: Session[],
  now: number
): { sessions: Session[]; resumeId: string | null; changed: boolean } {
  throw new Error('not implemented');
}

export function doneCountForDay(sessions: Session[], dateKey: string): number {
  throw new Error('not implemented');
}
