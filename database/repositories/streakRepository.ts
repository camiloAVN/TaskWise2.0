
import { Streak } from '../../types/streak';
import { getTodayDate } from '../../utils/dateUtils';
import { getDatabase } from '../config';

export class StreakRepository {
  /**
   * Crear registro de streak para un usuario
   */
  static async create(userId: number): Promise<Streak> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();
      const today = getTodayDate();

      const result = await db.runAsync(
        `INSERT INTO streaks (
          userId, currentStreak, bestStreak, lastActivityDate,
          streakStartDate, isActive, totalDaysActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 0, 0, null, today, 0, 0, now, now]
      );

      const streak = await this.findById(result.lastInsertRowId);
      if (!streak) {
        throw new Error('Failed to create streak');
      }

      console.log('✅ Streak created for user:', userId);
      return streak;
    } catch (error) {
      console.error('❌ Error creating streak:', error);
      throw error;
    }
  }

  /**
   * Obtener streak por ID
   */
  static async findById(id: number): Promise<Streak | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM streaks WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToStreak(row) : null;
    } catch (error) {
      console.error('❌ Error fetching streak:', error);
      throw error;
    }
  }

  /**
   * Obtener streak por usuario
   */
  static async findByUserId(userId: number): Promise<Streak | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM streaks WHERE userId = ? LIMIT 1',
        [userId]
      );

      return row ? this.mapRowToStreak(row) : null;
    } catch (error) {
      console.error('❌ Error fetching streak by user:', error);
      throw error;
    }
  }

  /**
   * Actualizar streak
   */
  static async update(
    userId: number,
    data: {
      currentStreak: number;
      lastActivityDate: string;
      isActive: boolean;
    }
  ): Promise<Streak> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      const streak = await this.findByUserId(userId);
      if (!streak) {
        throw new Error('Streak not found');
      }

      // Actualizar mejor racha si es necesario
      const newBestStreak = Math.max(streak.bestStreak, data.currentStreak);
      const bestStreakDate = data.currentStreak > streak.bestStreak 
        ? data.lastActivityDate 
        : streak.bestStreakDate;

      // Si la racha se reinició (currentStreak = 1), actualizar streakStartDate
      const streakStartDate = data.currentStreak === 1 
        ? data.lastActivityDate 
        : streak.streakStartDate;

      await db.runAsync(
        `UPDATE streaks SET
          currentStreak = ?,
          bestStreak = ?,
          lastActivityDate = ?,
          streakStartDate = ?,
          bestStreakDate = ?,
          isActive = ?,
          totalDaysActive = totalDaysActive + 1,
          updatedAt = ?
         WHERE userId = ?`,
        [
          data.currentStreak,
          newBestStreak,
          data.lastActivityDate,
          streakStartDate,
          bestStreakDate,
          data.isActive ? 1 : 0,
          now,
          userId,
        ]
      );

      console.log('✅ Streak updated for user:', userId);
      return (await this.findByUserId(userId))!;
    } catch (error) {
      console.error('❌ Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Romper la racha (resetear a 0)
   */
  static async breakStreak(userId: number): Promise<Streak> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      await db.runAsync(
        `UPDATE streaks SET 
          currentStreak = 0,
          isActive = 0,
          updatedAt = ?
         WHERE userId = ?`,
        [now, userId]
      );

      console.log('⚠️ Streak broken for user:', userId);
      return (await this.findByUserId(userId))!;
    } catch (error) {
      console.error('❌ Error breaking streak:', error);
      throw error;
    }
  }

  /**
   * Incrementar streak
   */
  static async increment(userId: number, date: string): Promise<Streak> {
    try {
      const streak = await this.findByUserId(userId);
      if (!streak) {
        throw new Error('Streak not found');
      }

      const newStreak = streak.currentStreak + 1;
      
      return await this.update(userId, {
        currentStreak: newStreak,
        lastActivityDate: date,
        isActive: true,
      });
    } catch (error) {
      console.error('❌ Error incrementing streak:', error);
      throw error;
    }
  }

  /**
   * Iniciar nueva racha
   */
  static async start(userId: number, date: string): Promise<Streak> {
    try {
      return await this.update(userId, {
        currentStreak: 1,
        lastActivityDate: date,
        isActive: true,
      });
    } catch (error) {
      console.error('❌ Error starting streak:', error);
      throw error;
    }
  }

  /**
   * Obtener calendario de actividad (para react-native-calendars)
   */
  static async getActivityCalendar(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<Record<string, { marked: boolean; dotColor: string }>> {
    try {
      const db = await getDatabase();
      
      // Obtener todas las tareas completadas en el rango
      const rows = await db.getAllAsync<{ completedAt: string }>(
        `SELECT DATE(completedAt) as date 
         FROM tasks 
         WHERE userId = ? 
         AND completed = 1 
         AND DATE(completedAt) >= ? 
         AND DATE(completedAt) <= ?
         GROUP BY DATE(completedAt)`,
        [userId, startDate, endDate]
      );

      const calendar: Record<string, { marked: boolean; dotColor: string }> = {};
      
      rows.forEach(row => {
        const date = row.completedAt.split('T')[0]; // Extraer YYYY-MM-DD
        calendar[date] = {
          marked: true,
          dotColor: '#d9f434',
        };
      });

      return calendar;
    } catch (error) {
      console.error('❌ Error fetching activity calendar:', error);
      throw error;
    }
  }

  /**
   * Helper para mapear row a Streak
   */
  private static mapRowToStreak(row: any): Streak {
    return {
      id: row.id,
      userId: row.userId,
      
      currentStreak: row.currentStreak,
      bestStreak: row.bestStreak,
      
      lastActivityDate: row.lastActivityDate || '',
      streakStartDate: row.streakStartDate,
      bestStreakDate: row.bestStreakDate || undefined,
      
      isActive: row.isActive === 1,
      
      totalDaysActive: row.totalDaysActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}