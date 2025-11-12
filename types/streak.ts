
export interface Streak {
  id: number;
  userId: number;
  
  // Racha actual
  currentStreak: number;
  bestStreak: number;
  
  // Fechas
  lastActivityDate: string; // 'YYYY-MM-DD'
  streakStartDate: string; // 'YYYY-MM-DD'
  bestStreakDate?: string; // 'YYYY-MM-DD' cuando se logró la mejor racha
  
  // Estado
  isActive: boolean;
  
  // Metadata
  totalDaysActive: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface StreakBonus {
  days: number;
  multiplier: number;
  name: string;
  icon: string;
  color: string;
}

// Bonificaciones por racha
export const STREAK_BONUSES: StreakBonus[] = [
  { days: 3, multiplier: 1.5, name: 'Racha Inicial', icon: '🔥', color: '#FF9800' },
  { days: 7, multiplier: 2.0, name: 'Semana Perfecta', icon: '⚡', color: '#F44336' },
  { days: 14, multiplier: 2.5, name: 'Dos Semanas', icon: '💪', color: '#9C27B0' },
  { days: 30, multiplier: 3.0, name: 'Mes Completo', icon: '🌟', color: '#FFD700' },
  { days: 60, multiplier: 3.5, name: 'Imparable', icon: '🚀', color: '#d9f434' },
  { days: 100, multiplier: 4.0, name: 'Leyenda', icon: '👑', color: '#FFD700' },
];

// Calendario de actividad (para react-native-calendars)
export interface ActivityCalendar {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
    customStyles?: any;
  };
}