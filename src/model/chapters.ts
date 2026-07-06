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

export function commitChapter(
  chapters: Chapter[],
  wording: string,
  reasoning: string,
  now: number
): Chapter[] {
  throw new Error('not implemented');
}

export function liveChapter(chapters: Chapter[]): Chapter | null {
  throw new Error('not implemented');
}

export function evolve(
  chapters: Chapter[],
  wording: string,
  reasoning: string,
  now: number
): Chapter[] {
  throw new Error('not implemented');
}

export function currentVersion(chapter: Chapter): Version {
  throw new Error('not implemented');
}
