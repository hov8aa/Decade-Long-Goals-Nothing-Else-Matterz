import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HistoryScreen from './src/screens/HistoryScreen';
import TimerScreen from './src/screens/TimerScreen';
import TodayScreen from './src/screens/TodayScreen';
import {
  loadGoals,
  loadSessions,
  newId,
  saveGoals,
  saveSessions,
  SESSION_SECONDS,
  todayKey,
} from './src/storage';
import { colors, spacing } from './src/theme';
import { Goal, Session } from './src/types';

type Screen = 'today' | 'history' | 'timer';

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('today');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load stored data; resume a session still inside its 10-minute window,
  // finalize as incomplete anything older left open by a killed app.
  useEffect(() => {
    (async () => {
      const [g, s] = await Promise.all([loadGoals(), loadSessions()]);
      let resumeId: string | null = null;
      let changed = false;
      const fixed = s.map((sess) => {
        if (sess.endedAt !== null) return sess;
        if (Date.now() - sess.startedAt < SESSION_SECONDS * 1000) {
          resumeId = sess.id;
          return sess;
        }
        changed = true;
        return {
          ...sess,
          endedAt: sess.startedAt + SESSION_SECONDS * 1000,
          completed: false,
        };
      });
      setGoals(g);
      setSessions(fixed);
      if (changed) saveSessions(fixed);
      if (resumeId) {
        setActiveId(resumeId);
        setScreen('timer');
      }
      setReady(true);
    })();
  }, []);

  const startSession = useCallback(
    (title: string) => {
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
      const session: Session = {
        id: newId(),
        goalId: goal.id,
        goalTitle: goal.title,
        dateKey: todayKey(),
        startedAt: now,
        endedAt: null,
        completed: false,
      };
      const nextSessions = [...sessions, session];
      setGoals(nextGoals);
      setSessions(nextSessions);
      saveGoals(nextGoals);
      saveSessions(nextSessions);
      setActiveId(session.id);
      setScreen('timer');
    },
    [goals, sessions]
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

  const active = activeId ? sessions.find((s) => s.id === activeId) : null;
  const todaySessions = sessions.filter((s) => s.dateKey === todayKey());

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        {!ready ? null : screen === 'timer' && active ? (
          <TimerScreen
            session={active}
            onComplete={onComplete}
            onGiveUp={onGiveUp}
            onExit={onExit}
          />
        ) : (
          <>
            <View style={styles.tabs}>
              <Pressable onPress={() => setScreen('today')} style={styles.tab}>
                <Text
                  style={[styles.tabText, screen === 'today' && styles.tabActive]}
                >
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
            {screen === 'today' ? (
              <TodayScreen
                goals={goals}
                todaySessions={todaySessions}
                onStart={startSession}
              />
            ) : (
              <HistoryScreen sessions={sessions} onStart={startSession} />
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
