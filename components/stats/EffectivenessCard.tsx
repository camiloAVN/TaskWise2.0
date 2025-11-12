import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EffectivenessData {
  daily: number;
  weekly: number;
  monthly: number;
}

interface EffectivenessCardProps {
  effectiveness: EffectivenessData;
}

export const EffectivenessCard: React.FC<EffectivenessCardProps> = ({
  effectiveness,
}) => {
  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#d9f434';
    if (percentage >= 60) return '#4CAF50';
    if (percentage >= 40) return '#FF9800';
    return '#ff4444';
  };

  const getIcon = (percentage: number) => {
    if (percentage >= 80) return 'trending-up';
    if (percentage >= 60) return 'arrow-up';
    if (percentage >= 40) return 'remove';
    return 'trending-down';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 Efectividad</Text>

      <View style={styles.grid}>
        {/* Daily */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Diaria</Text>
            <Ionicons
              name={getIcon(effectiveness.daily)}
              size={20}
              color={getColor(effectiveness.daily)}
            />
          </View>
          <Text
            style={[styles.statValue, { color: getColor(effectiveness.daily) }]}
          >
            {effectiveness.daily}%
          </Text>
          <View style={styles.miniBar}>
            <View
              style={[
                styles.miniBarFill,
                {
                  width: `${effectiveness.daily}%`,
                  backgroundColor: getColor(effectiveness.daily),
                },
              ]}
            />
          </View>
        </View>

        {/* Weekly */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Semanal</Text>
            <Ionicons
              name={getIcon(effectiveness.weekly)}
              size={20}
              color={getColor(effectiveness.weekly)}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: getColor(effectiveness.weekly) },
            ]}
          >
            {effectiveness.weekly}%
          </Text>
          <View style={styles.miniBar}>
            <View
              style={[
                styles.miniBarFill,
                {
                  width: `${effectiveness.weekly}%`,
                  backgroundColor: getColor(effectiveness.weekly),
                },
              ]}
            />
          </View>
        </View>

        {/* Monthly */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Mensual</Text>
            <Ionicons
              name={getIcon(effectiveness.monthly)}
              size={20}
              color={getColor(effectiveness.monthly)}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: getColor(effectiveness.monthly) },
            ]}
          >
            {effectiveness.monthly}%
          </Text>
          <View style={styles.miniBar}>
            <View
              style={[
                styles.miniBarFill,
                {
                  width: `${effectiveness.monthly}%`,
                  backgroundColor: getColor(effectiveness.monthly),
                },
              ]}
            />
          </View>
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
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  miniBar: {
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});