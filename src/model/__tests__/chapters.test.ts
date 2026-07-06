import {
  Chapter,
  commitChapter,
  currentVersion,
  evolve,
  liveChapter,
} from '../chapters';

const T0 = 1_783_300_000_000;

function committed(): Chapter[] {
  return commitChapter([], 'Master my craft', 'Rented time built nothing.', T0);
}

describe('R3 — birth requires reasoning', () => {
  test('committing creates one chapter with version 1', () => {
    const chapters = committed();
    expect(chapters).toHaveLength(1);
    expect(chapters[0].closedAt).toBeNull();
    expect(chapters[0].startedAt).toBe(T0);
    expect(chapters[0].versions).toHaveLength(1);
    expect(chapters[0].versions[0]).toEqual({
      wording: 'Master my craft',
      reasoning: 'Rented time built nothing.',
      since: T0,
    });
  });

  test('empty wording is rejected', () => {
    expect(() => commitChapter([], '   ', 'why', T0)).toThrow();
  });

  test('empty reasoning is rejected', () => {
    expect(() => commitChapter([], 'A goal', '  ', T0)).toThrow();
  });
});

describe('R1 — one live chapter, enforced by code', () => {
  test('committing while a live chapter exists is an error', () => {
    const chapters = committed();
    expect(() => commitChapter(chapters, 'Second goal', 'why', T0 + 1)).toThrow();
  });

  test('liveChapter returns null when nothing exists', () => {
    expect(liveChapter([])).toBeNull();
  });

  test('liveChapter returns the open chapter', () => {
    const chapters = committed();
    expect(liveChapter(chapters)?.id).toBe(chapters[0].id);
  });

  test('two open chapters is a corrupt timeline and throws', () => {
    const a = committed()[0];
    const b = { ...a, id: 'other' };
    expect(() => liveChapter([a, b])).toThrow();
  });
});

describe('R2 + R4 — evolution appends, never mutates', () => {
  test('evolve appends version 2 to the live chapter', () => {
    const t1 = T0 + 86_400_000;
    const next = evolve(committed(), 'Master my craft, own my time', 'Craft alone was not the point.', t1);
    expect(next[0].versions).toHaveLength(2);
    expect(next[0].versions[1]).toEqual({
      wording: 'Master my craft, own my time',
      reasoning: 'Craft alone was not the point.',
      since: t1,
    });
  });

  test('version 1 is untouched after evolution', () => {
    const before = committed();
    const v1 = { ...before[0].versions[0] };
    const next = evolve(before, 'New wording', 'why', T0 + 1);
    expect(next[0].versions[0]).toEqual(v1);
  });

  test('evolve does not mutate its input', () => {
    const before = committed();
    evolve(before, 'New wording', 'why', T0 + 1);
    expect(before[0].versions).toHaveLength(1);
  });

  test('evolution without reasoning is rejected', () => {
    expect(() => evolve(committed(), 'New wording', '', T0 + 1)).toThrow();
  });

  test('evolution with no live chapter is rejected', () => {
    expect(() => evolve([], 'New wording', 'why', T0)).toThrow();
  });

  test('currentVersion is the latest', () => {
    const next = evolve(committed(), 'v2 wording', 'why', T0 + 1);
    expect(currentVersion(next[0]).wording).toBe('v2 wording');
  });
});
