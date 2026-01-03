import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../../types/task';
import { formatReadableDate } from '../../utils/dateUtils';
import { AgendaTaskCard } from './AgendaTaskCard';

interface AgendaTaskListProps {
  tasks: Task[];
  selectedDate: string;
  onTaskPress: (task: Task) => void;
  onToggleTask: (taskId: number) => void;
  onDeleteTask?: (taskId: number) => void;
}

export const AgendaTaskList: React.FC<AgendaTaskListProps> = ({
  tasks,
  selectedDate,
  onTaskPress,
  onToggleTask,
  onDeleteTask,
}) => {
  const [showDeleteButtons, setShowDeleteButtons] = useState(false); 

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.dueTime && !b.dueTime) return 0;
      if (!a.dueTime) return 1;
      if (!b.dueTime) return -1;
      return a.dueTime.localeCompare(b.dueTime);
    });
  }, [tasks]);

  const pendingTasks = useMemo(() => {
    return sortedTasks.filter(t => !t.completed);
  }, [sortedTasks]);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dateTitle}>{formatReadableDate(selectedDate)}</Text>
          <Text style={styles.taskCount}>
            {pendingTasks.length} pendiente{pendingTasks.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Botón Toggle */}
        {sortedTasks.length > 0 && (
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
          </TouchableOpacity>
        )}
      </View>

      {/* Tasks */}
      {sortedTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No hay tareas para este día</Text>
        </View>
      ) : (
        <FlatList
          data={sortedTasks}
          renderItem={({ item }) => (
            <AgendaTaskCard
              task={item}
              onPress={() => onTaskPress(item)}
              onToggle={() => onToggleTask(item.id)}
              onDelete={showDeleteButtons ? () => handleDeletePress(item) : undefined} // Solo pasar onDelete si está activo
            />
          )}
          keyExtractor={(item) => `task-${item.id}`}
          scrollEnabled={false}
          removeClippedSubviews={false}
          extraData={[tasks, showDeleteButtons]} //  Agregar showDeleteButtons
          style={{paddingBottom:80}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteToggleButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteToggleButtonActive: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
