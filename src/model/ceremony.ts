export const COMMIT_HOLD_SECONDS = 10;
export const EVOLVE_TAPS = 10;
export const TAP_WINDOW_MS = 2000;

export function signatureMatches(goal: string, typed: string): boolean {
  throw new Error('not implemented');
}

export interface HoldState {
  pressedAt: number | null;
  completed: boolean;
}

export const initialHold: HoldState = { pressedAt: null, completed: false };

export function holdPress(state: HoldState, t: number): HoldState {
  throw new Error('not implemented');
}

export function holdTick(state: HoldState, now: number): HoldState {
  throw new Error('not implemented');
}

export function holdRelease(state: HoldState, t: number): HoldState {
  throw new Error('not implemented');
}

export function holdProgressSeconds(state: HoldState, now: number): number {
  throw new Error('not implemented');
}

export interface TapState {
  count: number;
  lastTapAt: number | null;
  awake: boolean;
}

export const initialTaps: TapState = { count: 0, lastTapAt: null, awake: false };

export function tap(state: TapState, t: number): TapState {
  throw new Error('not implemented');
}
