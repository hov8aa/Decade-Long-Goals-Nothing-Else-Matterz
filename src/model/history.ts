import { Chapter } from './chapters';
import { Session } from './sessions';

export type HistoryItem =
  | { kind: 'session'; at: number; session: Session }
  | {
      kind: 'evolution';
      at: number;
      chapterId: string;
      fromWording: string;
      toWording: string;
      reasoning: string;
      toVersion: number;
    };

export function buildHistory(
  sessions: Session[],
  chapters: Chapter[]
): HistoryItem[] {
  throw new Error('not implemented');
}

export function groupByDay(
  items: HistoryItem[]
): { dateKey: string; items: HistoryItem[] }[] {
  throw new Error('not implemented');
}
