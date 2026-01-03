import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_INFO, DIFFICULTY_POINTS, Task } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  allTodayTasks: Task[];
  onTaskPress?: (task: Task) => void;
  onToggleComplete?: (taskId: number) => void;
  onDeleteTask?: (taskId: number) => void;
}

type FilterType = 'pending' | 'completed';

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  allTodayTasks,
  onTaskPress,
  onToggleComplete,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<FilterType>('pending');
  const [showDeleteButtons, setShowDeleteButtons] = useState(false); 

  const filteredTasks = useMemo(() => {
    let tasks: Task[];
    if (filter === 'pending') {
      tasks = allTodayTasks.filter(t => !t.completed);
    } else {
      tasks = allTodayTasks.filter(t => t.completed);
    }

    // Ordenar por hora (de más temprano a más tarde)
    return tasks.sort((a, b) => {
      // Si una tarea no tiene hora, ponerla al final
      if (!a.dueTime && !b.dueTime) return 0;
      if (!a.dueTime) return 1;
      if (!b.dueTime) return -1;

      // Comparar horas en formato HH:mm
      return a.dueTime.localeCompare(b.dueTime);
    });
  }, [allTodayTasks, filter]);

  const pendingCount = useMemo(() => {
    return allTodayTasks.filter(t => !t.completed).length;
  }, [allTodayTasks]);

  const completedCount = useMemo(() => {
    return allTodayTasks.filter(t => t.completed).length;
  }, [allTodayTasks]);

  const handleDeletePress = (task: Task) => {
    Alert.alert(
      'Eliminar Tarea',
      `¿Estás seguro de que quieres eliminar "${task.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDeleteTask?.(task.id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderTask = ({ item }: { item: Task }) => {
    const difficultyInfo = DIFFICULTY_POINTS[item.difficulty];
    const categoryInfo = CATEGORY_INFO[item.category];

    return (
      <View style={styles.taskCardWrapper}>
        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => onTaskPress?.(item)}
          activeOpacity={0.7}
        >
          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkbox}
            onPress={(e) => {
              e.stopPropagation();
              onToggleComplete?.(item.id);
            }}
          >
            <Ionicons
              name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={28}
              color={item.completed ? '#d9f434' : '#666'}
            />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.taskContent}>
            <Text
              style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <View style={styles.taskMeta}>
              <View style={styles.metaBadge}>
                <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
                <Text style={styles.metaText}>{categoryInfo.name}</Text>
              </View>

              {item.dueTime && (
                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.metaText}>{item.dueTime}</Text>
                </View>
              )}

              <View style={[styles.metaBadge, styles.xpBadge]}>
                <Text style={styles.difficultyIcon}>{difficultyInfo.icon}</Text>
                <Text style={styles.xpBadgeText}>
                  {item.completed ? item.earnedPoints : item.basePoints} XP
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>


        {showDeleteButtons && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePress(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Tareas</Text>

        <TouchableOpacity
          style={[
            styles.deleteToggleButton,
            showDeleteButtons && styles.deleteToggleButtonActive,
          ]}
          onPress={() => setShowDeleteButtons(!showDeleteButtons)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showDeleteButtons ? 'close-circle' : 'trash-outline'}
            size={20}
            color={showDeleteButtons ? '#fff' : '#ff4444'}
          />
          <Text
            style={[
              styles.deleteToggleText,
              showDeleteButtons && styles.deleteToggleTextActive,
            ]}
          >
            {showDeleteButtons ? 'Cancelar' : 'Eliminar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'pending' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('pending')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'pending' && styles.filterTextActive,
            ]}
          >
            Pendientes
          </Text>
          <View
            style={[
              styles.filterBadge,
              filter === 'pending' && styles.filterBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'pending' && styles.filterBadgeTextActive,
              ]}
            >
              {pendingCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('completed')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.filterTextActive,
            ]}
          >
            Completadas
          </Text>
          <View
            style={[
              styles.filterBadge,
              filter === 'completed' && styles.filterBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'completed' && styles.filterBadgeTextActive,
              ]}
            >
              {completedCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'pending' 
              ? 'No hay tareas pendientes' 
              : 'No hay tareas completadas'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => `task-${item.id}`}
          scrollEnabled={false}
          removeClippedSubviews={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          extraData={[allTodayTasks, showDeleteButtons]} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  deleteToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteToggleButtonActive: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  deleteToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff4444',
  },
  deleteToggleTextActive: {
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  filterButtonActive: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#000',
  },
  filterBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#000',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  filterBadgeTextActive: {
    color: '#d9f434',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  taskCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
  },
  checkbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaBadge: {
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
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  xpBadge: {
    backgroundColor: '#d9f434',
  },
  difficultyIcon: {
    fontSize: 10,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  separator: {
    height: 12,
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