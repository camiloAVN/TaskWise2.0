// app/(tabs)/Stats/index.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EffectivenessCard } from '../../../components/stats/EffectivenessCard';
import { QuickStatsGrid } from '../../../components/stats/QuickStatsGrid';
import { StatsHeader } from '../../../components/stats/StatsHeader';
import { StreakCard } from '../../../components/stats/StreakCard';
import { XPProgressCard } from '../../../components/stats/XPProgressCard';

import { BestMonthsChart } from '@/components/stats/BestMonthChart';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import { StatsRepository, TaskRepository } from '../../../database/repositories';
import { formatDateToCalendar, getTodayDate } from '../../../utils/dateUtils';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { user, streak, loading: userLoading } = useUserStore();
  const { todayTasks, recentCompleted, monthTasks, refreshTasks, loading: tasksLoading } = useTaskStore();

  const [stats, setStats] = useState<any>(null);
  const [allUserTasks, setAllUserTasks] = useState<any[]>([]);
  const [bestMonths, setBestMonths] = useState<any[]>([]);
  const [effectiveness, setEffectiveness] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  const loading = userLoading || tasksLoading;

  // ✅ Calcular tareas completadas por período
  const tasksByPeriod = useMemo(() => {
    if (!user) return { today: 0, week: 0, month: 0 };

    const today = getTodayDate();
    const now = new Date();

    // Inicio de semana (domingo)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStart = formatDateToCalendar(startOfWeek);

    // Inicio de mes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = formatDateToCalendar(startOfMonth);

    // Combinar todas las tareas
    const allTasks = [...todayTasks, ...recentCompleted, ...monthTasks];
    const uniqueTasks = Array.from(
      new Map(allTasks.map(task => [task.id, task])).values()
    );

    // Filtrar completadas
    const completed = uniqueTasks.filter(t => t.completed && t.completedAt);

    // Contar por período
    const completedToday = completed.filter(t => {
      const completedDate = formatDateToCalendar(new Date(t.completedAt!));
      return completedDate === today;
    }).length;

    const completedThisWeek = completed.filter(t => {
      const completedDate = formatDateToCalendar(new Date(t.completedAt!));
      return completedDate >= weekStart;
    }).length;

    const completedThisMonth = completed.filter(t => {
      const completedDate = formatDateToCalendar(new Date(t.completedAt!));
      return completedDate >= monthStart;
    }).length;

    return {
      today: completedToday,
      week: completedThisWeek,
      month: completedThisMonth,
    };
  }, [todayTasks, recentCompleted, monthTasks, user]);

  // Cargar estadísticas
  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Obtener stats de la base de datos
      const userStats = await StatsRepository.findByUserId(user.id);

      if (userStats) {
        setStats(userStats);
      }

      // ✅ Cargar TODAS las tareas del usuario para estadísticas
      const allTasks = await TaskRepository.findByUserId(user.id);
      setAllUserTasks(allTasks);

      // ✅ Calcular efectividad con datos reales
      calculateEffectiveness(allTasks);

      // ✅ Calcular mejores meses
      calculateBestMonths(allTasks);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // ✅ Calcular efectividad
  const calculateEffectiveness = (allTasks: any[]) => {
    const today = getTodayDate();
    const now = new Date();

    // Tareas de hoy
    const todayTotal = allTasks.filter(t => t.dueDate === today).length;
    const todayCompleted = tasksByPeriod.today;
    const dailyEff = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // Tareas de esta semana
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStart = formatDateToCalendar(startOfWeek);

    const weekTasks = allTasks.filter(t => t.dueDate && t.dueDate >= weekStart);
    const weekCompleted = tasksByPeriod.week;
    const weeklyEff = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

    // Tareas de este mes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = formatDateToCalendar(startOfMonth);

    const monthTasks = allTasks.filter(t => t.dueDate && t.dueDate >= monthStart);
    const monthCompleted = tasksByPeriod.month;
    const monthlyEff = monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0;

    setEffectiveness({
      daily: Math.min(dailyEff, 100),
      weekly: Math.min(weeklyEff, 100),
      monthly: Math.min(monthlyEff, 100),
    });
  };

  // ✅ Calcular mejores meses
  const calculateBestMonths = (allTasks: any[]) => {
    // Agrupar tareas por mes
    const tasksByMonth: { [key: string]: { total: number; completed: number } } = {};

    allTasks.forEach(task => {
      if (!task.dueDate) return;

      const [year, month] = task.dueDate.split('-');
      const monthKey = `${year}-${month}`;

      if (!tasksByMonth[monthKey]) {
        tasksByMonth[monthKey] = { total: 0, completed: 0 };
      }

      tasksByMonth[monthKey].total++;
      if (task.completed) {
        tasksByMonth[monthKey].completed++;
      }
    });

    // Convertir a array y ordenar por tareas completadas
    const monthsArray = Object.entries(tasksByMonth)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthName = monthNames[parseInt(month) - 1];
        const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

        return {
          month: monthName,
          completed: data.completed,
          percentage,
        };
      })
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 4); // Top 4 meses

    setBestMonths(monthsArray);
  };

  const handleRefresh = async () => {
    await refreshTasks();
    await loadStats();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const averageTasksPerDay = stats
    ? stats.totalTasksCompleted / Math.max(stats.daysActive || 1, 1)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#d9f434"
          />
        }
      >
        {/* Title */}
        <Text style={styles.title}>📊 Estadísticas</Text>

        {/* Stats Header */}
        <StatsHeader user={user} />

        {/* XP Progress */}
        <XPProgressCard
          currentLevelXP={user.currentLevelXP}
          nextLevelXP={user.nextLevelXP}
          currentLevel={user.currentLevel}
        />

        {/* Effectiveness */}
        <EffectivenessCard effectiveness={effectiveness} />

        {/* Streak */}
        {streak && (
          <StreakCard
            currentStreak={streak.currentStreak}
            bestStreak={user.bestStreak}
            isActive={streak.isActive}
          />
        )}

        {/* Quick Stats */}
        {stats && (
          <QuickStatsGrid
            totalTasks={allUserTasks.length}
            tasksCompleted={stats.totalTasksCompleted || user.totalTasksCompleted}
            totalXPEarned={user.totalXP}
            averageTasksPerDay={averageTasksPerDay}
          />
        )}

        {/* Best Months */}
        {bestMonths.length > 0 && <BestMonthsChart months={bestMonths} />}
      </ScrollView>
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
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d9f434',
    marginBottom: 20,
  },
});