import { CreateGoalInput, Goal, GOAL_XP_REWARDS, UpdateGoalInput } from '../../types/goal';
import { getDatabase } from '../config';

export class GoalRepository {
  /**
   * Crear una nueva meta
   */
  static async create(
    userId: number,
    input: CreateGoalInput
  ): Promise<Goal> {
    const db = await getDatabase();

    const xpReward = GOAL_XP_REWARDS[input.type];
    const createdAt = new Date().toISOString();
    const notificationEnabled = input.notificationEnabled ?? false;

    const result = await db.runAsync(
      `INSERT INTO goals (userId, type, title, description, xpReward, createdAt, year, month, reminderDate, notificationEnabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        input.type,
        input.title,
        input.description || null,
        xpReward,
        createdAt,
        input.year,
        input.month || null,
        input.reminderDate || null,
        notificationEnabled ? 1 : 0,
      ]
    );

    return {
      id: result.lastInsertRowId,
      userId,
      type: input.type,
      title: input.title,
      description: input.description,
      completed: false,
      failed: false,
      xpReward,
      createdAt,
      year: input.year,
      month: input.month,
      reminderDate: input.reminderDate,
      notificationEnabled,
    };
  }

  /**
   * Obtener meta por ID
   */
  static async findById(id: number): Promise<Goal | null> {
    const db = await getDatabase();

    const result = await db.getFirstAsync<Goal>(
      'SELECT * FROM goals WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      ...result,
      completed: Boolean(result.completed),
      failed: Boolean(result.failed),
      notificationEnabled: Boolean(result.notificationEnabled),
    };
  }

  /**
   * Obtener todas las metas de un usuario por tipo
   */
  static async findByUserAndType(
    userId: number,
    type: 'monthly' | 'yearly'
  ): Promise<Goal[]> {
    const db = await getDatabase();

    const results = await db.getAllAsync<Goal>(
      'SELECT * FROM goals WHERE userId = ? AND type = ? ORDER BY year DESC, month DESC, createdAt DESC',
      [userId, type]
    );

    return results.map(goal => ({
      ...goal,
      completed: Boolean(goal.completed),
      failed: Boolean(goal.failed),
      notificationEnabled: Boolean(goal.notificationEnabled),
    }));
  }

  /**
   * Obtener metas mensuales de un mes específico
   */
  static async findMonthlyByYearMonth(
    userId: number,
    year: number,
    month: number
  ): Promise<Goal[]> {
    const db = await getDatabase();

    const results = await db.getAllAsync<Goal>(
      'SELECT * FROM goals WHERE userId = ? AND type = ? AND year = ? AND month = ? ORDER BY createdAt DESC',
      [userId, 'monthly', year, month]
    );

    return results.map(goal => ({
      ...goal,
      completed: Boolean(goal.completed),
      failed: Boolean(goal.failed),
      notificationEnabled: Boolean(goal.notificationEnabled),
    }));
  }

  /**
   * Obtener metas anuales de un año específico
   */
  static async findYearlyByYear(
    userId: number,
    year: number
  ): Promise<Goal[]> {
    const db = await getDatabase();

    const results = await db.getAllAsync<Goal>(
      'SELECT * FROM goals WHERE userId = ? AND type = ? AND year = ? ORDER BY createdAt DESC',
      [userId, 'yearly', year]
    );

    return results.map(goal => ({
      ...goal,
      completed: Boolean(goal.completed),
      failed: Boolean(goal.failed),
      notificationEnabled: Boolean(goal.notificationEnabled),
    }));
  }

  /**
   * Actualizar una meta
   */
  static async update(id: number, input: UpdateGoalInput): Promise<Goal> {
    const db = await getDatabase();

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }

    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }

    if (input.completed !== undefined) {
      updates.push('completed = ?');
      values.push(input.completed ? 1 : 0);

      if (input.completed) {
        updates.push('completedAt = ?');
        values.push(new Date().toISOString());
      } else {
        updates.push('completedAt = ?');
        values.push(null);
      }
    }

    if (input.reminderDate !== undefined) {
      updates.push('reminderDate = ?');
      values.push(input.reminderDate);
    }

    if (input.notificationEnabled !== undefined) {
      updates.push('notificationEnabled = ?');
      values.push(input.notificationEnabled ? 1 : 0);
    }

    if (input.notificationId !== undefined) {
      updates.push('notificationId = ?');
      values.push(input.notificationId);
    }

    values.push(id);

    await db.runAsync(
      `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Goal not found after update');
    }

    return updated;
  }

  /**
   * Completar/descompletar una meta
   */
  static async toggleCompleted(id: number): Promise<Goal> {
    const db = await getDatabase();

    const goal = await this.findById(id);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const newCompleted = !goal.completed;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    await db.runAsync(
      'UPDATE goals SET completed = ?, completedAt = ? WHERE id = ?',
      [newCompleted ? 1 : 0, completedAt, id]
    );

    return this.update(id, { completed: newCompleted });
  }

  /**
   * Eliminar una meta
   */
  static async delete(id: number): Promise<void> {
    const db = await getDatabase();

    await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
  }

  /**
   * Obtener estadísticas de metas de un usuario
   */
  static async getStats(userId: number): Promise<{
    totalMonthly: number;
    completedMonthly: number;
    totalYearly: number;
    completedYearly: number;
  }> {
    const db = await getDatabase();

    const monthlyStats = await db.getFirstAsync<{ total: number; completed: number }>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
      FROM goals
      WHERE userId = ? AND type = ?`,
      [userId, 'monthly']
    );

    const yearlyStats = await db.getFirstAsync<{ total: number; completed: number }>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
      FROM goals
      WHERE userId = ? AND type = ?`,
      [userId, 'yearly']
    );

    return {
      totalMonthly: monthlyStats?.total || 0,
      completedMonthly: monthlyStats?.completed || 0,
      totalYearly: yearlyStats?.total || 0,
      completedYearly: yearlyStats?.completed || 0,
    };
  }

  /**
   * Marcar una meta como fallida (no se cumplió en el tiempo establecido)
   */
  static async markAsFailed(id: number): Promise<Goal> {
    const db = await getDatabase();

    const goal = await this.findById(id);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const failedAt = new Date().toISOString();

    await db.runAsync(
      'UPDATE goals SET failed = 1, failedAt = ? WHERE id = ?',
      [failedAt, id]
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Goal not found after update');
    }

    return updated;
  }

  /**
   * Obtener metas vencidas (fecha pasada, no completadas y no fallidas)
   */
  static async findExpiredGoals(userId: number): Promise<Goal[]> {
    const db = await getDatabase();

    const now = new Date().toISOString();

    const results = await db.getAllAsync<Goal>(
      `SELECT * FROM goals
       WHERE userId = ?
       AND completed = 0
       AND failed = 0
       AND reminderDate IS NOT NULL
       AND reminderDate < ?
       ORDER BY reminderDate ASC`,
      [userId, now]
    );

    return results.map(goal => ({
      ...goal,
      completed: Boolean(goal.completed),
      failed: Boolean(goal.failed),
      notificationEnabled: Boolean(goal.notificationEnabled),
    }));
  }
}
