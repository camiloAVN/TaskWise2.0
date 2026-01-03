
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CATEGORY_INFO, User } from '../../types/user';

interface UserInfoCardProps {
  user: User;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  const categoryInfo = CATEGORY_INFO[user.category];

  return (
    <View style={styles.container}>
      {/* Category & Level */}
      <View style={styles.row}>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoryBadge}>
            {!categoryInfo.isLottie && (
              <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
            )}
            <Text style={styles.categoryName}>{categoryInfo.name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Nivel</Text>
          <Text style={styles.levelValue}>{user.currentLevel}</Text>
        </View>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* XP Info */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.label}>Experiencia Total</Text>
          <Text style={styles.xpValue}>{user.totalXP.toLocaleString()} XP</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(user.currentLevelXP / user.nextLevelXP) * 100}%` },
            ]}
          />
        </View>
        
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{user.currentLevelXP} XP</Text>
          <Text style={styles.progressLabel}>
            {user.nextLevelXP - user.currentLevelXP} restantes
          </Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBlock: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#333',
  },
  levelValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  xpSection: {
    gap: 12,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#000',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d9f434',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    color: '#666',
  },
});