import { getTodayDate, parseCalendarDate } from './dateUtils';

/**
 * Get the Sunday that starts the current week
 * Week definition: Sunday - Saturday
 */
export const getCurrentWeekSunday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Go back to last Sunday (or stay on Sunday if today is Sunday)
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, '0');
  const day = String(sunday.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Get date range for current week (Sunday - Saturday)
 */
export const getCurrentWeekRange = (): {
  startDate: string;
  endDate: string;
} => {
  const sunday = getCurrentWeekSunday();
  const sundayDate = parseCalendarDate(sunday);

  const saturday = new Date(sundayDate);
  saturday.setDate(sundayDate.getDate() + 6);

  const year = saturday.getFullYear();
  const month = String(saturday.getMonth() + 1).padStart(2, '0');
  const day = String(saturday.getDate()).padStart(2, '0');
  const endDate = `${year}-${month}-${day}`;

  return { startDate: sunday, endDate };
};

/**
 * Check if modal should be shown
 * Show if lastShownDate is null or before current week's Sunday
 */
export const shouldShowWeeklyModal = (lastShownDate?: string): boolean => {
  if (!lastShownDate) return true;

  const currentWeekSunday = getCurrentWeekSunday();
  return lastShownDate < currentWeekSunday;
};

/**
 * Get next Sunday at 7pm from now
 */
export const getNextSunday7PM = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Days until next Sunday (0-6 days)
  let daysUntilSunday = 7 - dayOfWeek;

  // If today is Sunday, check if it's before 7pm
  if (dayOfWeek === 0) {
    const targetTime = new Date(now);
    targetTime.setHours(19, 0, 0, 0); // 7pm

    if (now < targetTime) {
      // Today before 7pm, schedule for today at 7pm
      daysUntilSunday = 0;
    } else {
      // Today after 7pm, schedule for next Sunday
      daysUntilSunday = 7;
    }
  }

  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(19, 0, 0, 0); // 7pm

  return nextSunday;
};

/**
 * Get day name abbreviations for checkboxes
 */
export const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Calculate date for a specific day of current week
 * @param dayIndex 0 = Sunday, 6 = Saturday
 */
export const getWeekDayDate = (dayIndex: number): string => {
  if (dayIndex < 0 || dayIndex > 6) {
    throw new Error('dayIndex must be between 0 and 6');
  }

  const sunday = getCurrentWeekSunday();
  const sundayDate = parseCalendarDate(sunday);

  const targetDate = new Date(sundayDate);
  targetDate.setDate(sundayDate.getDate() + dayIndex);

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
