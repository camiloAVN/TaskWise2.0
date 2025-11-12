
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CATEGORY_INFO, User } from '../../types/user';

interface StatsHeaderProps {
  user: User;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ user }) => {
  const categoryInfo = CATEGORY_INFO[user.category];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
          <Text style={styles.categoryName}>{categoryInfo.name}</Text>
        </View>
        <Text style={styles.level}>Nivel {user.currentLevel}</Text>
      </View>
      <Text style={styles.totalXP}>{user.totalXP.toLocaleString()} XP</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  level: {
    fontSize: 14,
    color: '#666',
  },
  totalXP: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
});