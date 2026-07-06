import { commitChapter, evolve } from '../chapters';
import { buildHistory, groupByDay } from '../history';
import { Session, startSession } from '../sessions';

const T0 = new Date(2026, 6, 1, 9, 0, 0).getTime();
const DAY = 86_400_000;

function fixture() {
  const chapters = evolve(
    commitChapter([], 'Master my craft', 'first why', T0),
    'Master my craft, own my time',
    'evolved why',
    T0 + 2 * DAY
  );
  const live = chapters[0];
  const s1: Session = startSession({
    goalId: 'g1',
    goalTitle: 'Draft outreach',
    live: { ...live, versions: [live.versions[0]] },
    now: T0 + 1 * DAY,
    id: 's1',
  });
  const s2: Session = startSession({
    goalId: 'g1',
    goalTitle: 'Draft outreach',
    live,
    now: T0 + 3 * DAY,
    id: 's2',
  });
  return { chapters, sessions: [s1, s2] };
}

describe('R17 — one river', () => {
  test('sessions and evolutions interleave, newest first', () => {
    const { chapters, sessions } = fixture();
    const items = buildHistory(sessions, chapters);
    expect(items.map((i) => i.kind)).toEqual(['session', 'evolution', 'session']);
    expect(items[0].at).toBeGreaterThan(items[1].at);
    expect(items[1].at).toBeGreaterThan(items[2].at);
  });

  test('the evolution event carries both wordings and the reasoning', () => {
    const { chapters, sessions } = fixture();
    const evo = buildHistory(sessions, chapters).find((i) => i.kind === 'evolution');
    expect(evo).toMatchObject({
      fromWording: 'Master my craft',
      toWording: 'Master my craft, own my time',
      reasoning: 'evolved why',
      toVersion: 2,
    });
  });

  test('the first version is a commitment, not an evolution — no event', () => {
    const chapters = commitChapter([], 'A goal', 'why', T0);
    expect(buildHistory([], chapters)).toHaveLength(0);
  });

  test('groupByDay groups newest day first', () => {
    const { chapters, sessions } = fixture();
    const groups = groupByDay(buildHistory(sessions, chapters));
    expect(groups).toHaveLength(3);
    expect(groups[0].dateKey > groups[1].dateKey).toBe(true);
    expect(groups[1].dateKey > groups[2].dateKey).toBe(true);
  });
});
