import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DIFFICULTY_POINTS, Task } from '../../types/task';

interface CurrentTaskCardProps {
  task: Task | null;
  onTaskPress?: () => void;
  onCompletePress?: () => void;
}

export const CurrentTaskCard: React.FC<CurrentTaskCardProps> = ({
  task,
  onTaskPress,
  onCompletePress,
}) => {
  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>¡Sin tareas pendientes!</Text>
          <Text style={styles.emptySubtitle}>Disfruta tu día libre</Text>
        </View>
      </View>
    );
  }

  const difficultyInfo = DIFFICULTY_POINTS[task.difficulty];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onTaskPress}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>Tarea Actual</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyIcon}>{difficultyInfo.icon}</Text>
          <Text style={styles.xpText}>+{task.basePoints} XP</Text>
        </View>
      </View>

      {/* Task Title */}
      <Text style={styles.title}>{task.title}</Text>

      {/* Description */}
      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      {/* Time & Category */}
      <View style={styles.meta}>
        {task.dueTime && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{task.dueTime}</Text>
          </View>
        )}
        {task.estimatedTime && (
          <View style={styles.metaItem}>
            <Ionicons name="hourglass-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{task.estimatedTime} min</Text>
          </View>
        )}
      </View>

      {/* Complete Button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={(e) => {
          e.stopPropagation();
          onCompletePress?.();
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle" size={24} color="#000" />
        <Text style={styles.completeButtonText}>Completar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d9f434',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  difficultyIcon: {
    fontSize: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
  },
});