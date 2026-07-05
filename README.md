# 10MinutesGoals

a simple app for focussed work

The core is **10 Decade-Long Goals**: name up to ten goals you want to hold for a decade. The 10-minute session is the bare-minimum unit of action that keeps one of them alive today. Pick a decade goal, do 10 minutes toward it, nothing else matters.

(How the project got here — including its own gaps — is in [EVOLUTION.md](EVOLUTION.md).)

## What it does

- **Decade goals** — the spine. At most ten, named before anything else.
- **Today** — fresh start every day. Pick a decade goal, type a 10-minute goal (or pick up a past one), hit Start.
- **Timer** — a full-screen 10-minute countdown showing which decade goal it serves. Finish it or give up; both get recorded.
- **History** — every session, day by day, tagged with its decade goal. Tap any past goal to run it again.

Single player, no login, no backend — everything lives on your device.

## Run it

Built with [Expo](https://expo.dev) (SDK 56) — one codebase for iOS, Android, and web.

```bash
npm install
npm run web        # in the browser
npm start          # scan the QR with Expo Go for phone
```
