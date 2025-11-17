import { create } from 'zustand';
import { NotificationRepository } from '../database/repositories/notificationRepository';
import { ReceivedNotification, CreateNotificationInput } from '../types/notification';

interface NotificationStore {
  // ==================== ESTADO ====================
  notifications: ReceivedNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  userId: number | null;

  // ==================== ACCIONES ====================
  setUserId: (userId: number) => void;
  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  addNotification: (input: CreateNotificationInput) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // ==================== ESTADO INICIAL ====================
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  userId: null,

  // ==================== INICIALIZACIÓN ====================
  setUserId: (userId: number) => {
    set({ userId });
    console.log('✅ Notification store - User ID set:', userId);
  },

  // ==================== CARGA DE DATOS ====================

  /**
   * Cargar todas las notificaciones
   */
  loadNotifications: async () => {
    const userId = get().userId;
    if (!userId) {
      console.warn('⚠️ No user ID set - cannot load notifications');
      return;
    }

    set({ loading: true, error: null });

    try {
      const notifications = await NotificationRepository.findByUserId(userId);
      const unreadCount = await NotificationRepository.countUnread(userId);

      set({
        notifications,
        unreadCount,
        loading: false,
      });

      console.log(`✅ Loaded ${notifications.length} notifications (${unreadCount} unread)`);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      set({
        error: error instanceof Error ? error.message : 'Error al cargar notificaciones',
        loading: false,
      });
    }
  },

  /**
   * Cargar solo el contador de no leídas
   */
  loadUnreadCount: async () => {
    const userId = get().userId;
    if (!userId) return;

    try {
      const unreadCount = await NotificationRepository.countUnread(userId);
      set({ unreadCount });
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
    }
  },

  // ==================== ACCIONES ====================

  /**
   * Agregar nueva notificación
   */
  addNotification: async (input: CreateNotificationInput) => {
    const userId = get().userId;
    if (!userId) {
      throw new Error('No user ID set');
    }

    try {
      const newNotification = await NotificationRepository.create(userId, input);

      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      console.log('✅ Notification added to store:', newNotification.id);
    } catch (error) {
      console.error('❌ Error adding notification:', error);
      throw error;
    }
  },

  /**
   * Marcar notificación como leída
   */
  markAsRead: async (id: number) => {
    try {
      await NotificationRepository.markAsRead(id);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      console.log('✅ Notification marked as read in store:', id);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Marcar todas como leídas
   */
  markAllAsRead: async () => {
    const userId = get().userId;
    if (!userId) return;

    try {
      await NotificationRepository.markAllAsRead(userId);

      const now = new Date().toISOString();
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.read ? n : { ...n, read: true, readAt: now }
        ),
        unreadCount: 0,
      }));

      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Eliminar notificación
   */
  deleteNotification: async (id: number) => {
    try {
      const notification = get().notifications.find((n) => n.id === id);
      await NotificationRepository.delete(id);

      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount:
          notification && !notification.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      }));

      console.log('✅ Notification deleted from store:', id);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Eliminar todas las leídas
   */
  deleteAllRead: async () => {
    const userId = get().userId;
    if (!userId) return;

    try {
      await NotificationRepository.deleteAllRead(userId);

      set((state) => ({
        notifications: state.notifications.filter((n) => !n.read),
      }));

      console.log('✅ All read notifications deleted');
    } catch (error) {
      console.error('❌ Error deleting read notifications:', error);
      throw error;
    }
  },

  // ==================== LIMPIEZA ====================
  clearError: () => set({ error: null }),
}));
