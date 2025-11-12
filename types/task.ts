
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type TaskCategory = 
  | 'work' 
  | 'personal' 
  | 'health' 
  | 'study' 
  | 'finance'
  | 'social'
  | 'creative'
  | 'other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  status: TaskStatus;
  
  // Gamificación
  difficulty: TaskDifficulty;
  category: TaskCategory;
  priority: TaskPriority;
  basePoints: number;
  bonusMultiplier: number; // Multiplicador de bonificaciones aplicado
  earnedPoints: number; // Puntos finales con bonificaciones
  
  // Temporal (formato compatible con react-native-calendars)
  dueDate?: string; // 'YYYY-MM-DD'
  dueTime?: string; // 'HH:mm' (24h)
  estimatedTime?: number; // minutos
  
  // Fechas de control
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string; // ISO string
  
  // Flags de bonificación
  completedEarly: boolean; // Completada antes de tiempo
  isFirstTaskOfDay: boolean; // Primera tarea del día
  completedDuringStreak: boolean; // Completada durante racha activa
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  category?: TaskCategory;
  priority?: TaskPriority;
  dueDate?: string; // 'YYYY-MM-DD'
  dueTime?: string; // 'HH:mm'
  estimatedTime?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  difficulty?: TaskDifficulty;
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  dueTime?: string;
  estimatedTime?: number;
}

// Información de puntos por dificultad
export const DIFFICULTY_POINTS: Record<TaskDifficulty, {
  basePoints: number;
  estimatedTime: string;
  color: string;
  icon: string;
}> = {
  easy: {
    basePoints: 10,
    estimatedTime: '15-30 min',
    color: '#4CAF50',
    icon: '🟢',
  },
  medium: {
    basePoints: 25,
    estimatedTime: '30-60 min',
    color: '#FF9800',
    icon: '🟡',
  },
  hard: {
    basePoints: 50,
    estimatedTime: '1-3 hrs',
    color: '#F44336',
    icon: '🔴',
  },
  extreme: {
    basePoints: 100,
    estimatedTime: '3+ hrs',
    color: '#9C27B0',
    icon: '🟣',
  },
};

// Información de categorías
export const CATEGORY_INFO: Record<TaskCategory, {
  name: string;
  color: string;
  icon: string;
}> = {
  work: { name: 'Trabajo', color: '#2196F3', icon: '💼' },
  personal: { name: 'Personal', color: '#4CAF50', icon: '🏠' },
  health: { name: 'Salud', color: '#E91E63', icon: '❤️' },
  study: { name: 'Estudio', color: '#9C27B0', icon: '📚' },
  finance: { name: 'Finanzas', color: '#FF9800', icon: '💰' },
  social: { name: 'Social', color: '#00BCD4', icon: '👥' },
  creative: { name: 'Creatividad', color: '#FF5722', icon: '🎨' },
  other: { name: 'Otro', color: '#757575', icon: '📌' },
};

// Información de prioridades
export const PRIORITY_INFO: Record<TaskPriority, {
  name: string;
  color: string;
  icon: string;
}> = {
  low: { name: 'Baja', color: '#4CAF50', icon: '🔵' },
  medium: { name: 'Media', color: '#FF9800', icon: '🟡' },
  high: { name: 'Alta', color: '#F44336', icon: '🟠' },
  urgent: { name: 'Urgente', color: '#D32F2F', icon: '🔴' },
};