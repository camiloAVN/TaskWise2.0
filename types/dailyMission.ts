export type MissionType = 
  | 'complete_tasks' 
  | 'complete_by_difficulty' 
  | 'complete_by_category'
  | 'complete_before_time'
  | 'maintain_streak';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export interface DailyMission {
  id: string;
  date: string; // 'YYYY-MM-DD'
  
  // Descripción
  title: string;
  description: string;
  icon: string;
  
  // Tipo y dificultad
  type: MissionType;
  difficulty: MissionDifficulty;
  
  // Progreso
  targetValue: number;
  currentValue: number;
  completed: boolean;
  completedAt?: string; // ISO string
  
  // Recompensas
  xpReward: number;
  bonusXP: number; // XP extra por completar todas las misiones del día
  
  // Metadata
  order: number;
}

export interface DailyMissionsGroup {
  date: string; // 'YYYY-MM-DD'
  missions: DailyMission[];
  allCompleted: boolean;
  totalXP: number;
  bonusXPAvailable: number;
}

// Constantes de misiones
export const MISSION_DIFFICULTY_CONFIG: Record<MissionDifficulty, {
  xpReward: number;
  color: string;
}> = {
  easy: { xpReward: 30, color: '#4CAF50' },
  medium: { xpReward: 60, color: '#FF9800' },
  hard: { xpReward: 100, color: '#F44336' },
};

// Plantillas de misiones diarias
export interface MissionTemplate {
  type: MissionType;
  difficulty: MissionDifficulty;
  title: string;
  descriptionTemplate: string; // Puede tener variables como {count}
  icon: string;
  targetValue: number;
}

export const DAILY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    type: 'complete_tasks',
    difficulty: 'easy',
    title: 'Tareas Básicas',
    descriptionTemplate: 'Completa {count} tareas',
    icon: '✅',
    targetValue: 3,
  },
  {
    type: 'complete_tasks',
    difficulty: 'medium',
    title: 'Productividad Media',
    descriptionTemplate: 'Completa {count} tareas',
    icon: '📋',
    targetValue: 5,
  },
  {
    type: 'complete_tasks',
    difficulty: 'hard',
    title: 'Súper Productivo',
    descriptionTemplate: 'Completa {count} tareas',
    icon: '🚀',
    targetValue: 8,
  },
  {
    type: 'complete_by_difficulty',
    difficulty: 'easy',
    title: 'Desafío Fácil',
    descriptionTemplate: 'Completa {count} tareas fáciles',
    icon: '🟢',
    targetValue: 3,
  },
  {
    type: 'complete_by_difficulty',
    difficulty: 'medium',
    title: 'Desafío Medio',
    descriptionTemplate: 'Completa {count} tareas de dificultad media',
    icon: '🟡',
    targetValue: 2,
  },
  {
    type: 'complete_by_difficulty',
    difficulty: 'hard',
    title: 'Desafío Extremo',
    descriptionTemplate: 'Completa {count} tarea difícil o extrema',
    icon: '🔴',
    targetValue: 1,
  },
  {
    type: 'complete_by_category',
    difficulty: 'easy',
    title: 'Categoría Trabajo',
    descriptionTemplate: 'Completa {count} tareas de trabajo',
    icon: '💼',
    targetValue: 2,
  },
  {
    type: 'complete_by_category',
    difficulty: 'easy',
    title: 'Categoría Salud',
    descriptionTemplate: 'Completa {count} tareas de salud',
    icon: '❤️',
    targetValue: 2,
  },
  {
    type: 'complete_before_time',
    difficulty: 'medium',
    title: 'Puntualidad',
    descriptionTemplate: 'Completa {count} tareas antes de tiempo',
    icon: '⏰',
    targetValue: 2,
  },
  {
    type: 'maintain_streak',
    difficulty: 'easy',
    title: 'Mantén la Racha',
    descriptionTemplate: 'Completa al menos 1 tarea hoy',
    icon: '🔥',
    targetValue: 1,
  },
];