import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Session } from './types';

const GOALS_KEY = '10mg.goals';
const SESSIONS_KEY = '10mg.sessions';

// Session length in seconds. Drop to e.g. 10 for quick manual testing.
export const SESSION_SECONDS = 600;

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function loadList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function loadGoals(): Promise<Goal[]> {
  return loadList<Goal>(GOALS_KEY);
}

export function saveGoals(goals: Goal[]): Promise<void> {
  return AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function loadSessions(): Promise<Session[]> {
  return loadList<Session>(SESSIONS_KEY);
}

export function saveSessions(sessions: Session[]): Promise<void> {
  return AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
