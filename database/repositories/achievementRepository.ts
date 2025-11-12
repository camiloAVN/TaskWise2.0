import { Achievement, ACHIEVEMENTS_DEFINITIONS } from '../../types/achievement';
import { getDatabase } from '../config';

export class AchievementRepository {
  /**
   * Inicializar logros para un usuario
   */
  static async initializeForUser(userId: number): Promise<void> {
    try {
      const db = await getDatabase();

      for (const achievement of ACHIEVEMENTS_DEFINITIONS) {
        await db.runAsync(
          `INSERT OR IGNORE INTO achievements (
            id, userId, name, description, icon, category, rarity,
            xpReward, requirementType, requirementValue, orderIndex, isSecret
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `${userId}-${achievement.id}`,
            userId,
            achievement.name,
            achievement.description,
            achievement.icon,
            achievement.category,
            achievement.rarity,
            achievement.xpReward,
            achievement.requirementType,
            achievement.requirementValue,
            achievement.order,
            achievement.isSecret ? 1 : 0,
          ]
        );
      }

      console.log('✅ Achievements initialized for user:', userId);
    } catch (error) {
      console.error('❌ Error initializing achievements:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los logros de un usuario
   */
  static async findByUserId(userId: number): Promise<Achievement[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM achievements WHERE userId = ? ORDER BY orderIndex ASC',
        [userId]
      );

      return rows.map(this.mapRowToAchievement);
    } catch (error) {
      console.error('❌ Error fetching achievements:', error);
      throw error;
    }
  }

  /**
   * Obtener logros desbloqueados
   */
  static async findUnlocked(userId: number): Promise<Achievement[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM achievements WHERE userId = ? AND unlocked = 1 ORDER BY unlockedAt DESC',
        [userId]
      );

      return rows.map(this.mapRowToAchievement);
    } catch (error) {
      console.error('❌ Error fetching unlocked achievements:', error);
      throw error;
    }
  }

  /**
   * Obtener IDs de logros desbloqueados
   */
  static async getUnlockedIds(userId: number): Promise<string[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<{ id: string }>(
        'SELECT id FROM achievements WHERE userId = ? AND unlocked = 1',
        [userId]
      );

      return rows.map(row => row.id.replace(`${userId}-`, ''));
    } catch (error) {
      console.error('❌ Error fetching unlocked IDs:', error);
      throw error;
    }
  }

  /**
   * Obtener logros por categoría
   */
  static async findByCategory(
    userId: number,
    category: string
  ): Promise<Achievement[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM achievements WHERE userId = ? AND category = ? ORDER BY orderIndex ASC',
        [userId, category]
      );

      return rows.map(this.mapRowToAchievement);
    } catch (error) {
      console.error('❌ Error fetching achievements by category:', error);
      throw error;
    }
  }

  /**
   * Actualizar progreso de un logro
   */
  static async updateProgress(
    userId: number,
    achievementId: string,
    currentValue: number
  ): Promise<Achievement> {
    try {
      const db = await getDatabase();
      const fullId = `${userId}-${achievementId}`;

      const achievement = await db.getFirstAsync<any>(
        'SELECT * FROM achievements WHERE id = ?',
        [fullId]
      );

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      const progress = Math.min(
        100,
        Math.floor((currentValue / achievement.requirementValue) * 100)
      );

      await db.runAsync(
        `UPDATE achievements SET currentValue = ?, progress = ? WHERE id = ?`,
        [currentValue, progress, fullId]
      );

      const updated = await db.getFirstAsync<any>(
        'SELECT * FROM achievements WHERE id = ?',
        [fullId]
      );

      return this.mapRowToAchievement(updated!);
    } catch (error) {
      console.error('❌ Error updating achievement progress:', error);
      throw error;
    }
  }

  /**
   * Desbloquear logro
   */
  static async unlock(userId: number, achievementId: string): Promise<Achievement> {
    try {
      const db = await getDatabase();
      const fullId = `${userId}-${achievementId}`;
      const now = new Date().toISOString();

      await db.runAsync(
        `UPDATE achievements SET 
          unlocked = 1,
          unlockedAt = ?,
          progress = 100
         WHERE id = ?`,
        [now, fullId]
      );

      const updated = await db.getFirstAsync<any>(
        'SELECT * FROM achievements WHERE id = ?',
        [fullId]
      );

      console.log('✅ Achievement unlocked:', achievementId);
      return this.mapRowToAchievement(updated!);
    } catch (error) {
      console.error('❌ Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Helper para mapear row a Achievement
   */
  private static mapRowToAchievement(row: any): Achievement {
    // Extraer el ID original (sin el prefijo userId)
    const originalId = row.id.split('-').slice(1).join('-');
    
    return {
      id: originalId,
      name: row.name,
      description: row.description,
      icon: row.icon,
      category: row.category,
      rarity: row.rarity,
      xpReward: row.xpReward,
      
      unlocked: row.unlocked === 1,
      unlockedAt: row.unlockedAt || undefined,
      progress: row.progress,
      
      requirementType: row.requirementType,
      requirementValue: row.requirementValue,
      currentValue: row.currentValue,
      
      order: row.orderIndex,
      isSecret: row.isSecret === 1,
    };
  }
}