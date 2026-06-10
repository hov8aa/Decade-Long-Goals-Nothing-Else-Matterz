import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, spacing } from '../theme';
import { Goal, Session } from '../types';

interface Props {
  goals: Goal[];
  todaySessions: Session[];
  onStart: (title: string) => void;
}

export default function TodayScreen({ goals, todaySessions, onStart }: Props) {
  const [draft, setDraft] = useState('');
  const doneCount = todaySessions.filter((s) => s.completed).length;
  const sortedGoals = [...goals].sort((a, b) => b.lastUsedAt - a.lastUsedAt);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const start = () => {
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    onStart(title);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{dateLabel}</Text>
      <Text style={styles.count}>
        {doneCount === 0
          ? 'Fresh start. Nothing done yet.'
          : `${doneCount} × 10 minutes done today`}
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="What's the one thing?"
          placeholderTextColor={colors.dim}
          onSubmitEditing={start}
          returnKeyType="go"
        />
        <Pressable
          style={[styles.startBtn, !draft.trim() && styles.startBtnDisabled]}
          onPress={start}
          disabled={!draft.trim()}
        >
          <Text style={styles.startBtnText}>Start</Text>
        </Pressable>
      </View>

      {sortedGoals.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Pick one up again</Text>
          <FlatList
            data={sortedGoals}
            keyExtractor={(g) => g.id}
            renderItem={({ item }) => (
              <Pressable style={styles.goalRow} onPress={() => onStart(item.title)}>
                <Text style={styles.goalTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.goalGo}>▶</Text>
              </Pressable>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  date: { color: colors.dim, fontSize: 14, marginBottom: spacing.xs },
  count: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  startBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: '#04130A', fontWeight: '700', fontSize: 16 },
  sectionLabel: {
    color: colors.dim,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  goalTitle: { flex: 1, color: colors.text, fontSize: 16 },
  goalGo: { color: colors.accent, fontSize: 14, marginLeft: spacing.sm },
});
