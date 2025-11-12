import {
    DAILY_MISSION_TEMPLATES,
    DailyMission,
    MISSION_DIFFICULTY_CONFIG
} from '../types/dailyMission';
import { getTodayDate } from './dateUtils';

/**
 * Genera misiones diarias aleatorias para una fecha
 */
export const generateDailyMissions = (date: string): DailyMission[] => {
  // Seleccionar 3 misiones aleatorias de diferentes dificultades
  const easyMissions = DAILY_MISSION_TEMPLATES.filter(t => t.difficulty === 'easy');
  const mediumMissions = DAILY_MISSION_TEMPLATES.filter(t => t.difficulty === 'medium');
  const hardMissions = DAILY_MISSION_TEMPLATES.filter(t => t.difficulty === 'hard');
  
  const selectedMissions = [
    easyMissions[Math.floor(Math.random() * easyMissions.length)],
    mediumMissions[Math.floor(Math.random() * mediumMissions.length)],
    hardMissions[Math.floor(Math.random() * hardMissions.length)],
  ];
  
  return selectedMissions.map((template, index) => ({
    id: `${date}-${index}`,
    date,
    title: template.title,
    description: template.descriptionTemplate.replace('{count}', template.targetValue.toString()),
    icon: template.icon,
    type: template.type,
    difficulty: template.difficulty,
    targetValue: template.targetValue,
    currentValue: 0,
    completed: false,
    xpReward: MISSION_DIFFICULTY_CONFIG[template.difficulty].xpReward,
    bonusXP: 50, // Bonus por completar todas las misiones
    order: index,
  }));
};

/**
 * Actualiza el progreso de una misión
 */
export const updateMissionProgress = (
  mission: DailyMission,
  increment: number = 1
): DailyMission => {
  const newValue = Math.min(mission.currentValue + increment, mission.targetValue);
  const completed = newValue >= mission.targetValue;
  
  return {
    ...mission,
    currentValue: newValue,
    completed,
    completedAt: completed && !mission.completed ? new Date().toISOString() : mission.completedAt,
  };
};

/**
 * Verifica si todas las misiones del día están completadas
 */
export const areAllMissionsCompleted = (missions: DailyMission[]): boolean => {
  return missions.every(m => m.completed);
};

/**
 * Calcula el XP total de las misiones (incluyendo bonus)
 */
export const calculateMissionsXP = (missions: DailyMission[]): {
  earnedXP: number;
  potentialXP: number;
  bonusXP: number;
  totalPossibleXP: number;
} => {
  const completedMissions = missions.filter(m => m.completed);
  const earnedXP = completedMissions.reduce((sum, m) => sum + m.xpReward, 0);
  const potentialXP = missions.reduce((sum, m) => sum + m.xpReward, 0);
  const bonusXP = areAllMissionsCompleted(missions) ? missions[0].bonusXP : 0;
  const totalPossibleXP = potentialXP + (missions[0]?.bonusXP || 0);
  
  return {
    earnedXP,
    potentialXP,
    bonusXP,
    totalPossibleXP,
  };
};

/**
 * Obtiene el progreso general de las misiones diarias
 */
export const getMissionsProgress = (missions: DailyMission[]): {
  completed: number;
  total: number;
  percentage: number;
} => {
  const completed = missions.filter(m => m.completed).length;
  const total = missions.length;
  const percentage = Math.floor((completed / total) * 100);
  
  return { completed, total, percentage };
};

/**
 * Verifica si necesita generar nuevas misiones
 */
export const shouldGenerateNewMissions = (
  currentMissions: DailyMission[]
): boolean => {
  if (currentMissions.length === 0) return true;
  
  const today = getTodayDate();
  return currentMissions[0].date !== today;
};