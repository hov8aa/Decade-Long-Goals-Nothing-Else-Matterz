import { Chapter } from './chapters';
import { Session, todayKey } from './sessions';

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
  const items: HistoryItem[] = sessions.map((s) => ({
    kind: 'session' as const,
    at: s.startedAt,
    session: s,
  }));
  for (const chapter of chapters) {
    // versions[0] is the commitment, not an evolution — no event for it
    for (let i = 1; i < chapter.versions.length; i++) {
      items.push({
        kind: 'evolution',
        at: chapter.versions[i].since,
        chapterId: chapter.id,
        fromWording: chapter.versions[i - 1].wording,
        toWording: chapter.versions[i].wording,
        reasoning: chapter.versions[i].reasoning,
        toVersion: i + 1,
      });
    }
  }
  return items.sort((a, b) => b.at - a.at);
}

export function groupByDay(
  items: HistoryItem[]
): { dateKey: string; items: HistoryItem[] }[] {
  const byDay = new Map<string, HistoryItem[]>();
  for (const item of items) {
    const key = todayKey(new Date(item.at));
    const list = byDay.get(key);
    if (list) list.push(item);
    else byDay.set(key, [item]);
  }
  return [...byDay.entries()]
    .map(([dateKey, dayItems]) => ({ dateKey, items: dayItems }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
