import {
  COMMIT_HOLD_SECONDS,
  EVOLVE_TAPS,
  TAP_WINDOW_MS,
  holdPress,
  holdProgressSeconds,
  holdRelease,
  holdTick,
  initialHold,
  initialTaps,
  signatureMatches,
  tap,
} from '../ceremony';
import { SESSION_SECONDS } from '../sessions';

const T0 = 1_783_300_000_000;

describe('R19 — the rule of tens', () => {
  test('constants', () => {
    expect(COMMIT_HOLD_SECONDS).toBe(10);
    expect(EVOLVE_TAPS).toBe(10);
    expect(SESSION_SECONDS).toBe(600);
  });
});

describe('R7 — the signature', () => {
  test('exact retype matches', () => {
    expect(signatureMatches('Master my craft', 'Master my craft')).toBe(true);
  });

  test('surrounding whitespace is forgiven', () => {
    expect(signatureMatches('Master my craft', '  Master my craft ')).toBe(true);
  });

  test('case mismatch is rejected', () => {
    expect(signatureMatches('Master my craft', 'master my craft')).toBe(false);
  });

  test('partial retype is rejected', () => {
    expect(signatureMatches('Master my craft', 'Master my cra')).toBe(false);
  });
});

describe('R8 — the hold', () => {
  test('holding 9.9 seconds is not commitment', () => {
    let s = holdPress(initialHold, T0);
    s = holdTick(s, T0 + 9_900);
    expect(s.completed).toBe(false);
  });

  test('holding 10 seconds completes', () => {
    let s = holdPress(initialHold, T0);
    s = holdTick(s, T0 + 10_000);
    expect(s.completed).toBe(true);
  });

  test('early release resets to zero', () => {
    let s = holdPress(initialHold, T0);
    s = holdRelease(s, T0 + 5_000);
    expect(s.completed).toBe(false);
    expect(s.pressedAt).toBeNull();
    expect(holdProgressSeconds(s, T0 + 5_000)).toBe(0);
  });

  test('progress reports seconds held, capped at 10', () => {
    const s = holdPress(initialHold, T0);
    expect(holdProgressSeconds(s, T0 + 4_000)).toBe(4);
    expect(holdProgressSeconds(s, T0 + 60_000)).toBe(10);
  });

  test('release after completion stays completed', () => {
    let s = holdPress(initialHold, T0);
    s = holdTick(s, T0 + 10_000);
    s = holdRelease(s, T0 + 10_500);
    expect(s.completed).toBe(true);
  });
});

describe('R11 — ten taps wake evolve', () => {
  function tapTimes(n: number, gapMs: number) {
    let s = initialTaps;
    for (let i = 0; i < n; i++) s = tap(s, T0 + i * gapMs);
    return s;
  }

  test('nine quick taps do not wake it', () => {
    const s = tapTimes(9, 300);
    expect(s.awake).toBe(false);
    expect(s.count).toBe(9);
  });

  test('ten quick taps wake it', () => {
    expect(tapTimes(10, 300).awake).toBe(true);
  });

  test('a pause longer than the window resets the count', () => {
    let s = tapTimes(7, 300);
    s = tap(s, T0 + 6 * 300 + TAP_WINDOW_MS + 1);
    expect(s.count).toBe(1);
    expect(s.awake).toBe(false);
  });

  test('taps exactly at the window edge still count', () => {
    let s = tap(initialTaps, T0);
    s = tap(s, T0 + TAP_WINDOW_MS);
    expect(s.count).toBe(2);
  });

  test('once awake it stays awake', () => {
    let s = tapTimes(10, 300);
    s = tap(s, T0 + 100_000);
    expect(s.awake).toBe(true);
  });
});
