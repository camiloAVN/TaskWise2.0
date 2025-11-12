
import { TaskDifficulty, TaskPriority } from '../types/task';

/**
 * Obtiene los puntos base según la dificultad
 */
export const getBasePoints = (difficulty: TaskDifficulty): number => {
  const points: Record<TaskDifficulty, number> = {
    easy: 10,
    medium: 25,
    hard: 50,
    extreme: 100,
  };
  return points[difficulty];
};

/**
 * Calcula el multiplicador de bonificación total
 */
export const calculateBonusMultiplier = (params: {
  streak: number;
  priority: TaskPriority;
  completedEarly: boolean;
  isFirstTaskOfDay: boolean;
  tasksCompletedToday: number;
}): number => {
  let multiplier = 1.0;
  
  // Bonificación por racha
  if (params.streak >= 30) {
    multiplier += 1.0; // +100%
  } else if (params.streak >= 7) {
    multiplier += 0.5; // +50%
  } else if (params.streak >= 3) {
    multiplier += 0.25; // +25%
  }
  
  // Bonificación por prioridad
  if (params.priority === 'urgent') {
    multiplier += 0.2; // +20%
  } else if (params.priority === 'high') {
    multiplier += 0.15; // +15%
  }
  
  // Bonificación por completar antes de tiempo
  if (params.completedEarly) {
    multiplier += 0.25; // +25%
  }
  
  // Bonificación por primera tarea del día
  if (params.isFirstTaskOfDay) {
    multiplier += 0.2; // +20%
  }
  
  // Bonificación por completar 5+ tareas en un día
  if (params.tasksCompletedToday >= 10) {
    multiplier += 0.5; // +50%
  } else if (params.tasksCompletedToday >= 5) {
    multiplier += 0.3; // +30%
  }
  
  return multiplier;
};

/**
 * Calcula los puntos finales con bonificaciones
 */
export const calculateEarnedPoints = (
  difficulty: TaskDifficulty,
  bonusMultiplier: number
): number => {
  const basePoints = getBasePoints(difficulty);
  return Math.floor(basePoints * bonusMultiplier);
};

/**
 * Calcula los puntos totales de una tarea
 */
export const calculateTaskPoints = (params: {
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  streak: number;
  completedEarly: boolean;
  isFirstTaskOfDay: boolean;
  tasksCompletedToday: number;
}): {
  basePoints: number;
  bonusMultiplier: number;
  earnedPoints: number;
  bonusBreakdown: {
    streak: number;
    priority: number;
    early: number;
    firstTask: number;
    multiTask: number;
  };
} => {
  const basePoints = getBasePoints(params.difficulty);
  
  // Calcular cada bonificación individualmente
  let streakBonus = 0;
  if (params.streak >= 30) streakBonus = 1.0;
  else if (params.streak >= 7) streakBonus = 0.5;
  else if (params.streak >= 3) streakBonus = 0.25;
  
  let priorityBonus = 0;
  if (params.priority === 'urgent') priorityBonus = 0.2;
  else if (params.priority === 'high') priorityBonus = 0.15;
  
  const earlyBonus = params.completedEarly ? 0.25 : 0;
  const firstTaskBonus = params.isFirstTaskOfDay ? 0.2 : 0;
  
  let multiTaskBonus = 0;
  if (params.tasksCompletedToday >= 10) multiTaskBonus = 0.5;
  else if (params.tasksCompletedToday >= 5) multiTaskBonus = 0.3;
  
  const bonusMultiplier = 1 + streakBonus + priorityBonus + earlyBonus + firstTaskBonus + multiTaskBonus;
  const earnedPoints = Math.floor(basePoints * bonusMultiplier);
  
  return {
    basePoints,
    bonusMultiplier,
    earnedPoints,
    bonusBreakdown: {
      streak: streakBonus,
      priority: priorityBonus,
      early: earlyBonus,
      firstTask: firstTaskBonus,
      multiTask: multiTaskBonus,
    },
  };
};

/**
 * Formatea el multiplicador como porcentaje
 */
export const formatMultiplier = (multiplier: number): string => {
  const percentage = Math.floor((multiplier - 1) * 100);
  return percentage > 0 ? `+${percentage}%` : '0%';
};

/**
 * Obtiene el color según los puntos ganados
 */
export const getPointsColor = (points: number): string => {
  if (points >= 200) return '#FFD700'; // Oro
  if (points >= 100) return '#9C27B0'; // Púrpura
  if (points >= 50) return '#F44336'; // Rojo
  if (points >= 25) return '#FF9800'; // Naranja
  return '#4CAF50'; // Verde
};