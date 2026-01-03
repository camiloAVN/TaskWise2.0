import * as Notifications from 'expo-notifications';
import { UserRepository } from '../database/repositories/userRepository';
import { requestNotificationPermissions } from './notificationUtils';
import { getTodayDate } from './dateUtils';
import { getNextSunday7PM } from './weekUtils';

/**
 * Schedule weekly planning notification for next Sunday at 7pm
 */
export const scheduleWeeklyPlanningNotification = async (
  userId: number
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('⚠️ No notification permissions for weekly planning');
      return null;
    }

    const triggerDate = getNextSunday7PM();

    // Check if date is in the future
    if (triggerDate <= new Date()) {
      console.warn('⚠️ Next Sunday 7pm is not in the future, skipping');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Planifica tu Semana',
        body: '¡Es hora de organizar tus tareas para la semana!',
        data: { type: 'weekly_planning', userId },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#d9f434',
      },
      trigger: triggerDate,
    });

    console.log(
      `✅ Weekly planning notification scheduled for ${triggerDate.toISOString()}: ${notificationId}`
    );
    return notificationId;
  } catch (error) {
    console.error('❌ Error scheduling weekly planning notification:', error);
    return null;
  }
};

/**
 * Cancel existing weekly planning notification
 */
export const cancelWeeklyPlanningNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`✅ Weekly planning notification cancelled: ${notificationId}`);
  } catch (error) {
    console.error('❌ Error cancelling weekly planning notification:', error);
  }
};

/**
 * Reschedule weekly planning notification
 * Called when: 1) Modal is shown, 2) Notification is received
 */
export const rescheduleWeeklyPlanningNotification = async (
  userId: number,
  oldNotificationId?: string
): Promise<string | null> => {
  try {
    // Cancel old notification
    if (oldNotificationId) {
      await cancelWeeklyPlanningNotification(oldNotificationId);
    }

    // Schedule new notification
    const newNotificationId = await scheduleWeeklyPlanningNotification(userId);

    // Update in database
    if (newNotificationId) {
      await UserRepository.updateWeeklyModalTracking(
        userId,
        getTodayDate(),
        newNotificationId
      );
    }

    return newNotificationId;
  } catch (error) {
    console.error('❌ Error rescheduling weekly planning notification:', error);
    return null;
  }
};
