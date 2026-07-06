export interface Version {
  wording: string;
  reasoning: string;
  since: number;
}

export interface Chapter {
  id: string;
  startedAt: number;
  closedAt: number | null;
  versions: Version[];
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function requiredText(value: string, what: string): string {
  const t = value.trim();
  if (!t) throw new Error(`${what} is required`);
  return t;
}

export function commitChapter(
  chapters: Chapter[],
  wording: string,
  reasoning: string,
  now: number
): Chapter[] {
  const w = requiredText(wording, 'wording');
  const r = requiredText(reasoning, 'reasoning');
  if (liveChapter(chapters) !== null) {
    throw new Error('a live chapter already exists — the decade evolves, it is not replaced');
  }
  // A chapter's identity is its birth moment — deterministic, and unique
  // within any one timeline since only one chapter can open at a time.
  const chapter: Chapter = {
    id: 'ch' + now.toString(36),
    startedAt: now,
    closedAt: null,
    versions: [{ wording: w, reasoning: r, since: now }],
  };
  return [...chapters, chapter];
}

export function liveChapter(chapters: Chapter[]): Chapter | null {
  const open = chapters.filter((c) => c.closedAt === null);
  if (open.length > 1) {
    throw new Error('corrupt timeline: more than one live chapter');
  }
  return open[0] ?? null;
}

export function evolve(
  chapters: Chapter[],
  wording: string,
  reasoning: string,
  now: number
): Chapter[] {
  const w = requiredText(wording, 'wording');
  const r = requiredText(reasoning, 'reasoning');
  const live = liveChapter(chapters);
  if (!live) throw new Error('no live chapter to evolve');
  const updated: Chapter = {
    ...live,
    versions: [...live.versions, { wording: w, reasoning: r, since: now }],
  };
  return chapters.map((c) => (c.id === live.id ? updated : c));
}

export function currentVersion(chapter: Chapter): Version {
  return chapter.versions[chapter.versions.length - 1];
}
