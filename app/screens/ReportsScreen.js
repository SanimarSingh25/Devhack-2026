import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';

const DUMMY_REPORTS = [
  { id: 'r1', timestamp: Date.now() - 1000 * 60 * 5, severityScore: 0.82, lat: 43.2609, lon: -79.9192 },
  { id: 'r2', timestamp: Date.now() - 1000 * 60 * 50, severityScore: 0.35, lat: 43.2551, lon: -79.9201 },
  { id: 'r3', timestamp: Date.now() - 1000 * 60 * 120, severityScore: 0.62, lat: 43.2587, lon: -79.9150 },
  { id: 'r4', timestamp: Date.now() - 1000 * 60 * 10, severityScore: 0.91, lat: 43.2614, lon: -79.9230 },
  { id: 'r5', timestamp: Date.now() - 1000 * 60 * 200, severityScore: 0.18, lat: 43.2620, lon: -79.9100 },
];

function severityLabel(score) {
  if (score >= 0.75) return 'High';
  if (score >= 0.45) return 'Medium';
  return 'Low';
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function roundCoord(x) {
  return Math.round(x * 10000) / 10000;
}

export default function ReportsScreen() {
  const [filter, setFilter] = useState('All'); // All | Low | Medium | High
  const [sort, setSort] = useState('Newest');  // Newest | SeverityHigh | SeverityLow

  const data = useMemo(() => {
    let out = DUMMY_REPORTS.map((r) => ({
      ...r,
      severity: severityLabel(r.severityScore),
    }));

    if (filter !== 'All') {
      out = out.filter((r) => r.severity === filter);
    }

    if (sort === 'Newest') {
      out.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sort === 'SeverityHigh') {
      out.sort((a, b) => b.severityScore - a.severityScore);
    } else if (sort === 'SeverityLow') {
      out.sort((a, b) => a.severityScore - b.severityScore);
    }

    return out;
  }, [filter, sort]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Filter</Text>
          <View style={styles.pillsRow}>
            {['All', 'Low', 'Medium', 'High'].map((x) => (
              <Pill key={x} label={x} active={filter === x} onPress={() => setFilter(x)} />
            ))}
          </View>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Sort</Text>
          <View style={styles.pillsRow}>
            <Pill label="Newest" active={sort === 'Newest'} onPress={() => setSort('Newest')} />
            <Pill label="Highest" active={sort === 'SeverityHigh'} onPress={() => setSort('SeverityHigh')} />
            <Pill label="Lowest" active={sort === 'SeverityLow'} onPress={() => setSort('SeverityLow')} />
          </View>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No reports match your filter.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>Severity: {item.severity}</Text>
              <Text style={styles.scoreText}>{item.severityScore.toFixed(2)}</Text>
            </View>

            <Text style={styles.metaText}>Time: {formatTime(item.timestamp)}</Text>
            <Text style={styles.metaText}>
              Location: {roundCoord(item.lat)}, {roundCoord(item.lon)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function Pill({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && styles.pillPressed,
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 18, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 10 },

  controls: { marginBottom: 10, gap: 12 },
  controlGroup: {},
  controlLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, opacity: 0.8 },

  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  pill: {
    borderWidth: 1,
    borderColor: '#888',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillPressed: { opacity: 0.75 },
  pillText: { fontSize: 13 },
  pillTextActive: { color: '#fff' },

  listContent: { paddingTop: 6, paddingBottom: 18, gap: 10 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 12,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  scoreText: { fontSize: 16, fontWeight: '700', opacity: 0.8 },

  metaText: { marginTop: 6, fontSize: 13, opacity: 0.8 },
  emptyText: { paddingTop: 24, textAlign: 'center', opacity: 0.7 },
});