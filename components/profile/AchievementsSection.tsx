import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Achievement } from '../../types/achievement';

interface AchievementsSectionProps {
  achievements: Achievement[];
  onSeeAll?: () => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  onSeeAll,
}) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const recentAchievements = unlockedAchievements.slice(0, 6);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Logros</Text>
        {unlockedAchievements.length > 6 && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        )}
      </View>

      {unlockedAchievements.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>Aún no has desbloqueado logros</Text>
          <Text style={styles.emptySubtext}>¡Completa tareas para desbloquear!</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {recentAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Text style={styles.icon}>{achievement.icon}</Text>
              </View>
              <Text style={styles.achievementName} numberOfLines={2}>
                {achievement.name}
              </Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>{achievement.xpReward} XP</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          {unlockedAchievements.length} / {achievements.length} desbloqueados
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(unlockedAchievements.length / achievements.length) * 100}%`,
              },
            ]}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    color: '#d9f434',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  achievementCard: {
    width: '31%',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  achievementName: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 28,
  },
  xpBadge: {
    backgroundColor: '#d9f434',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  progressSection: {
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#000',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d9f434',
    borderRadius: 3,
  },
});