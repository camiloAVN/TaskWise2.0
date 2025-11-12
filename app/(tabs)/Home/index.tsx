// app/(tabs)/Home/index.tsx

import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTaskModal } from '../../../components/AddTaskModal';
import { CurrentTaskCard } from '../../../components/home/CurrentTaskCard';
import { DailyProgressCard } from '../../../components/home/DailyProgressCard';
import { TaskList } from '../../../components/home/TaskList';
import { UserHeader } from '../../../components/home/UserHeader';
import { Task } from '../../../types/task';
import { getTodayDate } from '../../../utils/dateUtils';
import { calculateTaskPoints } from '../../../utils/xpUtils';

export default function HomeScreen() {
  const router = useRouter();
  const { isAddTaskModalOpen, closeAddTaskModal } = useUIStore();
  
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  const {
    todayTasks,
    recentCompleted,
    loading,
    refreshTasks,
    completeTask,
    toggleTask,
    deleteTask, // ✅ AGREGAR
  } = useTaskStore();

  const {
    user,
    incrementTasksCompleted,
    addXP,
    updateStreak,
    checkAndUpdateAchievements,
  } = useUserStore();

  const allTodayTasks = useMemo(() => {
    const today = getTodayDate();
    const pendingToday = todayTasks;
    const completedToday = recentCompleted.filter(t => 
      t.completedAt && t.completedAt.startsWith(today)
    );
    
    const combined = [...pendingToday, ...completedToday];
    const uniqueTasks = Array.from(
      new Map(combined.map(t => [t.id, t])).values()
    );
    
    return uniqueTasks;
  }, [todayTasks, recentCompleted]);

  const completedToday = allTodayTasks.filter(t => t.completed).length;
  const totalToday = allTodayTasks.length;
  const xpEarnedToday = allTodayTasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.earnedPoints, 0);

  const currentTask = allTodayTasks.find(t => !t.completed);
  const upcomingTasks = allTodayTasks.filter(t => !t.completed && t.id !== currentTask?.id);

  const handleRefresh = async () => {
    await refreshTasks();
  };

  const handleCompleteTask = async (taskId: number) => {
    if (!user) return;

    try {
      const task = allTodayTasks.find(t => t.id === taskId);
      if (!task) return;

      const pointsData = calculateTaskPoints({
        difficulty: task.difficulty,
        priority: task.priority,
        streak: user.currentStreak,
        completedEarly: false,
        isFirstTaskOfDay: user.tasksCompletedToday === 0,
        tasksCompletedToday: user.tasksCompletedToday,
      });

      await completeTask(
        taskId,
        pointsData.earnedPoints,
        pointsData.bonusMultiplier,
        {
          completedEarly: false,
          isFirstTaskOfDay: user.tasksCompletedToday === 0,
          completedDuringStreak: user.currentStreak > 0,
        }
      );

      await incrementTasksCompleted();
      await addXP(pointsData.earnedPoints);
      await updateStreak(getTodayDate());
      await checkAndUpdateAchievements();

      console.log(`✅ Task completed! +${pointsData.earnedPoints} XP`);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
  };

  const handleCloseModal = () => {
    closeAddTaskModal();
    setTaskToEdit(null);
  };

  // ✅ NUEVO: Manejar eliminación de tareas
  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      console.log('✅ Task deleted:', taskId);
      
      // Mostrar feedback al usuario
      Alert.alert(
        '✅ Tarea Eliminada',
        'La tarea se ha eliminado correctamente',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert(
        '❌ Error',
        'No se pudo eliminar la tarea. Intenta de nuevo.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#d9f434"
          />
        }
      >
        <UserHeader
          user={user}
          onProfilePress={() => router.push('/(tabs)/Profile')}
        />

        <CurrentTaskCard
          task={currentTask || null}
          onTaskPress={() => {
            if (currentTask) {
              handleEditTask(currentTask);
            }
          }}
          onCompletePress={() => {
            if (currentTask) {
              handleCompleteTask(currentTask.id);
            }
          }}
        />

        <DailyProgressCard
          tasksCompleted={completedToday}
          totalTasks={totalToday}
          xpEarned={xpEarnedToday}
        />

        <TaskList
          tasks={upcomingTasks}
          allTodayTasks={allTodayTasks}
          onTaskPress={(task) => handleEditTask(task)}
          onToggleComplete={(taskId) => toggleTask(taskId)}
          onDeleteTask={handleDeleteTask} // ✅ NUEVO
        />
      </ScrollView>

      <AddTaskModal
        visible={isAddTaskModalOpen || !!taskToEdit}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});