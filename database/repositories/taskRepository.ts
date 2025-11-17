
import { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from '../../types/task';
import { getBasePoints } from '../../utils/xpUtils';
import { getDatabase } from '../config';

export class TaskRepository {
  /**
   * Crear tarea
   */
  static async create(userId: number, input: CreateTaskInput): Promise<Task> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();
      const basePoints = getBasePoints(input.difficulty);

      const result = await db.runAsync(
        `INSERT INTO tasks (
          userId, title, description, difficulty, category, priority,
          basePoints, dueDate, dueTime, estimatedTime, status,
          hasReminder, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          input.title,
          input.description || null,
          input.difficulty,
          input.category || 'other',
          input.priority || 'medium',
          basePoints,
          input.dueDate || null,
          input.dueTime || null,
          input.estimatedTime || null,
          'pending',
          input.hasReminder ? 1 : 0,
          now,
          now,
        ]
      );

      const task = await this.findById(result.lastInsertRowId);
      if (!task) {
        throw new Error('Failed to create task');
      }

      console.log('✅ Task created:', task.id);
      return task;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  }

  /**
   * Obtener tarea por ID
   */
  static async findById(id: number): Promise<Task | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToTask(row) : null;
    } catch (error) {
      console.error('❌ Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las tareas de un usuario
   */
  static async findByUserId(userId: number): Promise<Task[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );

      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Obtener tareas por estado
   */
  static async findByStatus(userId: number, status: TaskStatus): Promise<Task[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ? AND status = ? ORDER BY createdAt DESC',
        [userId, status]
      );

      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching tasks by status:', error);
      throw error;
    }
  }

  /**
   * Obtener tareas completadas
   */
  static async findCompleted(userId: number): Promise<Task[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ? AND completed = 1 ORDER BY completedAt DESC',
        [userId]
      );

      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching completed tasks:', error);
      throw error;
    }
  }

  /**
   * Obtener tareas pendientes
   */
  static async findPending(userId: number): Promise<Task[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ? AND completed = 0 AND status = ? ORDER BY dueDate ASC, priority ASC',
        [userId, 'pending']
      );

      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching pending tasks:', error);
      throw error;
    }
  }

  /**
   * Obtener tareas por fecha
   */
  static async findByDate(userId: number, date: string): Promise<Task[]> {
    try {
      const db = await getDatabase();
      console.log('🔍 Finding tasks for date:', date); // Debug
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ? AND dueDate = ? ORDER BY dueTime ASC',
        [userId, date]
      );

      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching tasks by date:', error);
      throw error;
    }
  }

  /**
   * Obtener tareas por rango de fechas
   */
  static async findByDateRange(
    userId: number, 
    startDate: string, 
    endDate: string
  ): Promise<Task[]> {
    try {
      const db = await getDatabase();
      
      console.log('🔍 Finding tasks between:', startDate, 'and', endDate);
      
      const rows = await db.getAllAsync<any>(
        `SELECT * FROM tasks 
        WHERE userId = ? 
        AND dueDate >= ? 
        AND dueDate <= ? 
        ORDER BY dueDate ASC, dueTime ASC`,
        [userId, startDate, endDate]
      );

      console.log('📊 Found tasks in range:', rows.length);
      
      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching tasks by date range:', error);
      throw error;
    }
  }
  
  static async findByMonth(userId: number, year: number, month: number): Promise<Task[]> {
    try {
      const db = await getDatabase();
      
      // Primer día del mes
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      
      // Último día del mes
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      console.log('🔍 Finding tasks for month:', startDate, 'to', endDate);
      
      const rows = await db.getAllAsync<any>(
        `SELECT * FROM tasks 
        WHERE userId = ? 
        AND dueDate >= ? 
        AND dueDate <= ? 
        ORDER BY dueDate ASC, dueTime ASC`,
        [userId, startDate, endDate]
      );

      console.log('📊 Found tasks in month:', rows.length);
      
      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching tasks by month:', error);
      throw error;
    }
  }
  /**
   * Obtener tareas por categoría
   */
  static async findByCategory(userId: number, category: string): Promise<Task[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ? AND category = ? ORDER BY createdAt DESC',
        [userId, category]
      );

      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching tasks by category:', error);
      throw error;
    }
  }

  /**
   * Obtener tareas por dificultad
   */
  static async findByDifficulty(userId: number, difficulty: string): Promise<Task[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM tasks WHERE userId = ? AND difficulty = ? ORDER BY createdAt DESC',
        [userId, difficulty]
      );

      return rows.map(this.mapRowToTask);
    } catch (error) {
      console.error('❌ Error fetching tasks by difficulty:', error);
      throw error;
    }
  }

  /**
   * Actualizar tarea
   */
  static async update(id: number, input: UpdateTaskInput): Promise<Task> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      const fields: string[] = [];
      const values: any[] = [];

      if (input.title !== undefined) {
        fields.push('title = ?');
        values.push(input.title);
      }
      if (input.description !== undefined) {
        fields.push('description = ?');
        values.push(input.description);
      }
      if (input.difficulty !== undefined) {
        fields.push('difficulty = ?');
        values.push(input.difficulty);
        fields.push('basePoints = ?');
        values.push(getBasePoints(input.difficulty));
      }
      if (input.category !== undefined) {
        fields.push('category = ?');
        values.push(input.category);
      }
      if (input.priority !== undefined) {
        fields.push('priority = ?');
        values.push(input.priority);
      }
      if (input.status !== undefined) {
        fields.push('status = ?');
        values.push(input.status);
      }
      if (input.dueDate !== undefined) {
        fields.push('dueDate = ?');
        values.push(input.dueDate);
      }
      if (input.dueTime !== undefined) {
        fields.push('dueTime = ?');
        values.push(input.dueTime);
      }
      if (input.estimatedTime !== undefined) {
        fields.push('estimatedTime = ?');
        values.push(input.estimatedTime);
      }
      if (input.hasReminder !== undefined) {
        fields.push('hasReminder = ?');
        values.push(input.hasReminder ? 1 : 0);
      }

      fields.push('updatedAt = ?');
      values.push(now);
      values.push(id);

      await db.runAsync(
        `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      const task = await this.findById(id);
      if (!task) {
        throw new Error('Task not found after update');
      }

      console.log('✅ Task updated:', id);
      return task;
    } catch (error) {
      console.error('❌ Error updating task:', error);
      throw error;
    }
  }

  /**
   * Completar tarea
   */
  static async complete(
    id: number,
    earnedPoints: number,
    bonusMultiplier: number,
    flags: {
      completedEarly: boolean;
      isFirstTaskOfDay: boolean;
      completedDuringStreak: boolean;
    }
  ): Promise<Task> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();
          console.log('📝 Completing task in DB:');
    console.log('   - ID:', id);
    console.log('   - Earned Points:', earnedPoints);
    console.log('   - Completed At:', now);

      await db.runAsync(
        `UPDATE tasks SET 
          completed = 1,
          status = 'completed',
          completedAt = ?,
          earnedPoints = ?,
          bonusMultiplier = ?,
          completedEarly = ?,
          isFirstTaskOfDay = ?,
          completedDuringStreak = ?,
          updatedAt = ?
         WHERE id = ?`,
        [
          now,
          earnedPoints,
          bonusMultiplier,
          flags.completedEarly ? 1 : 0,
          flags.isFirstTaskOfDay ? 1 : 0,
          flags.completedDuringStreak ? 1 : 0,
          now,
          id,
        ]
      );
const updatedTask = await this.findById(id);
      console.log('✅ Task completed:', id);
          console.log('   - Completed:', updatedTask?.completed);
    console.log('   - Earned Points:', updatedTask?.earnedPoints);
        if (!updatedTask) {
      throw new Error('Failed to get updated task');
    }
      return (await this.findById(id))!;
    } catch (error) {
      console.error('❌ Error completing task:', error);
      throw error;
    }
  }

  /**
   * Toggle completed
   */
static async toggleCompleted(id: number): Promise<Task> {
  try {
    const db = await getDatabase();
    
    // Obtener tarea actual
    const task = await this.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const newCompleted = !task.completed;
    const now = new Date().toISOString();

    console.log('🔄 Toggling task in DB:', id, 'New state:', newCompleted);

    // Actualizar en DB
    await db.runAsync(
      `UPDATE tasks 
       SET completed = ?, 
           completedAt = ?,
           updatedAt = ?
       WHERE id = ?`,
      [newCompleted ? 1 : 0, newCompleted ? now : null, now, id]
    );

    // Obtener tarea actualizada
    const updatedTask = await this.findById(id);
    if (!updatedTask) {
      throw new Error('Failed to get updated task');
    }

    console.log('✅ Task toggled in DB:', id, 'Completed:', updatedTask.completed);
    
    return updatedTask;
  } catch (error) {
    console.error('❌ Error toggling task:', error);
    throw error;
  }
}

  /**
   * Actualizar notificationId de una tarea
   */
  static async updateNotificationId(id: number, notificationId: string | null): Promise<void> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      await db.runAsync(
        `UPDATE tasks SET notificationId = ?, updatedAt = ? WHERE id = ?`,
        [notificationId, now, id]
      );

      console.log('✅ Task notificationId updated:', id, notificationId);
    } catch (error) {
      console.error('❌ Error updating notificationId:', error);
      throw error;
    }
  }

  /**
   * Eliminar tarea
   */
  static async delete(id: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
      console.log('✅ Task deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Eliminar tareas completadas
   */
  static async deleteCompleted(userId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'DELETE FROM tasks WHERE userId = ? AND completed = 1',
        [userId]
      );
      console.log('✅ Completed tasks deleted');
    } catch (error) {
      console.error('❌ Error deleting completed tasks:', error);
      throw error;
    }
  }

  /**
   * Helper para mapear row a Task
   */
  private static mapRowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed === 1,
      status: row.status,

      difficulty: row.difficulty,
      category: row.category,
      priority: row.priority,
      basePoints: row.basePoints,
      bonusMultiplier: row.bonusMultiplier,
      earnedPoints: row.earnedPoints,

      dueDate: row.dueDate || undefined,
      dueTime: row.dueTime || undefined,
      estimatedTime: row.estimatedTime || undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      completedAt: row.completedAt || undefined,

      completedEarly: row.completedEarly === 1,
      isFirstTaskOfDay: row.isFirstTaskOfDay === 1,
      completedDuringStreak: row.completedDuringStreak === 1,

      hasReminder: row.hasReminder === 1,
      notificationId: row.notificationId || undefined,
    };
  }
}