import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chapter } from './model/chapters';
import { Session } from './model/sessions';
import { Goal } from './types';

const CHAPTERS_KEY = '10mg.chapters';
const GOALS_KEY = '10mg.goals';
const SESSIONS_KEY = '10mg.sessions';

async function loadList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function loadChapters(): Promise<Chapter[]> {
  return loadList<Chapter>(CHAPTERS_KEY);
}

export function saveChapters(chapters: Chapter[]): Promise<void> {
  return AsyncStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
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
