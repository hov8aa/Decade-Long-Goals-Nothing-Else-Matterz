export const COMMIT_HOLD_SECONDS = 10;
export const EVOLVE_TAPS = 10;
export const TAP_WINDOW_MS = 2000;

export function signatureMatches(goal: string, typed: string): boolean {
  return goal.trim() === typed.trim();
}

export interface HoldState {
  pressedAt: number | null;
  completed: boolean;
}

export const initialHold: HoldState = { pressedAt: null, completed: false };

export function holdPress(state: HoldState, t: number): HoldState {
  if (state.completed) return state;
  return { pressedAt: t, completed: false };
}

export function holdTick(state: HoldState, now: number): HoldState {
  if (state.completed || state.pressedAt === null) return state;
  if (now - state.pressedAt >= COMMIT_HOLD_SECONDS * 1000) {
    return { ...state, completed: true };
  }
  return state;
}

export function holdRelease(state: HoldState, t: number): HoldState {
  if (state.completed) return { ...state, pressedAt: null };
  if (state.pressedAt !== null && t - state.pressedAt >= COMMIT_HOLD_SECONDS * 1000) {
    return { pressedAt: null, completed: true };
  }
  return { pressedAt: null, completed: false };
}

export function holdProgressSeconds(state: HoldState, now: number): number {
  if (state.completed) return COMMIT_HOLD_SECONDS;
  if (state.pressedAt === null) return 0;
  return Math.min(
    COMMIT_HOLD_SECONDS,
    Math.floor((now - state.pressedAt) / 1000)
  );
}

export interface TapState {
  count: number;
  lastTapAt: number | null;
  awake: boolean;
}

export const initialTaps: TapState = { count: 0, lastTapAt: null, awake: false };

export function tap(state: TapState, t: number): TapState {
  if (state.awake) return { ...state, lastTapAt: t };
  const withinWindow =
    state.lastTapAt !== null && t - state.lastTapAt <= TAP_WINDOW_MS;
  const count = withinWindow ? state.count + 1 : 1;
  return { count, lastTapAt: t, awake: count >= EVOLVE_TAPS };
}
