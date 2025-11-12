import { DailyMission, DailyMissionsGroup } from '../../types/dailyMission';
import { getTodayDate } from '../../utils/dateUtils';
import { getDatabase } from '../config';

export class MissionRepository {
  /**
   * Crear misión diaria
   */
  static async create(userId: number, mission: Omit<DailyMission, 'id'>): Promise<DailyMission> {
    try {
      const db = await getDatabase();
      const missionId = `${userId}-${mission.date}-${mission.order}`;

      await db.runAsync(
        `INSERT INTO daily_missions (
          id, userId, date, title, description, icon, type, difficulty,
          targetValue, currentValue, completed, xpReward, bonusXP, orderIndex
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          missionId,
          userId,
          mission.date,
          mission.title,
          mission.description,
          mission.icon,
          mission.type,
          mission.difficulty,
          mission.targetValue,
          mission.currentValue,
          mission.completed ? 1 : 0,
          mission.xpReward,
          mission.bonusXP,
          mission.order,
        ]
      );

      const created = await this.findById(missionId);
      if (!created) {
        throw new Error('Failed to create mission');
      }

      console.log('✅ Mission created:', missionId);
      return created;
    } catch (error) {
      console.error('❌ Error creating mission:', error);
      throw error;
    }
  }

  /**
   * Crear múltiples misiones
   */
  static async createMany(userId: number, missions: DailyMission[]): Promise<DailyMission[]> {
    try {
      const createdMissions: DailyMission[] = [];

      for (const mission of missions) {
        const created = await this.create(userId, mission);
        createdMissions.push(created);
      }

      console.log(`✅ Created ${createdMissions.length} missions for user:`, userId);
      return createdMissions;
    } catch (error) {
      console.error('❌ Error creating missions:', error);
      throw error;
    }
  }

  /**
   * Obtener misión por ID
   */
  static async findById(id: string): Promise<DailyMission | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM daily_missions WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToMission(row) : null;
    } catch (error) {
      console.error('❌ Error fetching mission:', error);
      throw error;
    }
  }

  /**
   * Obtener misiones por fecha
   */
  static async findByDate(userId: number, date: string): Promise<DailyMission[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM daily_missions WHERE userId = ? AND date = ? ORDER BY orderIndex ASC',
        [userId, date]
      );

      return rows.map(this.mapRowToMission);
    } catch (error) {
      console.error('❌ Error fetching missions by date:', error);
      throw error;
    }
  }

  /**
   * Obtener misiones de hoy
   */
  static async findToday(userId: number): Promise<DailyMission[]> {
    const today = getTodayDate();
    return await this.findByDate(userId, today);
  }

  /**
   * Obtener grupo de misiones diarias
   */
  static async getMissionsGroup(userId: number, date: string): Promise<DailyMissionsGroup> {
    try {
      const missions = await this.findByDate(userId, date);
      
      const allCompleted = missions.length > 0 && missions.every(m => m.completed);
      const totalXP = missions.reduce((sum, m) => sum + (m.completed ? m.xpReward : 0), 0);
      const bonusXPAvailable = allCompleted && missions.length > 0 ? missions[0].bonusXP : 0;

      return {
        date,
        missions,
        allCompleted,
        totalXP: totalXP + bonusXPAvailable,
        bonusXPAvailable,
      };
    } catch (error) {
      console.error('❌ Error fetching missions group:', error);
      throw error;
    }
  }

  /**
   * Actualizar progreso de misión
   */
static async updateProgress(id: string, currentValue: number): Promise<DailyMission> {
  try {
    const db = await getDatabase();
    
    const mission = await this.findById(id);
    if (!mission) {
      throw new Error('Mission not found');
    }

    const newValue = Math.min(currentValue, mission.targetValue);
    const completed = newValue >= mission.targetValue;
    
    // ✅ Corrección: usar null en lugar de undefined
    const completedAt = completed && !mission.completed 
      ? new Date().toISOString() 
      : (mission.completedAt || null);

    await db.runAsync(
      `UPDATE daily_missions SET 
        currentValue = ?,
        completed = ?,
        completedAt = ?
       WHERE id = ?`,
      [newValue, completed ? 1 : 0, completedAt, id]
    );

    console.log('✅ Mission progress updated:', id);
    return (await this.findById(id))!;
  } catch (error) {
    console.error('❌ Error updating mission progress:', error);
    throw error;
  }
}
  /**
   * Incrementar progreso de misión
   */
  static async incrementProgress(id: string, increment: number = 1): Promise<DailyMission> {
    try {
      const mission = await this.findById(id);
      if (!mission) {
        throw new Error('Mission not found');
      }

      const newValue = mission.currentValue + increment;
      return await this.updateProgress(id, newValue);
    } catch (error) {
      console.error('❌ Error incrementing mission progress:', error);
      throw error;
    }
  }

  /**
   * Completar misión
   */
  static async complete(id: string): Promise<DailyMission> {
    try {
      const mission = await this.findById(id);
      if (!mission) {
        throw new Error('Mission not found');
      }

      return await this.updateProgress(id, mission.targetValue);
    } catch (error) {
      console.error('❌ Error completing mission:', error);
      throw error;
    }
  }

  /**
   * Verificar si existen misiones para una fecha
   */
  static async existsForDate(userId: number, date: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM daily_missions WHERE userId = ? AND date = ?',
        [userId, date]
      );

      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('❌ Error checking missions existence:', error);
      throw error;
    }
  }

  /**
   * Eliminar misiones antiguas
   */
  static async deleteOlderThan(userId: number, date: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'DELETE FROM daily_missions WHERE userId = ? AND date < ?',
        [userId, date]
      );
      console.log('✅ Old missions deleted');
    } catch (error) {
      console.error('❌ Error deleting old missions:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de misiones completadas
   */
  static async getCompletedHistory(
    userId: number,
    limit: number = 30
  ): Promise<{ date: string; completedCount: number; totalCount: number }[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        `SELECT 
          date,
          COUNT(*) as totalCount,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedCount
         FROM daily_missions
         WHERE userId = ?
         GROUP BY date
         ORDER BY date DESC
         LIMIT ?`,
        [userId, limit]
      );

      return rows.map(row => ({
        date: row.date,
        completedCount: row.completedCount,
        totalCount: row.totalCount,
      }));
    } catch (error) {
      console.error('❌ Error fetching completed history:', error);
      throw error;
    }
  }

  /**
   * Contar días consecutivos con todas las misiones completadas
   */
  static async countConsecutiveCompleteDays(userId: number): Promise<number> {
    try {
      const history = await this.getCompletedHistory(userId, 100);
      
      let streak = 0;
      for (const day of history) {
        if (day.completedCount === day.totalCount && day.totalCount > 0) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('❌ Error counting consecutive days:', error);
      throw error;
    }
  }

  /**
   * Helper para mapear row a DailyMission
   */
  private static mapRowToMission(row: any): DailyMission {
    return {
      id: row.id,
      date: row.date,
      
      title: row.title,
      description: row.description,
      icon: row.icon,
      
      type: row.type,
      difficulty: row.difficulty,
      
      targetValue: row.targetValue,
      currentValue: row.currentValue,
      completed: row.completed === 1,
      completedAt: row.completedAt || undefined,
      
      xpReward: row.xpReward,
      bonusXP: row.bonusXP,
      
      order: row.orderIndex,
    };
  }
}