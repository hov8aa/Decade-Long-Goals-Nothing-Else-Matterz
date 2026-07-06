import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { Chapter } from '../model/chapters';
import {
  EVOLVE_TAPS,
  TapState,
  initialTaps,
  tap,
} from '../model/ceremony';
import { colors, spacing } from '../theme';

interface Props {
  chapter: Chapter;
  onEvolve: (wording: string, reasoning: string) => void;
  onBack: () => void;
}

function monthYear(t: number): string {
  return new Date(t).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}

export default function NorthStarScreen({ chapter, onEvolve, onBack }: Props) {
  const [taps, setTaps] = useState<TapState>(initialTaps);
  const [wording, setWording] = useState('');
  const [reasoning, setReasoning] = useState('');

  const versions = [...chapter.versions].reverse();
  const latest = chapter.versions.length;

  const handleTap = () => {
    setTaps((s) => {
      const next = tap(s, Date.now());
      if (next.awake && !s.awake) Vibration.vibrate(200);
      return next;
    });
  };

  const submit = () => {
    if (!wording.trim() || !reasoning.trim()) return;
    onEvolve(wording, reasoning);
    setWording('');
    setReasoning('');
    setTaps(initialTaps);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>‹ back</Text>
      </Pressable>
      <Text style={styles.heading}>The north star</Text>

      {versions.map((v, i) => {
        const n = latest - i;
        const current = i === 0;
        const reignEnd = i > 0 ? versions[i - 1].since : null;
        return (
          <View key={v.since} style={[styles.card, current && styles.cardCurrent]}>
            <Text style={[styles.cardLabel, current && styles.accent]}>
              {current
                ? `V${n} · CURRENT · since ${monthYear(v.since)}`
                : `V${n} · ${monthYear(v.since)} – ${monthYear(reignEnd!)}`}
            </Text>
            <Text style={[styles.cardTitle, !current && styles.dimText]}>
              {v.wording}
            </Text>
            <Text style={styles.reasoning}>“{v.reasoning}”</Text>
          </View>
        );
      })}

      {!taps.awake ? (
        <Pressable style={styles.sleepZone} onPress={handleTap}>
          <Text style={styles.sleepText}>Evolve is sleeping</Text>
          {taps.count > 0 && (
            <>
              <Text style={styles.dots}>
                <Text style={styles.accent}>{'●'.repeat(taps.count)}</Text>
                <Text style={styles.dotsOff}>
                  {'●'.repeat(Math.max(0, EVOLVE_TAPS - taps.count))}
                </Text>
              </Text>
              <Text style={styles.sleepHint}>
                {taps.count} of {EVOLVE_TAPS} taps · keep tapping to wake it
              </Text>
            </>
          )}
        </Pressable>
      ) : (
        <View style={styles.evolveForm}>
          <Text style={styles.awakeLabel}>EVOLVE IS AWAKE</Text>
          <Text style={styles.sleepText}>
            Evolution, not replacement. The old wording stays in the trail with
            its reasoning.
          </Text>
          <TextInput
            style={styles.input}
            value={wording}
            onChangeText={setWording}
            placeholder="Evolved wording"
            placeholderTextColor={colors.dim}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={reasoning}
            onChangeText={setReasoning}
            placeholder="Why it evolves — required"
            placeholderTextColor={colors.dim}
            multiline
          />
          <Pressable
            style={[
              styles.evolveBtn,
              !(wording.trim() && reasoning.trim()) && styles.disabled,
            ]}
            disabled={!(wording.trim() && reasoning.trim())}
            onPress={submit}
          >
            <Text style={styles.evolveBtnText}>Evolve</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: spacing.lg },
  back: { color: colors.dim, fontSize: 14, marginBottom: spacing.sm },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardCurrent: { borderColor: colors.accent },
  cardLabel: { color: colors.dim, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  dimText: { color: colors.dim },
  reasoning: { color: colors.dim, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  accent: { color: colors.accent },
  sleepZone: {
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sleepText: { color: colors.dim, fontSize: 13, marginBottom: 6, lineHeight: 19 },
  sleepHint: { color: colors.dim, fontSize: 11 },
  dots: { fontSize: 13, letterSpacing: 3, marginBottom: 6 },
  dotsOff: { color: colors.border },
  evolveForm: { marginTop: spacing.md },
  awakeLabel: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  multiline: { height: 72, textAlignVertical: 'top' },
  evolveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  evolveBtnText: { color: '#04130A', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.35 },
});
