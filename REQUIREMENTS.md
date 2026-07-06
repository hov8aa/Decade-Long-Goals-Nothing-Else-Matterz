# Requirements — v0.3 "The North Star"

One protagonist. One decade-long goal. 10-minute sessions serve it. Everything below is testable; test IDs map to `src/model/__tests__/`.

## 1. Core model — the timeline

- **R1 — One live chapter, enforced by code.** Storage is an ordered list of decade chapters. At most one chapter is live (`closedAt: null`). Committing while a live chapter exists is an error. The code cannot represent two live decades.
- **R2 — Versions are append-only.** A chapter carries `versions: [{wording, reasoning, since}]`. Old versions are never mutated or deleted.
- **R3 — Birth requires reasoning.** Committing the first chapter requires both a non-empty wording and non-empty reasoning (v1 of the trail).
- **R4 — Evolution, not replacement.** Evolving appends a new version to the live chapter; reasoning is mandatory; prior versions stay intact.
- **R5 — Only the decade goal owns time.** No other entity (10-minute goals, sessions) carries a deadline.

## 2. The commitment ceremony (three acts)

- **R6 — Terms → signature → hold**, in that order; no act skippable.
- **R7 — The signature.** The protagonist retypes the goal exactly (surrounding whitespace forgiven, case and content not).
- **R8 — The hold.** Ten continuous seconds. Early release resets progress to zero. Completion only at ≥ 10s held.
- **R9 — The terms state the evolve rule once** (10 taps, reasoning required, never resets). It is never advertised again.

## 3. The evolve ritual

- **R10 — Seeing is cheap.** One tap on the Today header opens the north star view with the full version trail.
- **R11 — Changing is expensive.** The evolve form wakes only after 10 taps; a pause longer than 2 s between taps resets the counter; progress becomes visible (dots) as taps accumulate.

## 4. Sessions and Today (carried from v0.2)

- **R12 — Sessions are 600 fixed seconds**, computed from timestamps (drift-free, survives backgrounding).
- **R13 — Fresh start daily.** Today shows only today's sessions; the count is completed sessions today.
- **R14 — Sessions snapshot the north star.** Each session records the chapter id, the wording at start, and the version index — history stays truthful across evolutions.
- **R15 — Dangling sessions.** On load: still inside its 10-minute window → resume; past it → finalized incomplete with `endedAt = startedAt + 600s`.
- **R16 — Giving up is recorded**, `completed: false`, with the moment of surrender.

## 5. History — one river

- **R17 — Sessions and evolutions interleave**, newest first, grouped by day. Session rows show ✓/✗, start time, duration or give-up point, and the served wording + version. Evolution events show `vN → vN+1`, the reasoning, the date. The first version is a commitment, not an evolution — it produces no event.

## 6. Invisibility

- **R18 — The protagonist sees one decade.** No UI for other slots, succession, related goals, or milestones. The timeline exists in storage so succession is a future append, never a migration.

## 7. The rule of tens

- **R19 —** 10 seconds to commit · 10 taps to evolve · 10 minutes to act · 10 years to arrive. Constants: `COMMIT_HOLD_SECONDS = 10`, `EVOLVE_TAPS = 10`, `SESSION_SECONDS = 600`.

## Out of scope (v0.4+)

Succession ceremony, related goals (full web, reasoned links), milestones, multi-protagonist, push, app-store builds.
