
import { STREAK_BONUSES, StreakBonus } from '../types/streak';
import { daysDifference, getTodayDate, isYesterday } from './dateUtils';

/**
 * Verifica si la racha está activa
 */
export const isStreakActive = (lastActivityDate?: string): boolean => {
  if (!lastActivityDate) return false;
  
  const today = getTodayDate();
  return lastActivityDate === today || isYesterday(lastActivityDate);
};

/**
 * Calcula la nueva racha después de completar una tarea
 */
export const calculateNewStreak = (
  currentStreak: number,
  lastActivityDate?: string
): number => {
  const today = getTodayDate();
  
  // Si no hay actividad previa, iniciar racha en 1
  if (!lastActivityDate) return 1;
  
  // Si ya hubo actividad hoy, mantener la racha
  if (lastActivityDate === today) return currentStreak;
  
  // Si fue ayer, incrementar la racha
  if (isYesterday(lastActivityDate)) return currentStreak + 1;
  
  // Si pasó más de un día, reiniciar la racha
  return 1;
};

/**
 * Obtiene la bonificación actual de racha
 */
export const getCurrentStreakBonus = (streak: number): StreakBonus | null => {
  // Obtener la bonificación más alta que aplique
  const applicableBonuses = STREAK_BONUSES.filter(bonus => streak >= bonus.days);
  
  if (applicableBonuses.length === 0) return null;
  
  // Retornar la bonificación más alta
  return applicableBonuses[applicableBonuses.length - 1];
};

/**
 * Obtiene la siguiente bonificación de racha
 */
export const getNextStreakBonus = (streak: number): StreakBonus | null => {
  const nextBonus = STREAK_BONUSES.find(bonus => streak < bonus.days);
  return nextBonus || null;
};

/**
 * Calcula días restantes para la siguiente bonificación
 */
export const getDaysToNextBonus = (streak: number): number | null => {
  const nextBonus = getNextStreakBonus(streak);
  return nextBonus ? nextBonus.days - streak : null;
};

/**
 * Obtiene todas las bonificaciones alcanzadas
 */
export const getAchievedBonuses = (streak: number): StreakBonus[] => {
  return STREAK_BONUSES.filter(bonus => streak >= bonus.days);
};

/**
 * Formatea la racha para mostrar
 */
export const formatStreak = (streak: number): string => {
  if (streak === 0) return 'Sin racha';
  if (streak === 1) return '1 día';
  return `${streak} días`;
};

/**
 * Obtiene un mensaje motivacional según la racha
 */
export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return '¡Comienza tu racha hoy!';
  if (streak < 3) return '¡Buen comienzo! Sigue así';
  if (streak < 7) return '🔥 ¡Racha activa!';
  if (streak < 14) return '⚡ ¡Increíble racha!';
  if (streak < 30) return '💪 ¡Imparable!';
  return '🌟 ¡Eres una leyenda!';
};

/**
 * Verifica si se rompió la racha
 */
export const didStreakBreak = (lastActivityDate?: string): boolean => {
  if (!lastActivityDate) return false;
  
  const today = getTodayDate();
  const daysSince = daysDifference(lastActivityDate, today);
  
  return daysSince > 1;
};