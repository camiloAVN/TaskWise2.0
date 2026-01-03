
import LottieView from 'lottie-react-native';
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
        <View style={styles.categoryBadge}>
          {categoryInfo.isLottie ? (
            <LottieView
              source={categoryInfo.icon}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
          )}
          <Text style={styles.categoryName}>{categoryInfo.name}</Text>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent:'flex-end',
    marginBottom: 8,
    gap: 5,
  },
  categoryIcon: {
    fontSize: 80,
    marginBottom: 10,
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