import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DailyProgressCardProps {
  tasksCompleted: number;
  totalTasks: number;
  xpEarned: number;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  tasksCompleted,
  totalTasks,
  xpEarned,
}) => {
  const progress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Progreso de Hoy</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tasksCompleted}/{totalTasks}</Text>
          <Text style={styles.statLabel}>Tareas</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{xpEarned}</Text>
          <Text style={styles.statLabel}>XP Ganado</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d9f434',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d9f434',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d9f434',
    minWidth: 40,
    textAlign: 'right',
  },
});