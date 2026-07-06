import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import {
  COMMIT_HOLD_SECONDS,
  HoldState,
  holdPress,
  holdProgressSeconds,
  holdRelease,
  holdTick,
  initialHold,
  signatureMatches,
} from '../model/ceremony';
import { colors, spacing } from '../theme';

type Act = 'write' | 'terms' | 'sign' | 'hold';

interface Props {
  onCommit: (wording: string, reasoning: string) => void;
}

export default function CeremonyScreen({ onCommit }: Props) {
  const [act, setAct] = useState<Act>('write');
  const [wording, setWording] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [typed, setTyped] = useState('');
  const [hold, setHold] = useState<HoldState>(initialHold);
  const committedRef = useRef(false);

  const goal = wording.trim();
  const signed = signatureMatches(goal, typed);
  const heldSeconds = holdProgressSeconds(hold, Date.now());

  useEffect(() => {
    if (act !== 'hold' || hold.pressedAt === null || hold.completed) return;
    const id = setInterval(() => {
      // spread forces a new reference so the held-seconds display re-renders
      setHold((h) => ({ ...holdTick(h, Date.now()) }));
    }, 100);
    return () => clearInterval(id);
  }, [act, hold.pressedAt, hold.completed]);

  useEffect(() => {
    if (hold.completed && !committedRef.current) {
      committedRef.current = true;
      Vibration.vibrate(400);
      onCommit(goal, reasoning.trim());
    }
  }, [hold.completed, goal, reasoning, onCommit]);

  const year = new Date().getFullYear();

  if (act === 'write') {
    const dateLabel = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return (
      <View style={styles.container}>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.heading}>Start with the decade.</Text>
        <Text style={styles.dim}>
          One goal, held for ten years. Every 10-minute session exists to serve
          it.
        </Text>
        <TextInput
          style={styles.input}
          value={wording}
          onChangeText={setWording}
          placeholder="Your decade-long goal"
          placeholderTextColor={colors.dim}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          value={reasoning}
          onChangeText={setReasoning}
          placeholder="Why this goal — the reasoning stays with it forever"
          placeholderTextColor={colors.dim}
          multiline
        />
        <Pressable
          style={[styles.outlineBtn, !(goal && reasoning.trim()) && styles.disabled]}
          disabled={!(goal && reasoning.trim())}
          onPress={() => setAct('terms')}
        >
          <Text style={styles.outlineBtnText}>Begin the commitment</Text>
        </Pressable>
      </View>
    );
  }

  if (act === 'terms') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>THE TERMS</Text>
        <TermRow label="Entry price" value="3,653 days of your one life" note="charged whether you commit or not" />
        <TermRow label="Daily minimum" value="10 minutes · 1/144 of a day" />
        <TermRow label="Return" value="×100 — paid only on persistence" accent />
        <TermRow label="Refunds" value="None. The decade passes regardless." last />
        <Pressable style={styles.outlineBtn} onPress={() => setAct('sign')}>
          <Text style={styles.outlineBtnText}>I accept the terms</Text>
        </Pressable>
        <Pressable style={styles.quiet} onPress={() => setAct('write')}>
          <Text style={styles.quietText}>Not yet — take me back</Text>
        </Pressable>
      </View>
    );
  }

  if (act === 'sign') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.label}>SIGN IT</Text>
        <Text style={[styles.dim, styles.centerText]}>
          A goal worth a decade is worth typing twice. Write it again, in your
          own hand, exactly.
        </Text>
        <View style={styles.goalCard}>
          <Text style={styles.cardLabel}>Your goal</Text>
          <Text style={styles.cardText}>{goal}</Text>
        </View>
        <TextInput
          style={[styles.input, signed && styles.inputSigned]}
          value={typed}
          onChangeText={setTyped}
          placeholder="Type it here"
          placeholderTextColor={colors.dim}
          autoFocus
        />
        <Text style={styles.counter}>
          {typed.trim().length} of {goal.length} characters
        </Text>
        <Pressable
          style={[styles.outlineBtn, !signed && styles.disabled]}
          disabled={!signed}
          onPress={() => setAct('hold')}
        >
          <Text style={styles.outlineBtnText}>Signed — continue</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.label}>COMMIT</Text>
      <Text style={[styles.heading, styles.centerText]}>{goal}</Text>
      <Text style={[styles.dim, styles.centerText]}>
        {year} – {year + 10}
      </Text>
      <Pressable
        style={styles.holdCircle}
        onPressIn={() => setHold((h) => holdPress(h, Date.now()))}
        onPressOut={() => setHold((h) => holdRelease(h, Date.now()))}
      >
        <Text style={styles.holdNumber}>
          {hold.completed ? '✓' : heldSeconds}
        </Text>
        <Text style={styles.cardLabel}>
          {hold.pressedAt !== null || hold.completed ? 'keep holding' : 'hold'}
        </Text>
      </Pressable>
      <Text style={[styles.dim, styles.centerText]}>
        Hold for {COMMIT_HOLD_SECONDS} seconds.{'\n'}Release early and it
        resets to zero.{'\n'}Your first act of persistence.
      </Text>
    </View>
  );
}

function TermRow({
  label,
  value,
  note,
  accent,
  last,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.termRow, last && styles.termRowLast]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardText, accent && styles.accentText]}>{value}</Text>
      {note ? <Text style={styles.termNote}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  centered: { justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  date: { color: colors.dim, fontSize: 14, marginBottom: spacing.xs },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  dim: {
    color: colors.dim,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.dim,
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  inputSigned: { borderColor: colors.accent },
  multiline: { height: 84, textAlignVertical: 'top' },
  outlineBtn: {
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  outlineBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.35 },
  quiet: { alignItems: 'center', padding: spacing.md },
  quietText: { color: colors.dim, fontSize: 13 },
  termRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  termRowLast: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  termNote: { color: colors.dim, fontSize: 12, marginTop: 2 },
  cardLabel: { color: colors.dim, fontSize: 12, marginBottom: 3 },
  cardText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  accentText: { color: colors.accent },
  goalCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignSelf: 'stretch',
  },
  counter: {
    color: colors.dim,
    fontSize: 12,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  holdCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  holdNumber: { color: colors.text, fontSize: 40, fontWeight: '700' },
});
