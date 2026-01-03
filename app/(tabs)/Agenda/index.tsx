import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTaskModal } from '../../../components/AddTaskModal';
import { AgendaTaskList } from '../../../components/agenda/AgendaTaskList';
import { FullCalendar } from '../../../components/agenda/FullCalendar';
import { WeekCalendar } from '../../../components/agenda/WeekCalendar';
import { DayCompletedModal } from '../../../components/modals/DayCompletedModal';
import { Task } from '../../../types/task';
import { getTodayDate } from '../../../utils/dateUtils';
import { calculateTaskPoints } from '../../../utils/xpUtils';


export default function AgendaScreen() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentViewMonth, setCurrentViewMonth] = useState<{ year: number; month: number } | null>(null);
  const [dayCompletedModalVisible, setDayCompletedModalVisible] = useState(false);
  const [hasShownDayCompletedToday, setHasShownDayCompletedToday] = useState(false);
  const [completedDayStreak, setCompletedDayStreak] = useState(0);

  const calendarHeight = useRef(new Animated.Value(0)).current;
  
  const { 
    todayTasks, 
    recentCompleted, 
    monthTasks,
    loading, 
    refreshTasks,
    loadMonthTasks,
    refreshMonthTasks,
    toggleTask,
    completeTask,
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


  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    setCurrentViewMonth({ year, month });
    loadMonthTasks(year, month);
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

  const handleMonthChange = useCallback(async (year: number, month: number) => {
    console.log('📅 Loading tasks for month:', year, month);
    
    if (currentViewMonth?.year === year && currentViewMonth?.month === month) {
      console.log('✅ Month already loaded');
      return;
    }
    
    setCurrentViewMonth({ year, month });
    await loadMonthTasks(year, month);
  }, [currentViewMonth, loadMonthTasks]);

  const allTasks = useMemo(() => {
    const combined = [...todayTasks, ...recentCompleted, ...monthTasks];
    
    const uniqueTasks = Array.from(
      new Map(combined.map(task => [task.id, task])).values()
    );
    
    console.log('📊 Total unique tasks:', uniqueTasks.length);
    
    return uniqueTasks;
  }, [todayTasks, recentCompleted, monthTasks]);

  const tasksForSelectedDate = useMemo(() => {
    const filtered = allTasks.filter((task) => task.dueDate === selectedDate);
    console.log(`📅 Tasks for ${selectedDate}:`, filtered.length);
    return filtered;
  }, [allTasks, selectedDate]);

  const markedDates = useMemo(() => {
    const marked = allTasks.reduce((acc, task) => {
      if (task.dueDate) {
        if (acc[task.dueDate]) {
          if (!task.completed) {
            acc[task.dueDate].dotColor = '#FF9800';
          }
        } else {
          acc[task.dueDate] = {
            marked: true,
            dotColor: task.completed ? '#d9f434' : '#FF9800',
          };
        }
      }
      return acc;
    }, {} as { [date: string]: any });
    
    console.log('📍 Marked dates:', Object.keys(marked).length);
    return marked;
  }, [allTasks]);

  useEffect(() => {
    Animated.timing(calendarHeight, {
      toValue: showFullCalendar ? 350 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFullCalendar]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (showFullCalendar) {
      setShowFullCalendar(false);
    }
  };

  const handleRefresh = async () => {
    await refreshTasks();
    
    if (currentViewMonth) {
      await loadMonthTasks(currentViewMonth.year, currentViewMonth.month);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTaskToEdit(null);
    // No necesitamos recargar monthTasks aquí porque el taskStore
    // ahora actualiza automáticamente monthTasks al crear/editar tareas
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const task = allTasks.find(t => t.id === taskId);
      if (!task || !user) return;

      if (!task.completed) {
        // Verificar si esta es la última tarea pendiente del día de HOY
        const today = getTodayDate();
        const todayTasks = allTasks.filter(t => t.dueDate === today);
        const pendingTodayCount = todayTasks.filter(t => !t.completed && t.id !== taskId).length;
        const isLastTaskOfToday = task.dueDate === today && pendingTodayCount === 0;

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

        // Si es la última tarea del día de hoy, actualizar racha y mostrar modal
        if (isLastTaskOfToday && !hasShownDayCompletedToday) {
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
      } else {
        // Si se está desmarcando, simplemente toggle sin afectar la racha
        await toggleTask(taskId);
      }

      await refreshMonthTasks();
      await refreshTasks();
    } catch (error) {
      console.error('❌ Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      
      // Recargar mes actual
      await refreshMonthTasks();
      await refreshTasks();
      
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => setSelectedDate(getTodayDate())}
          activeOpacity={0.7}
        >
          <Ionicons name="today-outline" size={24} color="#d9f434" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calendarToggle}
          onPress={() => setShowFullCalendar(!showFullCalendar)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showFullCalendar ? 'chevron-up' : 'calendar-outline'}
            size={24}
            color="#d9f434"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#d9f434"
          />
        }
      >
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
        />

        <Animated.View style={{ height: calendarHeight, overflow: 'hidden' }}>
          <View style={styles.fullCalendarContainer}>
            <FullCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              markedDates={markedDates}
            />
          </View>
        </Animated.View>

        <AgendaTaskList
          tasks={tasksForSelectedDate}
          selectedDate={selectedDate}
          onTaskPress={handleEditTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      </ScrollView>

      <AddTaskModal
        visible={modalVisible}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
      />

      <DayCompletedModal
        visible={dayCompletedModalVisible}
        onClose={() => setDayCompletedModalVisible(false)}
        streakCount={completedDayStreak}
        tasksCompleted={todayTasks.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  todayButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
  },
  calendarToggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  fullCalendarContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});