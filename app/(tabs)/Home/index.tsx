import { useNotificationStore } from '@/stores/notificationStore';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTaskModal } from '../../../components/AddTaskModal';
import { CurrentTaskCard } from '../../../components/home/CurrentTaskCard';
import { DailyProgressCard } from '../../../components/home/DailyProgressCard';
import { TaskList } from '../../../components/home/TaskList';
import { UserHeader } from '../../../components/home/UserHeader';
import { DayCompletedModal } from '../../../components/modals/DayCompletedModal';
import { NotificationsModal } from '../../../components/modals/NotificationsModal';
import { PomodoroModal } from '../../../components/modals/PomodoroModal';
import { Task } from '../../../types/task';
import { getTodayDate } from '../../../utils/dateUtils';
import { calculateTaskPoints } from '../../../utils/xpUtils';

export default function HomeScreen() {
  const router = useRouter();
  const { isAddTaskModalOpen, closeAddTaskModal } = useUIStore();

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [pomodoroVisible, setPomodoroVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [dayCompletedModalVisible, setDayCompletedModalVisible] = useState(false);
  const [hasShownDayCompletedToday, setHasShownDayCompletedToday] = useState(false);
  const [completedDayStreak, setCompletedDayStreak] = useState(0); 
  
  const {
    todayTasks,
    recentCompleted,
    loading,
    refreshTasks,
    completeTask,
    toggleTask,
    deleteTask,
  } = useTaskStore();

  const {
    user,
    streak,
    incrementTasksCompleted,
    addXP,
    updateStreakOnDayCompleted,
    checkAndUpdateAchievements,
  } = useUserStore();

  const { unreadCount, loadNotifications, loadUnreadCount } = useNotificationStore();


  const allTodayTasks = useMemo(() => {
    const today = getTodayDate();
    const pendingToday = todayTasks;
    // Filtrar tareas completadas solo del día de hoy
    // Extraer solo los primeros 10 caracteres (YYYY-MM-DD) para comparar
    const completedToday = recentCompleted.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = t.completedAt.substring(0, 10);
      return completedDate === today;
    });

    const combined = [...pendingToday, ...completedToday];
    const uniqueTasks = Array.from(
      new Map(combined.map(t => [t.id, t])).values()
    );

    // Ordenar por hora (de más temprano a más tarde)
    // Las tareas sin hora van al final
    return uniqueTasks.sort((a, b) => {
      // Si ambas están completadas o ambas pendientes, ordenar por hora
      if (a.completed === b.completed) {
        if (!a.dueTime && !b.dueTime) return 0;
        if (!a.dueTime) return 1;
        if (!b.dueTime) return -1;
        return a.dueTime.localeCompare(b.dueTime);
      }
      // Las pendientes van primero
      return a.completed ? 1 : -1;
    });
  }, [todayTasks, recentCompleted]);

  const completedToday = allTodayTasks.filter(t => t.completed).length;
  const totalToday = allTodayTasks.length;
  const xpEarnedToday = allTodayTasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.earnedPoints, 0);

  const currentTask = allTodayTasks.find(t => !t.completed);
  const upcomingTasks = allTodayTasks.filter(t => !t.completed && t.id !== currentTask?.id);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  // Reset day completed modal flag when user's lastTaskDate changes (new day)
  useEffect(() => {
    if (user?.lastTaskDate) {
      const today = getTodayDate();
      if (user.lastTaskDate !== today) {
        setHasShownDayCompletedToday(false);
      }
    }
  }, [user?.lastTaskDate]);


  const handleRefresh = async () => {
    await refreshTasks();
    await loadNotifications();
    await loadUnreadCount();
  };

  const handleOpenNotifications = () => {
    setNotificationsModalVisible(true);
  };

  const handleCloseNotifications = () => {
    setNotificationsModalVisible(false);
    loadUnreadCount(); // Refresh badge after closing
  };

  const handleCompleteTask = async (taskId: number) => {
    if (!user) return;

    try {
      const task = allTodayTasks.find(t => t.id === taskId);
      if (!task) return;

      // Contar cuántas tareas pendientes hay (excluyendo la que vamos a completar)
      const pendingTasksCount = allTodayTasks.filter(t => !t.completed && t.id !== taskId).length;
      const isLastTask = pendingTasksCount === 0;

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
      await checkAndUpdateAchievements();

      // Si es la última tarea del día, actualizar racha y mostrar modal
      if (isLastTask && !hasShownDayCompletedToday) {
        // Calcular el nuevo streak antes de actualizar
        const { calculateNewStreak } = await import('../../../utils/streakUtils');
        const newStreak = calculateNewStreak(
          streak?.currentStreak || 0,
          streak?.lastActivityDate
        );

        await updateStreakOnDayCompleted(getTodayDate());

        // Guardar el nuevo streak para el modal
        setCompletedDayStreak(newStreak);

        // Mostrar modal de día completado solo una vez
        setTimeout(() => {
          setDayCompletedModalVisible(true);
          setHasShownDayCompletedToday(true);
        }, 500); // Pequeño delay para que se vea la animación de completar la tarea
      }

      console.log(`✅ Task completed! +${pointsData.earnedPoints} XP${isLastTask ? ' - Day completed!' : ''}`);
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

  const handleToggleTask = async (taskId: number) => {
    if (!user) return;

    try {
      const task = allTodayTasks.find(t => t.id === taskId);
      if (!task) return;

      // Si la tarea está siendo completada (no descompletada)
      if (!task.completed) {
        // Contar cuántas tareas pendientes hay (excluyendo la que vamos a completar)
        const pendingTasksCount = allTodayTasks.filter(t => !t.completed && t.id !== taskId).length;
        const isLastTask = pendingTasksCount === 0;

        // Calcular puntos
        const pointsData = calculateTaskPoints({
          difficulty: task.difficulty,
          priority: task.priority,
          streak: user.currentStreak,
          completedEarly: false,
          isFirstTaskOfDay: user.tasksCompletedToday === 0,
          tasksCompletedToday: user.tasksCompletedToday,
        });

        // Completar la tarea
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
        await checkAndUpdateAchievements();

        // Si es la última tarea del día, actualizar racha y mostrar modal
        if (isLastTask && !hasShownDayCompletedToday) {
          // Calcular el nuevo streak antes de actualizar
          const { calculateNewStreak } = await import('../../../utils/streakUtils');
          const newStreak = calculateNewStreak(
            streak?.currentStreak || 0,
            streak?.lastActivityDate
          );

          await updateStreakOnDayCompleted(getTodayDate());

          // Guardar el nuevo streak para el modal
          setCompletedDayStreak(newStreak);

          // Mostrar modal de día completado solo una vez
          setTimeout(() => {
            setDayCompletedModalVisible(true);
            setHasShownDayCompletedToday(true);
          }, 500);
        }

        console.log(`✅ Task completed! +${pointsData.earnedPoints} XP${isLastTask ? ' - Day completed!' : ''}`);
      } else {
        // Si se está desmarcando, simplemente toggle sin afectar la racha
        await toggleTask(taskId);
        console.log('✅ Task uncompleted:', taskId);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      console.log('✅ Task deleted:', taskId);

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
          onNotificationsPress={handleOpenNotifications}
          unreadCount={unreadCount}
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
          onPomodoroPress={() => setPomodoroVisible(true)} 
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
          onToggleComplete={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      </ScrollView>

      <AddTaskModal
        visible={isAddTaskModalOpen || !!taskToEdit}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
      />

      <PomodoroModal
        visible={pomodoroVisible}
        onClose={() => setPomodoroVisible(false)}
        taskTitle={currentTask?.title}
      />

      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={handleCloseNotifications}
      />

      <DayCompletedModal
        visible={dayCompletedModalVisible}
        onClose={() => setDayCompletedModalVisible(false)}
        streakCount={completedDayStreak}
        tasksCompleted={totalToday}
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
    paddingBottom: 120,
  },
});