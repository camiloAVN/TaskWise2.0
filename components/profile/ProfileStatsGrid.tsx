import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileStatsGridProps {
  tasksCompleted: number;
  currentStreak: number;
  bestStreak: number;
  achievementsUnlocked: number;
}

export const ProfileStatsGrid: React.FC<ProfileStatsGridProps> = ({
  tasksCompleted,
  currentStreak,
  bestStreak,
  achievementsUnlocked,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Resumen</Text>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{tasksCompleted}</Text>
          <Text style={styles.statLabel}>Tareas Completadas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Racha Actual</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statValue}>{bestStreak}</Text>
          <Text style={styles.statLabel}>Mejor Racha</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎖️</Text>
          <Text style={styles.statValue}>{achievementsUnlocked}</Text>
          <Text style={styles.statLabel}>Logros</Text>
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
    borderRadius: 16,
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