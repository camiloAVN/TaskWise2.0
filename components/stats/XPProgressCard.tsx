import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface XPProgressCardProps {
  currentLevelXP: number;
  nextLevelXP: number;
  currentLevel: number;
}

export const XPProgressCard: React.FC<XPProgressCardProps> = ({
  currentLevelXP,
  nextLevelXP,
  currentLevel,
}) => {
  const progress = (currentLevelXP / nextLevelXP) * 100;
  const remaining = nextLevelXP - currentLevelXP;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progreso al Nivel {currentLevel + 1}</Text>
        <Text style={styles.remaining}>{remaining} XP restantes</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.xpText}>{currentLevelXP} XP</Text>
        <Text style={styles.xpText}>{nextLevelXP} XP</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  remaining: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#000',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d9f434',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpText: {
    fontSize: 12,
    color: '#666',
  },
});