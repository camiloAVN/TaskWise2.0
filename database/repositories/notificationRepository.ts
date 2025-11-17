import { CreateNotificationInput, ReceivedNotification } from '../../types/notification';
import { getDatabase } from '../config';

export class NotificationRepository {
  /**
   * Crear notificación recibida
   */
  static async create(userId: number, input: CreateNotificationInput): Promise<ReceivedNotification> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      const result = await db.runAsync(
        `INSERT INTO received_notifications (
          userId, taskId, taskTitle, type, receivedAt
        ) VALUES (?, ?, ?, ?, ?)`,
        [userId, input.taskId, input.taskTitle, input.type, now]
      );

      const notification = await this.findById(result.lastInsertRowId);
      if (!notification) {
        throw new Error('Failed to create notification');
      }

      console.log('✅ Notification created:', notification.id);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Obtener notificación por ID
   */
  static async findById(id: number): Promise<ReceivedNotification | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM received_notifications WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToNotification(row) : null;
    } catch (error) {
      console.error('❌ Error fetching notification:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las notificaciones de un usuario
   */
  static async findByUserId(userId: number): Promise<ReceivedNotification[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM received_notifications WHERE userId = ? ORDER BY receivedAt DESC',
        [userId]
      );

      return rows.map(this.mapRowToNotification);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones no leídas de un usuario
   */
  static async findUnreadByUserId(userId: number): Promise<ReceivedNotification[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM received_notifications WHERE userId = ? AND read = 0 ORDER BY receivedAt DESC',
        [userId]
      );

      return rows.map(this.mapRowToNotification);
    } catch (error) {
      console.error('❌ Error fetching unread notifications:', error);
      throw error;
    }
  }

  /**
   * Contar notificaciones no leídas
   */
  static async countUnread(userId: number): Promise<number> {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM received_notifications WHERE userId = ? AND read = 0',
        [userId]
      );

      return result?.count || 0;
    } catch (error) {
      console.error('❌ Error counting unread notifications:', error);
      return 0;
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(id: number): Promise<void> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      await db.runAsync(
        'UPDATE received_notifications SET read = 1, readAt = ? WHERE id = ?',
        [now, id]
      );

      console.log('✅ Notification marked as read:', id);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(userId: number): Promise<void> {
    try {
      const db = await getDatabase();
      const now = new Date().toISOString();

      await db.runAsync(
        'UPDATE received_notifications SET read = 1, readAt = ? WHERE userId = ? AND read = 0',
        [now, userId]
      );

      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificación
   */
  static async delete(id: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM received_notifications WHERE id = ?', [id]);
      console.log('✅ Notification deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Eliminar todas las notificaciones leídas
   */
  static async deleteAllRead(userId: number): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'DELETE FROM received_notifications WHERE userId = ? AND read = 1',
        [userId]
      );
      console.log('✅ All read notifications deleted');
    } catch (error) {
      console.error('❌ Error deleting read notifications:', error);
      throw error;
    }
  }

  /**
   * Helper para mapear row a ReceivedNotification
   */
  private static mapRowToNotification(row: any): ReceivedNotification {
    return {
      id: row.id,
      userId: row.userId,
      taskId: row.taskId,
      taskTitle: row.taskTitle,
      type: row.type,
      receivedAt: row.receivedAt,
      read: row.read === 1,
      readAt: row.readAt || undefined,
    };
  }
}
