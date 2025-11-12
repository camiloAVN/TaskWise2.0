import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
  isActive: boolean;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  bestStreak,
  isActive,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Racha</Text>

      <View style={styles.content}>
        <View style={styles.mainStat}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Días Actuales</Text>
          <View style={[styles.statusBadge, isActive && styles.statusBadgeActive]}>
            <Text style={[styles.statusText, isActive && styles.statusTextActive]}>
              {isActive ? '✅ Activa' : '⚠️ Inactiva'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sideStat}>
          <Text style={styles.bestStreakLabel}>Mejor Racha</Text>
          <Text style={styles.bestStreakNumber}>{bestStreak}</Text>
          <Text style={styles.bestStreakSub}>días</Text>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#d9f434',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#d9f434',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  statusTextActive: {
    color: '#000',
  },
  divider: {
    width: 1,
    height: 80,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  sideStat: {
    alignItems: 'center',
  },
  bestStreakLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  bestStreakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  bestStreakSub: {
    fontSize: 12,
    color: '#666',
  },
});