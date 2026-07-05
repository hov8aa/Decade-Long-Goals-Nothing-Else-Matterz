import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MAX_DECADE_GOALS } from '../storage';
import { colors, spacing } from '../theme';
import { DecadeGoal, Goal, Session } from '../types';

interface Props {
  decadeGoals: DecadeGoal[];
  selectedDecadeId: string | null;
  onSelectDecade: (id: string) => void;
  onAddDecade: (title: string) => void;
  goals: Goal[];
  todaySessions: Session[];
  onStart: (title: string) => void;
}

export default function TodayScreen({
  decadeGoals,
  selectedDecadeId,
  onSelectDecade,
  onAddDecade,
  goals,
  todaySessions,
  onStart,
}: Props) {
  const [draft, setDraft] = useState('');
  const [decadeDraft, setDecadeDraft] = useState('');
  const [addingDecade, setAddingDecade] = useState(false);

  const doneCount = todaySessions.filter((s) => s.completed).length;
  const selected = decadeGoals.find((d) => d.id === selectedDecadeId) ?? null;

  // Goals under the selected decade goal, plus unadopted v0.1 goals —
  // picking one of those adopts it into the selected decade goal.
  const pickableGoals = selected
    ? [...goals]
        .filter((g) => g.decadeGoalId === selected.id || !g.decadeGoalId)
        .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    : [];

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const start = () => {
    const title = draft.trim();
    if (!title || !selected) return;
    setDraft('');
    onStart(title);
  };

  const addDecade = () => {
    const title = decadeDraft.trim();
    if (!title) return;
    setDecadeDraft('');
    setAddingDecade(false);
    onAddDecade(title);
  };

  // First run: no decade goals yet — nothing else exists until one does.
  if (decadeGoals.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.count}>Start with the decade.</Text>
        <Text style={styles.onboardText}>
          Name a goal you want to hold for ten years. The 10-minute sessions
          exist to serve it. You can have at most {MAX_DECADE_GOALS}.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={decadeDraft}
            onChangeText={setDecadeDraft}
            placeholder="Your first decade-long goal"
            placeholderTextColor={colors.dim}
            onSubmitEditing={addDecade}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.startBtn, !decadeDraft.trim() && styles.startBtnDisabled]}
            onPress={addDecade}
            disabled={!decadeDraft.trim()}
          >
            <Text style={styles.startBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{dateLabel}</Text>
      <Text style={styles.count}>
        {doneCount === 0
          ? 'Fresh start. Nothing done yet.'
          : `${doneCount} × 10 minutes done today`}
      </Text>

      <Text style={styles.sectionLabel}>Decade goals</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ gap: spacing.sm }}
      >
        {decadeGoals.map((d) => (
          <Pressable
            key={d.id}
            style={[styles.chip, d.id === selectedDecadeId && styles.chipSelected]}
            onPress={() => onSelectDecade(d.id)}
          >
            <Text
              style={[
                styles.chipText,
                d.id === selectedDecadeId && styles.chipTextSelected,
              ]}
              numberOfLines={1}
            >
              {d.title}
            </Text>
          </Pressable>
        ))}
        {decadeGoals.length < MAX_DECADE_GOALS && (
          <Pressable style={styles.chip} onPress={() => setAddingDecade(true)}>
            <Text style={styles.chipText}>＋</Text>
          </Pressable>
        )}
      </ScrollView>

      {addingDecade && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={decadeDraft}
            onChangeText={setDecadeDraft}
            placeholder="New decade-long goal"
            placeholderTextColor={colors.dim}
            onSubmitEditing={addDecade}
            returnKeyType="done"
            autoFocus
          />
          <Pressable
            style={[styles.startBtn, !decadeDraft.trim() && styles.startBtnDisabled]}
            onPress={addDecade}
            disabled={!decadeDraft.trim()}
          >
            <Text style={styles.startBtnText}>Add</Text>
          </Pressable>
        </View>
      )}

      {selected ? (
        <>
          <Text style={styles.sectionLabel}>
            10 minutes toward “{selected.title}”
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

          {pickableGoals.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Pick one up again</Text>
              <FlatList
                data={pickableGoals}
                keyExtractor={(g) => g.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.goalRow}
                    onPress={() => onStart(item.title)}
                  >
                    <Text style={styles.goalTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.goalGo}>▶</Text>
                  </Pressable>
                )}
              />
            </>
          )}
        </>
      ) : (
        <Text style={styles.onboardText}>
          Pick a decade goal above to start your 10 minutes.
        </Text>
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
  onboardText: {
    color: colors.dim,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  chipRow: { flexGrow: 0, marginBottom: spacing.md },
  chip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    maxWidth: 220,
  },
  chipSelected: { backgroundColor: colors.accentDark, borderColor: colors.accent },
  chipText: { color: colors.dim, fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: colors.text },
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
