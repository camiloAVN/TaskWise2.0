import { CreateUserInput, UpdateUserInput, User } from '../../types/user';
import { calculateLevelProgress, getCategoryFromLevel } from '../../utils/levelUtils';
import { getDatabase } from '../config';

export class UserRepository {
  /**
   * Crear usuario
   */
static async create(input: CreateUserInput): Promise<User> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO users (name, avatar, age, email, createdAt, lastActivity)
       VALUES (?, ?, ?, ?, ?, ?)`,  // ⭐ Agregar age y email
      [
        input.name, 
        input.avatar || null, 
        input.age || null,  // ⭐ NUEVO
        input.email || null,  // ⭐ NUEVO
        now, 
        now
      ]
    );

    const user = await this.findById(result.lastInsertRowId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    console.log('✅ User created:', user.id);
    return user;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}
  /**
   * Obtener usuario por ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToUser(row) : null;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Obtener el primer usuario (para apps de usuario único)
   */
  static async getFirstUser(): Promise<User | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM users ORDER BY id ASC LIMIT 1'
      );

      return row ? this.mapRowToUser(row) : null;
    } catch (error) {
      console.error('❌ Error fetching first user:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios
   */
  static async findAll(): Promise<User[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM users ORDER BY id ASC'
      );

      return rows.map(this.mapRowToUser);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
static async update(id: number, input: UpdateUserInput): Promise<User> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      fields.push('name = ?');
      values.push(input.name);
    }
    if (input.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(input.avatar);
    }
    // ⭐ AGREGAR ESTOS CAMPOS
    if (input.age !== undefined) {
      fields.push('age = ?');
      values.push(input.age);
    }
    if (input.email !== undefined) {
      fields.push('email = ?');
      values.push(input.email);
    }

    fields.push('lastActivity = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found after update');
    }

    console.log('✅ User updated:', id);
    return user;
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }
}

  /**
   * Agregar XP al usuario
   */
  static async addXP(id: number, xpToAdd: number): Promise<User> {
    try {
      const db = await getDatabase();
      const user = await this.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const newTotalXP = user.totalXP + xpToAdd;
      const levelProgress = calculateLevelProgress(newTotalXP);
      const newCategory = getCategoryFromLevel(levelProgress.currentLevel);

      await db.runAsync(
        `UPDATE users SET 
          totalXP = ?,
          currentLevel = ?,
          currentLevelXP = ?,
          nextLevelXP = ?,
          category = ?,
          lastActivity = ?
         WHERE id = ?`,
        [
          newTotalXP,
          levelProgress.currentLevel,
          levelProgress.currentLevelXP,
          levelProgress.nextLevelXP,
          newCategory,
          new Date().toISOString(),
          id,
        ]
      );

      console.log(`✅ Added ${xpToAdd} XP to user ${id}`);
      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error adding XP:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de tareas completadas
   */
  static async incrementTasksCompleted(id: number): Promise<User> {
    try {
      const db = await getDatabase();
      
      await db.runAsync(
        `UPDATE users SET 
          totalTasksCompleted = totalTasksCompleted + 1,
          tasksCompletedToday = tasksCompletedToday + 1,
          tasksCompletedThisWeek = tasksCompletedThisWeek + 1,
          tasksCompletedThisMonth = tasksCompletedThisMonth + 1,
          lastActivity = ?
         WHERE id = ?`,
        [new Date().toISOString(), id]
      );

      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error incrementing tasks:', error);
      throw error;
    }
  }

  /**
   * Actualizar racha
   */
  static async updateStreak(
    id: number,
    currentStreak: number,
    lastTaskDate: string
  ): Promise<User> {
    try {
      const db = await getDatabase();
      const user = await this.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const bestStreak = Math.max(user.bestStreak, currentStreak);

      await db.runAsync(
        `UPDATE users SET 
          currentStreak = ?,
          bestStreak = ?,
          lastTaskDate = ?,
          lastActivity = ?
         WHERE id = ?`,
        [
          currentStreak,
          bestStreak,
          lastTaskDate,
          new Date().toISOString(),
          id,
        ]
      );

      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Resetear contadores diarios
   */
  static async resetDailyCounters(id: number): Promise<User> {
    try {
      const db = await getDatabase();

      await db.runAsync(
        `UPDATE users SET 
          tasksCompletedToday = 0,
          dailyMissionsCompletedToday = 0
         WHERE id = ?`,
        [id]
      );

      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error resetting daily counters:', error);
      throw error;
    }
  }

  /**
   * Resetear contadores semanales
   */
  static async resetWeeklyCounters(id: number): Promise<User> {
    try {
      const db = await getDatabase();

      await db.runAsync(
        `UPDATE users SET tasksCompletedThisWeek = 0 WHERE id = ?`,
        [id]
      );

      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error resetting weekly counters:', error);
      throw error;
    }
  }

  /**
   * Resetear contadores mensuales
   */
  static async resetMonthlyCounters(id: number): Promise<User> {
    try {
      const db = await getDatabase();

      await db.runAsync(
        `UPDATE users SET tasksCompletedThisMonth = 0 WHERE id = ?`,
        [id]
      );

      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error resetting monthly counters:', error);
      throw error;
    }
  }

  /**
   * Agregar logro desbloqueado
   */
  static async addAchievement(id: number, achievementId: string): Promise<User> {
    try {
      const db = await getDatabase();
      const user = await this.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Verificar si ya tiene el logro
      if (user.achievementsUnlocked.includes(achievementId)) {
        console.log('ℹ️ Achievement already unlocked');
        return user;
      }

      await db.runAsync(
        `UPDATE users SET 
          totalAchievements = totalAchievements + 1,
          lastActivity = ?
         WHERE id = ?`,
        [new Date().toISOString(), id]
      );

      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error adding achievement:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  static async delete(id: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
      console.log('✅ User deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Helper para mapear row a User
   */
private static mapRowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar || undefined,
    age: row.age || undefined,  // ⭐ NUEVO
    email: row.email || undefined,  // ⭐ NUEVO
    
    totalXP: row.totalXP,
    currentLevel: row.currentLevel,
    currentLevelXP: row.currentLevelXP,
    nextLevelXP: row.nextLevelXP,
    category: row.category,
    
    totalTasksCompleted: row.totalTasksCompleted,
    tasksCompletedToday: row.tasksCompletedToday,
    tasksCompletedThisWeek: row.tasksCompletedThisWeek,
    tasksCompletedThisMonth: row.tasksCompletedThisMonth,
    
    currentStreak: row.currentStreak,
    bestStreak: row.bestStreak,
    lastTaskDate: row.lastTaskDate || undefined,
    
    achievementsUnlocked: [],
    totalAchievements: row.totalAchievements,
    
    dailyMissionsCompletedToday: row.dailyMissionsCompletedToday,
    dailyMissionsStreak: row.dailyMissionsStreak,
    
    createdAt: row.createdAt,
    lastActivity: row.lastActivity,
  };
}
}