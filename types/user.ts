export type UserCategory = 
  | 'novato' 
  | 'aprendiz' 
  | 'competente' 
  | 'experto' 
  | 'maestro' 
  | 'leyenda';

export interface User {
  id: number;
  name: string;
  avatar?: string;
  age?: number;  
  email?: string;
  // Progreso y Nivel
  totalXP: number;
  currentLevel: number;
  currentLevelXP: number; // XP acumulado en el nivel actual
  nextLevelXP: number; // XP necesario para el siguiente nivel
  category: UserCategory;
  
  // Estadísticas básicas
  totalTasksCompleted: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  
  // Racha
  currentStreak: number;
  bestStreak: number;
  lastTaskDate?: string; // formato: 'YYYY-MM-DD'
  
  // Logros
  achievementsUnlocked: string[]; // IDs de logros
  totalAchievements: number;
  
  // Misiones diarias
  dailyMissionsCompletedToday: number;
  dailyMissionsStreak: number;

  // Planificación semanal
  lastWeeklyModalShownDate?: string; // YYYY-MM-DD
  weeklyPlanningNotificationId?: string;

  // Fechas
  createdAt: string; // ISO string
  lastActivity: string; // ISO string
}

export interface CreateUserInput {
  name: string;
  avatar?: string;
  age?: number; 
  email?: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  age?: number; 
  email?: string;
}

// Información de nivel y categoría
export interface LevelInfo {
  level: number;
  category: UserCategory;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
}

// Constantes de categorías
export const CATEGORY_INFO: Record<UserCategory, {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  icon: any; // Puede ser require() para Lottie o string para emoji
  isLottie?: boolean; // Flag para identificar si es animación Lottie
}> = {
  novato: {
    name: 'Novato',
    minLevel: 1,
    maxLevel: 10,
    color: '#8B4513',
    icon: require('@/assets/animations/novato.json'),
    isLottie: true,
  },
  aprendiz: {
    name: 'Aprendiz',
    minLevel: 11,
    maxLevel: 25,
    color: '#CD7F32',
    icon: require('@/assets/animations/book.json'),
    isLottie: true,
  },
  competente: {
    name: 'Competente',
    minLevel: 26,
    maxLevel: 40,
    color: '#C0C0C0',
    icon: require('@/assets/animations/Gears.json'),
    isLottie: true,
  },
  experto: {
    name: 'Experto',
    minLevel: 41,
    maxLevel: 60,
    color: '#FFD700',
    icon: '⭐',
    isLottie: false,
  },
  maestro: {
    name: 'Maestro',
    minLevel: 61,
    maxLevel: 80,
    color: '#E5E4E2',
    icon: '👑',
    isLottie: false,
  },
  leyenda: {
    name: 'Leyenda',
    minLevel: 81,
    maxLevel: 100,
    color: '#d9f434',
    icon: '🏆',
    isLottie: false,
  },
};