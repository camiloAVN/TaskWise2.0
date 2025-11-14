
export interface UserStats {
  id: number;
  userId: number;
  
  // Estadísticas globales
  totalTasks: number;
  totalTasksCompleted: number;
  totalTasksCancelled: number;
  totalXPEarned: number;
  
  // Promedios
  averageTasksPerDay: number;
  averageXPPerDay: number;
  averageCompletionTime: number; // minutos
  
  // Por dificultad
  easyTasksCompleted: number;
  mediumTasksCompleted: number;
  hardTasksCompleted: number;
  extremeTasksCompleted: number;
  
  // Por categoría
  workTasksCompleted: number;
  personalTasksCompleted: number;
  healthTasksCompleted: number;
  studyTasksCompleted: number;
  financeTasksCompleted: number;
  socialTasksCompleted: number;
  creativeTasksCompleted: number;
  otherTasksCompleted: number;
  
  // Tiempo
  totalTimeInvested: number; // minutos
  averageTimePerTask: number; // minutos
  
  // Mejores momentos
  mostProductiveDay?: string; // 'YYYY-MM-DD'
  mostProductiveHour?: number; // 0-23
  mostProductiveDayOfWeek?: number; // 0-6 (0 = domingo)
  
  // Racha
  currentStreak: number;
  bestStreak: number;
  totalDaysWithActivity: number;
  
  // Misiones
  totalDailyMissionsCompleted: number;
  dailyMissionsCompletedStreak: number;
  
  // Logros
  totalAchievementsUnlocked: number;
  
  // Fechas
  updatedAt: string; // ISO string
}
export interface Stats {
  id: number;
  userId: number;
  
  // Tareas
  totalTasksCompleted: number;
  totalTasksFailed: number;
  
  // XP
  totalXPEarned: number;
  
  // Rachas
  currentStreak: number;
  bestStreak: number;
  
  // Logros
  totalAchievementsUnlocked: number;
  

  tasksCompletedToday?: number;
  tasksCompletedThisWeek?: number;
  tasksCompletedThisMonth?: number;
  
  // Actividad
  daysActive: number;
  lastActiveDate: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PeriodStats {
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  
  tasksCompleted: number;
  xpEarned: number;
  timeInvested: number;
  averageTasksPerDay: number;
  
  // Distribución por dificultad
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
    extreme: number;
  };
  
  // Distribución por categoría
  categoryDistribution: Record<string, number>;
  
  // Mejor día
  bestDay?: {
    date: string;
    tasksCompleted: number;
    xpEarned: number;
  };
}

// Datos para gráficos
export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
  }[];
}

export interface ProductivityHeatmap {
  [date: string]: {
    tasksCompleted: number;
    xpEarned: number;
    level: number; // 0-4 para intensidad de color
  };
}