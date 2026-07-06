import { Chapter, currentVersion } from './chapters';

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

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startSession(args: {
  goalId: string;
  goalTitle: string;
  live: Chapter;
  now: number;
  id: string;
}): Session {
  const { goalId, goalTitle, live, now, id } = args;
  const version = currentVersion(live);
  return {
    id,
    goalId,
    goalTitle,
    chapterId: live.id,
    servedWording: version.wording,
    servedVersion: live.versions.length,
    dateKey: todayKey(new Date(now)),
    startedAt: now,
    endedAt: null,
    completed: false,
  };
}

function endSession(
  sessions: Session[],
  id: string,
  now: number,
  completed: boolean
): Session[] {
  return sessions.map((s) =>
    s.id === id ? { ...s, endedAt: now, completed } : s
  );
}

export function completeSession(
  sessions: Session[],
  id: string,
  now: number
): Session[] {
  return endSession(sessions, id, now, true);
}

export function giveUpSession(
  sessions: Session[],
  id: string,
  now: number
): Session[] {
  return endSession(sessions, id, now, false);
}

export function finalizeDangling(
  sessions: Session[],
  now: number
): { sessions: Session[]; resumeId: string | null; changed: boolean } {
  let resumeId: string | null = null;
  let changed = false;
  const out = sessions.map((s) => {
    if (s.endedAt !== null) return s;
    if (now - s.startedAt < SESSION_SECONDS * 1000) {
      resumeId = s.id;
      return s;
    }
    changed = true;
    return { ...s, endedAt: s.startedAt + SESSION_SECONDS * 1000, completed: false };
  });
  return { sessions: changed ? out : sessions, resumeId, changed };
}

export function doneCountForDay(sessions: Session[], dateKey: string): number {
  return sessions.filter((s) => s.completed && s.dateKey === dateKey).length;
}
