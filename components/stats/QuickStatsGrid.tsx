
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface QuickStatsGridProps {
  totalTasks: number;
  tasksCompleted: number;
  totalXPEarned: number;
  averageTasksPerDay: number;
}

export const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({
  totalTasks,
  tasksCompleted,
  totalXPEarned,
  averageTasksPerDay,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Resumen General</Text>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📝</Text>
          <Text style={styles.statValue}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total Tareas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{tasksCompleted}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{totalXPEarned}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{averageTasksPerDay.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Promedio/Día</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d9f434',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});