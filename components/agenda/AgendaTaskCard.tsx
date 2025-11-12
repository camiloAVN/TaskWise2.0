// components/agenda/AgendaTaskCard.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_INFO, DIFFICULTY_POINTS, Task } from '../../types/task';

interface AgendaTaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
}

export const AgendaTaskCard: React.FC<AgendaTaskCardProps> = ({
  task,
  onPress,
  onToggle,
  onDelete,
}) => {
  const difficultyInfo = DIFFICULTY_POINTS[task.difficulty];
  const categoryInfo = CATEGORY_INFO[task.category];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Time indicator */}
        <View style={styles.timeContainer}>
          {task.dueTime ? (
            <Text style={styles.timeText}>{task.dueTime}</Text>
          ) : (
            <View style={styles.timeDot} />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={(e) => {
                e.stopPropagation();
                onToggle?.();
              }}
            >
              <Ionicons
                name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={task.completed ? '#d9f434' : '#666'}
              />
            </TouchableOpacity>

            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.title,
                  task.completed && styles.titleCompleted,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>

              <View style={styles.meta}>
                <View style={styles.badge}>
                  <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
                  <Text style={styles.badgeText}>{categoryInfo.name}</Text>
                </View>

                <View style={[styles.badge, styles.xpBadge]}>
                  <Text style={styles.difficultyIcon}>{difficultyInfo.icon}</Text>
                  <Text style={styles.xpText}>
                    {task.completed ? task.earnedPoints : task.basePoints} XP
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Delete Button */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  timeContainer: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d9f434',
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 10,
  },
  badgeText: {
    fontSize: 11,
    color: '#666',
  },
  xpBadge: {
    backgroundColor: '#d9f434',
  },
  difficultyIcon: {
    fontSize: 10,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
});