import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chapter } from '../model/chapters';
import { HistoryItem, buildHistory, groupByDay } from '../model/history';
import { Session, todayKey } from '../model/sessions';
import { colors, spacing } from '../theme';

interface Props {
  sessions: Session[];
  chapters: Chapter[];
  onStart: (title: string) => void;
}

function dayLabel(dateKey: string): string {
  if (dateKey === todayKey()) return 'Today';
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function timeLabel(t: number): string {
  return new Date(t).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function durationLabel(s: Session): string {
  if (s.completed) return '10 min';
  if (s.endedAt === null) return 'running';
  const sec = Math.round((s.endedAt - s.startedAt) / 1000);
  const m = Math.floor(sec / 60);
  const r = String(sec % 60).padStart(2, '0');
  return `gave up ${m}:${r}`;
}

function SessionRow({
  session,
  onStart,
}: {
  session: Session;
  onStart: (title: string) => void;
}) {
  return (
    <Pressable style={styles.row} onPress={() => onStart(session.goalTitle)}>
      <Text style={[styles.mark, !session.completed && styles.markFail]}>
        {session.completed ? '✓' : '✗'}
      </Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {session.goalTitle}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          served: {session.servedWording} · v{session.servedVersion}
        </Text>
      </View>
      <Text style={styles.rowMeta}>
        {timeLabel(session.startedAt)}
        {'\n'}
        {durationLabel(session)}
      </Text>
    </Pressable>
  );
}

function EvolutionRow({ item }: { item: Extract<HistoryItem, { kind: 'evolution' }> }) {
  return (
    <View style={styles.evolution}>
      <Text style={styles.evolutionLabel}>
        NORTH STAR EVOLVED · V{item.toVersion - 1} → V{item.toVersion}
      </Text>
      <Text style={styles.evolutionText} numberOfLines={2}>
        {item.fromWording} → {item.toWording}
      </Text>
      <Text style={styles.evolutionWhy}>“{item.reasoning}”</Text>
    </View>
  );
}

export default function HistoryScreen({ sessions, chapters, onStart }: Props) {
  const groups = groupByDay(buildHistory(sessions, chapters));

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No sessions yet. Go do 10 minutes.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.list} contentContainerStyle={{ padding: spacing.lg }}>
      {groups.map((group) => (
        <View key={group.dateKey}>
          <Text style={styles.day}>{dayLabel(group.dateKey)}</Text>
          {group.items.map((item) =>
            item.kind === 'session' ? (
              <SessionRow
                key={item.session.id}
                session={item.session}
                onStart={onStart}
              />
            ) : (
              <EvolutionRow key={`evo-${item.at}`} item={item} />
            )
          )}
        </View>
      ))}
    </ScrollView>
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
    paddingVertical: 10,
    marginBottom: spacing.sm,
  },
  mark: { width: 24, fontSize: 15, color: colors.accent },
  markFail: { color: colors.dim },
  rowBody: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15 },
  rowSub: { color: colors.dim, fontSize: 11, marginTop: 2 },
  rowMeta: {
    color: colors.dim,
    fontSize: 11,
    textAlign: 'right',
    marginLeft: spacing.sm,
  },
  evolution: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  evolutionLabel: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  evolutionText: { color: colors.text, fontSize: 14, marginBottom: 4 },
  evolutionWhy: { color: colors.dim, fontSize: 12, fontStyle: 'italic' },
});
