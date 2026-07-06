import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Chapter, currentVersion } from '../model/chapters';
import { Session } from '../model/sessions';
import { colors, spacing } from '../theme';
import { Goal } from '../types';

interface Props {
  chapter: Chapter;
  goals: Goal[];
  todaySessions: Session[];
  onStart: (title: string) => void;
  onOpenNorthStar: () => void;
}

export default function TodayScreen({
  chapter,
  goals,
  todaySessions,
  onStart,
  onOpenNorthStar,
}: Props) {
  const [draft, setDraft] = useState('');
  const doneCount = todaySessions.filter((s) => s.completed).length;
  const sortedGoals = [...goals].sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  const version = currentVersion(chapter);
  const evolutions = chapter.versions.length - 1;

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const committedLabel = new Date(chapter.startedAt).toLocaleDateString(
    undefined,
    { month: 'short', year: 'numeric' }
  );

  const start = () => {
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    onStart(title);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.northStar} onPress={onOpenNorthStar}>
        <Text style={styles.northStarLabel}>
          THE DECADE · V{chapter.versions.length}
        </Text>
        <Text style={styles.northStarTitle}>{version.wording}</Text>
        <Text style={styles.northStarMeta}>
          committed {committedLabel}
          {evolutions > 0
            ? ` · evolved ${evolutions === 1 ? 'once' : `${evolutions} times`}`
            : ''}
        </Text>
      </Pressable>

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
  northStar: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  northStarLabel: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 3,
  },
  northStarTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  northStarMeta: { color: colors.dim, fontSize: 11, marginTop: 3 },
  date: { color: colors.dim, fontSize: 14, marginBottom: spacing.xs },
  count: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
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
