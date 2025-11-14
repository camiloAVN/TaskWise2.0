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
  icon: string;
}> = {
  novato: {
    name: 'Novato',
    minLevel: 1,
    maxLevel: 10,
    color: '#8B4513',
    icon: '🌱',
  },
  aprendiz: {
    name: 'Aprendiz',
    minLevel: 11,
    maxLevel: 25,
    color: '#CD7F32',
    icon: '📚',
  },
  competente: {
    name: 'Competente',
    minLevel: 26,
    maxLevel: 40,
    color: '#C0C0C0',
    icon: '⚙️',
  },
  experto: {
    name: 'Experto',
    minLevel: 41,
    maxLevel: 60,
    color: '#FFD700',
    icon: '⭐',
  },
  maestro: {
    name: 'Maestro',
    minLevel: 61,
    maxLevel: 80,
    color: '#E5E4E2',
    icon: '👑',
  },
  leyenda: {
    name: 'Leyenda',
    minLevel: 81,
    maxLevel: 100,
    color: '#d9f434',
    icon: '🏆',
  },
};