import React from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { todayKey } from '../storage';
import { colors, spacing } from '../theme';
import { Session } from '../types';

interface Props {
  sessions: Session[];
  onStart: (title: string) => void;
}

function dayLabel(dateKey: string): string {
  if (dateKey === todayKey()) return 'Today';
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HistoryScreen({ sessions, onStart }: Props) {
  const byDay = new Map<string, Session[]>();
  for (const s of sessions) {
    const list = byDay.get(s.dateKey) ?? [];
    list.push(s);
    byDay.set(s.dateKey, list);
  }
  const dayKeys = [...byDay.keys()].sort().reverse();
  const data = dayKeys.map((key) => ({
    title: dayLabel(key),
    data: [...byDay.get(key)!].sort((a, b) => b.startedAt - a.startedAt),
  }));

  if (sessions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No sessions yet. Go do 10 minutes.</Text>
      </View>
    );
  }

  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={{ padding: spacing.lg }}
      sections={data}
      keyExtractor={(s) => s.id}
      renderSectionHeader={({ section }) => (
        <Text style={styles.day}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => onStart(item.goalTitle)}>
          <Text style={[styles.mark, !item.completed && styles.markFail]}>
            {item.completed ? '✓' : '✗'}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.goalTitle}
          </Text>
          <Text style={styles.time}>
            {new Date(item.startedAt).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.dim, fontSize: 16 },
  day: {
    color: colors.dim,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  mark: { width: 24, fontSize: 15, color: colors.accent },
  markFail: { color: colors.dim },
  title: { flex: 1, color: colors.text, fontSize: 15 },
  time: { color: colors.dim, fontSize: 13, marginLeft: spacing.sm },
});
