import { PeriodStats, UserStats } from '../../types/stats';
import { getDatabase } from '../config';

export class StatsRepository {
  /**
   * Crear registro de estadísticas para un usuario
   */
  static async create(userId: number): Promise<UserStats> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      const result = await db.runAsync(
        'INSERT INTO stats (userId, updatedAt) VALUES (?, ?)',
        [userId, now]
      );

      const stats = await this.findById(result.lastInsertRowId);
      if (!stats) {
        throw new Error('Failed to create stats');
      }

      console.log('✅ Stats created for user:', userId);
      return stats;
    } catch (error) {
      console.error('❌ Error creating stats:', error);
      throw error;
    }
  }

  /**
   * Obtener stats por ID
   */
  static async findById(id: number): Promise<UserStats | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM stats WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToStats(row) : null;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Obtener stats por usuario
   */
  static async findByUserId(userId: number): Promise<UserStats | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM stats WHERE userId = ? LIMIT 1',
        [userId]
      );

      return row ? this.mapRowToStats(row) : null;
    } catch (error) {
      console.error('❌ Error fetching stats by user:', error);
      throw error;
    }
  }

  /**
   * Recalcular todas las estadísticas desde las tareas
   */
  static async recalculate(userId: number): Promise<UserStats> {
    try {
      const db = await getDatabase();

      // Obtener todas las tareas del usuario
      const tasks = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ?',
        [userId]
      );

      const completedTasks = tasks.filter(t => t.completed === 1);
      const cancelledTasks = tasks.filter(t => t.status === 'cancelled');

      // Calcular totales
      const totalTasks = tasks.length;
      const totalTasksCompleted = completedTasks.length;
      const totalTasksCancelled = cancelledTasks.length;
      const totalXPEarned = completedTasks.reduce((sum, t) => sum + (t.earnedPoints || 0), 0);

      // Calcular por dificultad
      const easyTasksCompleted = completedTasks.filter(t => t.difficulty === 'easy').length;
      const mediumTasksCompleted = completedTasks.filter(t => t.difficulty === 'medium').length;
      const hardTasksCompleted = completedTasks.filter(t => t.difficulty === 'hard').length;
      const extremeTasksCompleted = completedTasks.filter(t => t.difficulty === 'extreme').length;

      // Calcular por categoría
      const workTasksCompleted = completedTasks.filter(t => t.category === 'work').length;
      const personalTasksCompleted = completedTasks.filter(t => t.category === 'personal').length;
      const healthTasksCompleted = completedTasks.filter(t => t.category === 'health').length;
      const studyTasksCompleted = completedTasks.filter(t => t.category === 'study').length;
      const financeTasksCompleted = completedTasks.filter(t => t.category === 'finance').length;
      const socialTasksCompleted = completedTasks.filter(t => t.category === 'social').length;
      const creativeTasksCompleted = completedTasks.filter(t => t.category === 'creative').length;
      const otherTasksCompleted = completedTasks.filter(t => t.category === 'other').length;

      // Calcular tiempo
      const totalTimeInvested = completedTasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
      const averageTimePerTask = totalTasksCompleted > 0 ? totalTimeInvested / totalTasksCompleted : 0;

      // Calcular día más productivo
      const tasksByDate: Record<string, number> = {};
      completedTasks.forEach(t => {
        if (t.completedAt) {
          const date = t.completedAt.split('T')[0];
          tasksByDate[date] = (tasksByDate[date] || 0) + 1;
        }
      });

      const mostProductiveDay = Object.entries(tasksByDate).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Calcular hora más productiva
      const tasksByHour: Record<number, number> = {};
      completedTasks.forEach(t => {
        if (t.completedAt) {
          const hour = new Date(t.completedAt).getHours();
          tasksByHour[hour] = (tasksByHour[hour] || 0) + 1;
        }
      });

      const mostProductiveHour = Object.entries(tasksByHour).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Calcular día de la semana más productivo
      const tasksByDayOfWeek: Record<number, number> = {};
      completedTasks.forEach(t => {
        if (t.completedAt) {
          const dayOfWeek = new Date(t.completedAt).getDay();
          tasksByDayOfWeek[dayOfWeek] = (tasksByDayOfWeek[dayOfWeek] || 0) + 1;
        }
      });

      const mostProductiveDayOfWeek = Object.entries(tasksByDayOfWeek).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Calcular días con actividad
      const uniqueDates = new Set(
        completedTasks.map(t => t.completedAt?.split('T')[0]).filter(Boolean)
      );
      const totalDaysWithActivity = uniqueDates.size;

      // Calcular promedios
      const averageTasksPerDay = totalDaysWithActivity > 0 ? totalTasksCompleted / totalDaysWithActivity : 0;
      const averageXPPerDay = totalDaysWithActivity > 0 ? totalXPEarned / totalDaysWithActivity : 0;

      // Obtener datos de racha
      const streak = await db.getFirstAsync<any>(
        'SELECT currentStreak, bestStreak FROM streaks WHERE userId = ?',
        [userId]
      );

      // Obtener datos de misiones
      const missionsStats = await db.getFirstAsync<{ total: number; streak: number }>(
        `SELECT 
          COUNT(DISTINCT date) as total,
          0 as streak
         FROM daily_missions 
         WHERE userId = ? AND completed = 1`,
        [userId]
      );

      // Obtener logros
      const achievementsCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM achievements WHERE userId = ? AND unlocked = 1',
        [userId]
      );

      const now = new Date().toISOString();

      // Actualizar o crear stats
      await db.runAsync(
        `INSERT INTO stats (
          userId, totalTasks, totalTasksCompleted, totalTasksCancelled, totalXPEarned,
          averageTasksPerDay, averageXPPerDay, averageCompletionTime,
          easyTasksCompleted, mediumTasksCompleted, hardTasksCompleted, extremeTasksCompleted,
          workTasksCompleted, personalTasksCompleted, healthTasksCompleted, studyTasksCompleted,
          financeTasksCompleted, socialTasksCompleted, creativeTasksCompleted, otherTasksCompleted,
          totalTimeInvested, averageTimePerTask,
          mostProductiveDay, mostProductiveHour, mostProductiveDayOfWeek,
          currentStreak, bestStreak, totalDaysWithActivity,
          totalDailyMissionsCompleted, dailyMissionsCompletedStreak,
          totalAchievementsUnlocked, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(userId) DO UPDATE SET
          totalTasks = excluded.totalTasks,
          totalTasksCompleted = excluded.totalTasksCompleted,
          totalTasksCancelled = excluded.totalTasksCancelled,
          totalXPEarned = excluded.totalXPEarned,
          averageTasksPerDay = excluded.averageTasksPerDay,
          averageXPPerDay = excluded.averageXPPerDay,
          averageCompletionTime = excluded.averageCompletionTime,
          easyTasksCompleted = excluded.easyTasksCompleted,
          mediumTasksCompleted = excluded.mediumTasksCompleted,
          hardTasksCompleted = excluded.hardTasksCompleted,
          extremeTasksCompleted = excluded.extremeTasksCompleted,
          workTasksCompleted = excluded.workTasksCompleted,
          personalTasksCompleted = excluded.personalTasksCompleted,
          healthTasksCompleted = excluded.healthTasksCompleted,
          studyTasksCompleted = excluded.studyTasksCompleted,
          financeTasksCompleted = excluded.financeTasksCompleted,
          socialTasksCompleted = excluded.socialTasksCompleted,
          creativeTasksCompleted = excluded.creativeTasksCompleted,
          otherTasksCompleted = excluded.otherTasksCompleted,
          totalTimeInvested = excluded.totalTimeInvested,
          averageTimePerTask = excluded.averageTimePerTask,
          mostProductiveDay = excluded.mostProductiveDay,
          mostProductiveHour = excluded.mostProductiveHour,
          mostProductiveDayOfWeek = excluded.mostProductiveDayOfWeek,
          currentStreak = excluded.currentStreak,
          bestStreak = excluded.bestStreak,
          totalDaysWithActivity = excluded.totalDaysWithActivity,
          totalDailyMissionsCompleted = excluded.totalDailyMissionsCompleted,
          dailyMissionsCompletedStreak = excluded.dailyMissionsCompletedStreak,
          totalAchievementsUnlocked = excluded.totalAchievementsUnlocked,
          updatedAt = excluded.updatedAt`,
        [
          userId, totalTasks, totalTasksCompleted, totalTasksCancelled, totalXPEarned,
          averageTasksPerDay, averageXPPerDay, totalTimeInvested / totalDaysWithActivity || 0,
          easyTasksCompleted, mediumTasksCompleted, hardTasksCompleted, extremeTasksCompleted,
          workTasksCompleted, personalTasksCompleted, healthTasksCompleted, studyTasksCompleted,
          financeTasksCompleted, socialTasksCompleted, creativeTasksCompleted, otherTasksCompleted,
          totalTimeInvested, averageTimePerTask,
          mostProductiveDay || null, mostProductiveHour ? parseInt(mostProductiveHour) : null, 
          mostProductiveDayOfWeek ? parseInt(mostProductiveDayOfWeek) : null,
          streak?.currentStreak || 0, streak?.bestStreak || 0, totalDaysWithActivity,
          missionsStats?.total || 0, missionsStats?.streak || 0,
          achievementsCount?.count || 0, now
        ]
      );

      console.log('✅ Stats recalculated for user:', userId);
      return (await this.findByUserId(userId))!;
    } catch (error) {
      console.error('❌ Error recalculating stats:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas por período
   */
  static async getStatsForPeriod(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<PeriodStats> {
    try {
      const db = await getDatabase();

      // Obtener tareas del período
      const tasks = await db.getAllAsync<any>(
        `SELECT * FROM tasks 
         WHERE userId = ? 
         AND completed = 1
         AND DATE(completedAt) >= ? 
         AND DATE(completedAt) <= ?`,
        [userId, startDate, endDate]
      );

      const tasksCompleted = tasks.length;
      const xpEarned = tasks.reduce((sum, t) => sum + (t.earnedPoints || 0), 0);
      const timeInvested = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);

      // Calcular días en el período
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const averageTasksPerDay = tasksCompleted / daysDiff;

      // Distribución por dificultad
      const difficultyDistribution = {
        easy: tasks.filter(t => t.difficulty === 'easy').length,
        medium: tasks.filter(t => t.difficulty === 'medium').length,
        hard: tasks.filter(t => t.difficulty === 'hard').length,
        extreme: tasks.filter(t => t.difficulty === 'extreme').length,
      };

      // Distribución por categoría
      const categoryDistribution: Record<string, number> = {};
      tasks.forEach(t => {
        categoryDistribution[t.category] = (categoryDistribution[t.category] || 0) + 1;
      });

      // Mejor día
      const tasksByDate: Record<string, { count: number; xp: number }> = {};
      tasks.forEach(t => {
        if (t.completedAt) {
          const date = t.completedAt.split('T')[0];
          if (!tasksByDate[date]) {
            tasksByDate[date] = { count: 0, xp: 0 };
          }
          tasksByDate[date].count++;
          tasksByDate[date].xp += t.earnedPoints || 0;
        }
      });

      const bestDayEntry = Object.entries(tasksByDate).sort((a, b) => b[1].count - a[1].count)[0];
      const bestDay = bestDayEntry ? {
        date: bestDayEntry[0],
        tasksCompleted: bestDayEntry[1].count,
        xpEarned: bestDayEntry[1].xp,
      } : undefined;

      // Determinar el período
      let period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all';
      if (daysDiff === 1) period = 'day';
      else if (daysDiff <= 7) period = 'week';
      else if (daysDiff <= 31) period = 'month';
      else if (daysDiff <= 366) period = 'year';

      return {
        period,
        startDate,
        endDate,
        tasksCompleted,
        xpEarned,
        timeInvested,
        averageTasksPerDay,
        difficultyDistribution,
        categoryDistribution,
        bestDay,
      };
    } catch (error) {
      console.error('❌ Error fetching period stats:', error);
      throw error;
    }
  }

  /**
   * Helper para mapear row a UserStats
   */
  private static mapRowToStats(row: any): UserStats {
    return {
      id: row.id,
      userId: row.userId,
      
      totalTasks: row.totalTasks,
      totalTasksCompleted: row.totalTasksCompleted,
      totalTasksCancelled: row.totalTasksCancelled,
      totalXPEarned: row.totalXPEarned,
      
      averageTasksPerDay: row.averageTasksPerDay,
      averageXPPerDay: row.averageXPPerDay,
      averageCompletionTime: row.averageCompletionTime,
      
      easyTasksCompleted: row.easyTasksCompleted,
      mediumTasksCompleted: row.mediumTasksCompleted,
      hardTasksCompleted: row.hardTasksCompleted,
      extremeTasksCompleted: row.extremeTasksCompleted,
      
      workTasksCompleted: row.workTasksCompleted,
      personalTasksCompleted: row.personalTasksCompleted,
      healthTasksCompleted: row.healthTasksCompleted,
      studyTasksCompleted: row.studyTasksCompleted,
      financeTasksCompleted: row.financeTasksCompleted,
      socialTasksCompleted: row.socialTasksCompleted,
      creativeTasksCompleted: row.creativeTasksCompleted,
      otherTasksCompleted: row.otherTasksCompleted,
      
      totalTimeInvested: row.totalTimeInvested,
      averageTimePerTask: row.averageTimePerTask,
      
      mostProductiveDay: row.mostProductiveDay || undefined,
      mostProductiveHour: row.mostProductiveHour || undefined,
      mostProductiveDayOfWeek: row.mostProductiveDayOfWeek || undefined,
      
      currentStreak: row.currentStreak,
      bestStreak: row.bestStreak,
      totalDaysWithActivity: row.totalDaysWithActivity,
      
      totalDailyMissionsCompleted: row.totalDailyMissionsCompleted,
      dailyMissionsCompletedStreak: row.dailyMissionsCompletedStreak,
      
      totalAchievementsUnlocked: row.totalAchievementsUnlocked,
      
      updatedAt: row.updatedAt,
    };
  }
}