import { Chapter, commitChapter, evolve } from '../chapters';
import {
  SESSION_SECONDS,
  Session,
  completeSession,
  doneCountForDay,
  finalizeDangling,
  giveUpSession,
  startSession,
  todayKey,
} from '../sessions';

const T0 = 1_783_300_000_000;

function live(): Chapter {
  const evolved = evolve(
    commitChapter([], 'Master my craft', 'why', T0),
    'Master my craft, own my time',
    'why v2',
    T0 + 1000
  );
  return evolved[0];
}

function freshSession(now = T0 + 5000): Session {
  return startSession({
    goalId: 'g1',
    goalTitle: 'Draft outreach',
    live: live(),
    now,
    id: 's1',
  });
}

describe('todayKey', () => {
  test('formats a local YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 6, 6))).toBe('2026-07-06');
  });

  test('pads month and day', () => {
    expect(todayKey(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('R14 — sessions snapshot the north star', () => {
  test('a new session records chapter, wording, and version at start', () => {
    const s = freshSession();
    expect(s.chapterId).toBe(live().id);
    expect(s.servedWording).toBe('Master my craft, own my time');
    expect(s.servedVersion).toBe(2);
    expect(s.endedAt).toBeNull();
    expect(s.completed).toBe(false);
  });
});

describe('R12 + R16 — completion and surrender', () => {
  test('completing marks the session done', () => {
    const s = freshSession();
    const done = completeSession([s], 's1', s.startedAt + SESSION_SECONDS * 1000);
    expect(done[0].completed).toBe(true);
    expect(done[0].endedAt).toBe(s.startedAt + SESSION_SECONDS * 1000);
  });

  test('giving up records the moment of surrender', () => {
    const s = freshSession();
    const gaveUp = giveUpSession([s], 's1', s.startedAt + 192_000);
    expect(gaveUp[0].completed).toBe(false);
    expect(gaveUp[0].endedAt).toBe(s.startedAt + 192_000);
  });
});

describe('R15 — dangling sessions', () => {
  test('inside the window: resume, untouched', () => {
    const s = freshSession(T0);
    const r = finalizeDangling([s], T0 + 300_000);
    expect(r.resumeId).toBe('s1');
    expect(r.changed).toBe(false);
    expect(r.sessions[0].endedAt).toBeNull();
  });

  test('past the window: finalized incomplete at start + 600s', () => {
    const s = freshSession(T0);
    const r = finalizeDangling([s], T0 + SESSION_SECONDS * 1000 + 1);
    expect(r.resumeId).toBeNull();
    expect(r.changed).toBe(true);
    expect(r.sessions[0].completed).toBe(false);
    expect(r.sessions[0].endedAt).toBe(T0 + SESSION_SECONDS * 1000);
  });

  test('already-ended sessions are untouched', () => {
    const s = completeSession([freshSession(T0)], 's1', T0 + 600_000)[0];
    const r = finalizeDangling([s], T0 + 900_000);
    expect(r.changed).toBe(false);
    expect(r.sessions[0]).toEqual(s);
  });
});

describe('R13 — fresh start daily', () => {
  test('counts only completed sessions of the given day', () => {
    const a = completeSession([freshSession(T0)], 's1', T0 + 600_000)[0];
    const b = { ...a, id: 's2', completed: false };
    const c = { ...a, id: 's3', dateKey: '1999-01-01' };
    expect(doneCountForDay([a, b, c], a.dateKey)).toBe(1);
  });
});
