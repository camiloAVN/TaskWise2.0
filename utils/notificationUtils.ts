import * as Notifications from 'expo-notifications';
import { Platform, LogBox } from 'react-native';

// Ignorar warning sobre remote notifications (solo usamos notificaciones locales)
LogBox.ignoreLogs([
  'expo-notifications: android push notifications',
]);

/**
 * Configura el comportamiento de las notificaciones
 */
export const configureNotifications = async (): Promise<void> => {
  // Configurar cómo se mostrarán las notificaciones cuando la app esté en primer plano
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Configurar canales de notificaciones en Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Recordatorios de Tareas',
      description: 'Notificaciones para recordarte tus tareas programadas',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#d9f434',
    });

    await Notifications.setNotificationChannelAsync('goal-reminders', {
      name: 'Recordatorios de Metas',
      description: 'Notificaciones para verificar el cumplimiento de tus metas',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#d9f434',
    });
  }
};

/**
 * Solicita permisos para mostrar notificaciones
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Notification permissions not granted');
      return false;
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Programa una notificación para una tarea
 */
export const scheduleTaskNotification = async (
  taskId: number,
  title: string,
  dueDate: string,
  dueTime: string
): Promise<string | null> => {
  try {
    // Verificar permisos
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Combinar fecha y hora
    const [year, month, day] = dueDate.split('-').map(Number);
    const [hours, minutes] = dueTime.split(':').map(Number);

    const triggerDate = new Date(year, month - 1, day, hours, minutes);

    // Verificar que la fecha sea futura
    const now = new Date();
    if (triggerDate <= now) {
      console.warn('⚠️ Cannot schedule notification for past date');
      return null;
    }

    // Programar la notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Recordatorio de Tarea',
        body: title,
        data: { taskId, taskTitle: title },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#d9f434',
      },
      trigger: triggerDate,
    });

    console.log(`✅ Notification scheduled: ${notificationId} for ${triggerDate.toISOString()}`);
    return notificationId;
  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
    return null;
  }
};

/**
 * Cancela una notificación programada
 */
export const cancelTaskNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`✅ Notification cancelled: ${notificationId}`);
  } catch (error) {
    console.error('❌ Error cancelling notification:', error);
  }
};

/**
 * Cancela todas las notificaciones programadas
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('❌ Error cancelling all notifications:', error);
  }
};

/**
 * Obtiene todas las notificaciones programadas
 */
export const getAllScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Verifica si una tarea tiene una notificación válida programada
 */
export const hasValidNotification = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const allNotifications = await getAllScheduledNotifications();
    return allNotifications.some((n) => n.identifier === notificationId);
  } catch (error) {
    console.error('❌ Error checking notification validity:', error);
    return false;
  }
};

/**
 * Programa una notificación para una meta
 */
export const scheduleGoalNotification = async (
  goalId: number,
  title: string,
  reminderDate: string
): Promise<string | null> => {
  try {
    // Verificar permisos
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Parsear la fecha del recordatorio (ISO string)
    const triggerDate = new Date(reminderDate);

    // Verificar que la fecha sea futura
    const now = new Date();
    if (triggerDate <= now) {
      console.warn('⚠️ Cannot schedule goal notification for past date');
      return null;
    }

    // Programar la notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 ¿Lograste cumplir esta meta?',
        body: title,
        data: { goalId, goalTitle: title, type: 'goal' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#d9f434',
      },
      trigger: triggerDate,
    });

    console.log(`✅ Goal notification scheduled: ${notificationId} for ${triggerDate.toISOString()}`);
    return notificationId;
  } catch (error) {
    console.error('❌ Error scheduling goal notification:', error);
    return null;
  }
};

/**
 * Cancela una notificación de meta programada
 */
export const cancelGoalNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`✅ Goal notification cancelled: ${notificationId}`);
  } catch (error) {
    console.error('❌ Error cancelling goal notification:', error);
  }
};
