import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Chapter,
  commitChapter,
  evolve,
  liveChapter,
  newId,
} from './src/model/chapters';
import {
  Session,
  finalizeDangling,
  startSession,
  todayKey,
} from './src/model/sessions';
import CeremonyScreen from './src/screens/CeremonyScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import NorthStarScreen from './src/screens/NorthStarScreen';
import TimerScreen from './src/screens/TimerScreen';
import TodayScreen from './src/screens/TodayScreen';
import {
  loadChapters,
  loadGoals,
  loadSessions,
  saveChapters,
  saveGoals,
  saveSessions,
} from './src/storage';
import { colors, spacing } from './src/theme';
import { Goal } from './src/types';

type Screen = 'loading' | 'ceremony' | 'today' | 'history' | 'northstar' | 'timer';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [c, g, s] = await Promise.all([
        loadChapters(),
        loadGoals(),
        loadSessions(),
      ]);
      const fixed = finalizeDangling(s, Date.now());
      setChapters(c);
      setGoals(g);
      setSessions(fixed.sessions);
      if (fixed.changed) saveSessions(fixed.sessions);
      if (fixed.resumeId) {
        setActiveId(fixed.resumeId);
        setScreen('timer');
      } else if (liveChapter(c) === null) {
        setScreen('ceremony');
      } else {
        setScreen('today');
      }
    })();
  }, []);

  const onCommit = useCallback(
    (wording: string, reasoning: string) => {
      const next = commitChapter(chapters, wording, reasoning, Date.now());
      setChapters(next);
      saveChapters(next);
      setScreen('today');
    },
    [chapters]
  );

  const onEvolve = useCallback(
    (wording: string, reasoning: string) => {
      const next = evolve(chapters, wording, reasoning, Date.now());
      setChapters(next);
      saveChapters(next);
    },
    [chapters]
  );

  const startSessionUI = useCallback(
    (title: string) => {
      const live = liveChapter(chapters);
      if (!live) return;
      const now = Date.now();
      let goal = goals.find(
        (g) => g.title.toLowerCase() === title.trim().toLowerCase()
      );
      let nextGoals: Goal[];
      if (goal) {
        goal = { ...goal, lastUsedAt: now };
        nextGoals = goals.map((g) => (g.id === goal!.id ? goal! : g));
      } else {
        goal = { id: newId(), title: title.trim(), createdAt: now, lastUsedAt: now };
        nextGoals = [...goals, goal];
      }
      const session = startSession({
        goalId: goal.id,
        goalTitle: goal.title,
        live,
        now,
        id: newId(),
      });
      const nextSessions = [...sessions, session];
      setGoals(nextGoals);
      setSessions(nextSessions);
      saveGoals(nextGoals);
      saveSessions(nextSessions);
      setActiveId(session.id);
      setScreen('timer');
    },
    [chapters, goals, sessions]
  );

  const finishActive = useCallback(
    (completed: boolean) => {
      if (!activeId) return;
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === activeId ? { ...s, endedAt: Date.now(), completed } : s
        );
        saveSessions(next);
        return next;
      });
    },
    [activeId]
  );

  const onComplete = useCallback(() => finishActive(true), [finishActive]);
  const onGiveUp = useCallback(() => {
    finishActive(false);
    setActiveId(null);
    setScreen('today');
  }, [finishActive]);
  const onExit = useCallback(() => {
    setActiveId(null);
    setScreen('today');
  }, []);

  const live = screen === 'loading' ? null : liveChapter(chapters);
  const active = activeId ? sessions.find((s) => s.id === activeId) : null;
  const todaySessions = sessions.filter((s) => s.dateKey === todayKey());

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        {screen === 'loading' ? null : screen === 'ceremony' ? (
          <CeremonyScreen onCommit={onCommit} />
        ) : screen === 'timer' && active ? (
          <TimerScreen
            session={active}
            onComplete={onComplete}
            onGiveUp={onGiveUp}
            onExit={onExit}
          />
        ) : screen === 'northstar' && live ? (
          <NorthStarScreen
            chapter={live}
            onEvolve={onEvolve}
            onBack={() => setScreen('today')}
          />
        ) : (
          <>
            <View style={styles.tabs}>
              <Pressable onPress={() => setScreen('today')} style={styles.tab}>
                <Text style={[styles.tabText, screen === 'today' && styles.tabActive]}>
                  Today
                </Text>
              </Pressable>
              <Pressable onPress={() => setScreen('history')} style={styles.tab}>
                <Text
                  style={[styles.tabText, screen === 'history' && styles.tabActive]}
                >
                  History
                </Text>
              </Pressable>
            </View>
            {screen === 'today' && live ? (
              <TodayScreen
                chapter={live}
                goals={goals}
                todaySessions={todaySessions}
                onStart={startSessionUI}
                onOpenNorthStar={() => setScreen('northstar')}
              />
            ) : (
              <HistoryScreen
                sessions={sessions}
                chapters={chapters}
                onStart={startSessionUI}
              />
            )}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabs: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tab: { paddingVertical: spacing.sm },
  tabText: { color: colors.dim, fontSize: 16, fontWeight: '600' },
  tabActive: { color: colors.text },
});
