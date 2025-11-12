export type AchievementCategory = 
  | 'tasks' 
  | 'streak' 
  | 'level' 
  | 'difficulty' 
  | 'category'
  | 'daily_missions'
  | 'special';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  
  // Estado
  unlocked: boolean;
  unlockedAt?: string; // ISO string
  progress: number; // 0-100
  
  // Criterios de desbloqueo
  requirementType: 'count' | 'streak' | 'level' | 'points';
  requirementValue: number;
  currentValue: number;
  
  // Metadata
  order: number; // Para ordenar en la UI
  isSecret: boolean; // Logro secreto
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
}

// Definición de logros predefinidos
export const ACHIEVEMENTS_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress' | 'currentValue'>[] = [
  {
    id: 'first_task',
    name: 'Primeros Pasos',
    description: 'Completa tu primera tarea',
    icon: '🎯',
    category: 'tasks',
    rarity: 'common',
    xpReward: 10,
    requirementType: 'count',
    requirementValue: 1,
    order: 1,
    isSecret: false,
  },
  {
    id: 'streak_3',
    name: 'Racha Inicial',
    description: 'Mantén una racha de 3 días consecutivos',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    xpReward: 50,
    requirementType: 'streak',
    requirementValue: 3,
    order: 2,
    isSecret: false,
  },
  {
    id: 'streak_7',
    name: 'Semana Perfecta',
    description: 'Mantén una racha de 7 días consecutivos',
    icon: '⚡',
    category: 'streak',
    rarity: 'rare',
    xpReward: 150,
    requirementType: 'streak',
    requirementValue: 7,
    order: 3,
    isSecret: false,
  },
  {
    id: 'streak_30',
    name: 'Mes Imparable',
    description: 'Mantén una racha de 30 días consecutivos',
    icon: '🌟',
    category: 'streak',
    rarity: 'epic',
    xpReward: 500,
    requirementType: 'streak',
    requirementValue: 30,
    order: 4,
    isSecret: false,
  },
  {
    id: 'tasks_5_day',
    name: 'Productivo',
    description: 'Completa 5 tareas en un solo día',
    icon: '💪',
    category: 'tasks',
    rarity: 'common',
    xpReward: 100,
    requirementType: 'count',
    requirementValue: 5,
    order: 5,
    isSecret: false,
  },
  {
    id: 'tasks_50',
    name: 'Trabajador',
    description: 'Completa 50 tareas en total',
    icon: '🏅',
    category: 'tasks',
    rarity: 'rare',
    xpReward: 200,
    requirementType: 'count',
    requirementValue: 50,
    order: 6,
    isSecret: false,
  },
  {
    id: 'tasks_100',
    name: 'Conquistador',
    description: 'Completa 100 tareas en total',
    icon: '⚔️',
    category: 'tasks',
    rarity: 'epic',
    xpReward: 500,
    requirementType: 'count',
    requirementValue: 100,
    order: 7,
    isSecret: false,
  },
  {
    id: 'hard_10',
    name: 'Guerrero',
    description: 'Completa 10 tareas difíciles',
    icon: '🛡️',
    category: 'difficulty',
    rarity: 'rare',
    xpReward: 300,
    requirementType: 'count',
    requirementValue: 10,
    order: 8,
    isSecret: false,
  },
  {
    id: 'extreme_5',
    name: 'Desafío Extremo',
    description: 'Completa 5 tareas extremas',
    icon: '💎',
    category: 'difficulty',
    rarity: 'epic',
    xpReward: 500,
    requirementType: 'count',
    requirementValue: 5,
    order: 9,
    isSecret: false,
  },
  {
    id: 'level_10',
    name: 'Ascenso',
    description: 'Alcanza el nivel 10',
    icon: '📈',
    category: 'level',
    rarity: 'common',
    xpReward: 100,
    requirementType: 'level',
    requirementValue: 10,
    order: 10,
    isSecret: false,
  },
  {
    id: 'level_25',
    name: 'Veterano',
    description: 'Alcanza el nivel 25',
    icon: '🎖️',
    category: 'level',
    rarity: 'rare',
    xpReward: 300,
    requirementType: 'level',
    requirementValue: 25,
    order: 11,
    isSecret: false,
  },
  {
    id: 'level_50',
    name: 'Leyenda',
    description: 'Alcanza el nivel 50',
    icon: '👑',
    category: 'level',
    rarity: 'legendary',
    xpReward: 1000,
    requirementType: 'level',
    requirementValue: 50,
    order: 12,
    isSecret: false,
  },
  {
    id: 'daily_missions_7',
    name: 'Misionero',
    description: 'Completa misiones diarias durante 7 días',
    icon: '🎯',
    category: 'daily_missions',
    rarity: 'rare',
    xpReward: 200,
    requirementType: 'streak',
    requirementValue: 7,
    order: 13,
    isSecret: false,
  },
  {
    id: 'secret_night_owl',
    name: 'Búho Nocturno',
    description: 'Completa una tarea después de las 12 AM',
    icon: '🦉',
    category: 'special',
    rarity: 'rare',
    xpReward: 150,
    requirementType: 'count',
    requirementValue: 1,
    order: 14,
    isSecret: true,
  },
  {
    id: 'secret_early_bird',
    name: 'Madrugador',
    description: 'Completa una tarea antes de las 6 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    xpReward: 150,
    requirementType: 'count',
    requirementValue: 1,
    order: 15,
    isSecret: true,
  },
];

// Información de rareza
export const RARITY_INFO: Record<AchievementRarity, {
  name: string;
  color: string;
  glow: string;
}> = {
  common: { name: 'Común', color: '#9E9E9E', glow: 'rgba(158, 158, 158, 0.3)' },
  rare: { name: 'Raro', color: '#2196F3', glow: 'rgba(33, 150, 243, 0.5)' },
  epic: { name: 'Épico', color: '#9C27B0', glow: 'rgba(156, 39, 176, 0.5)' },
  legendary: { name: 'Legendario', color: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' },
};