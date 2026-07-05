import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { SESSION_SECONDS } from '../storage';
import { colors, spacing } from '../theme';
import { Session } from '../types';

interface Props {
  session: Session;
  onComplete: () => void;
  onGiveUp: () => void;
  onExit: () => void;
}

export default function TimerScreen({ session, onComplete, onGiveUp, onExit }: Props) {
  useKeepAwake();
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, session.startedAt + SESSION_SECONDS * 1000 - Date.now())
  );
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const left = session.startedAt + SESSION_SECONDS * 1000 - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        if (!completedRef.current) {
          completedRef.current = true;
          Vibration.vibrate(500);
          setDone(true);
          onComplete();
        }
        return;
      }
      setRemainingMs(left);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [session.startedAt, onComplete]);

  const totalSec = Math.ceil(remainingMs / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const progress = 1 - remainingMs / (SESSION_SECONDS * 1000);

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.doneEmoji}>✅</Text>
        <Text style={styles.doneTitle}>10 minutes. Done.</Text>
        <Text style={styles.goal}>{session.goalTitle}</Text>
        <Pressable style={styles.primaryBtn} onPress={onExit}>
          <Text style={styles.primaryBtnText}>Back to Today</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {session.decadeGoalTitle ? (
        <Text style={styles.decade}>{session.decadeGoalTitle}</Text>
      ) : null}
      <Text style={styles.goal}>{session.goalTitle}</Text>
      <Text style={styles.clock}>
        {mm}:{ss}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
      <Text style={styles.hint}>Nothing else matters for 10 minutes.</Text>
      <Pressable style={styles.giveUpBtn} onPress={onGiveUp}>
        <Text style={styles.giveUpText}>Give up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  decade: {
    color: colors.accent,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  goal: {
    color: colors.dim,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  clock: {
    color: colors.text,
    fontSize: 80,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.lg,
  },
  track: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  fill: { height: '100%', backgroundColor: colors.accent },
  hint: { color: colors.dim, fontSize: 14, marginBottom: spacing.xl },
  giveUpBtn: { padding: spacing.md },
  giveUpText: { color: colors.danger, fontSize: 15 },
  doneEmoji: { fontSize: 56, marginBottom: spacing.md },
  doneTitle: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
  },
  primaryBtnText: { color: '#04130A', fontWeight: '700', fontSize: 16 },
});
