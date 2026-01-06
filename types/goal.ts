export type GoalType = 'monthly' | 'yearly';

export interface Goal {
  id: number;
  userId: number;
  type: GoalType;
  title: string;
  description?: string;
  completed: boolean;
  failed: boolean; // Si la meta no se cumplió en el tiempo establecido
  xpReward: number; // 70 para mensuales, 150 para anuales
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  failedAt?: string; // Fecha en que se marcó como fallida
  year: number; // Año al que pertenece
  month?: number; // Solo para metas mensuales (1-12)
  reminderDate?: string; // Fecha límite para cumplir la meta (ISO string) - OBLIGATORIA
  notificationEnabled: boolean; // Si está habilitada la notificación
  notificationId?: string; // ID de la notificación programada
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  type: GoalType;
  year: number;
  month?: number; // Requerido solo si type es 'monthly'
  reminderDate: string; // Fecha límite para cumplir la meta (OBLIGATORIA)
  notificationEnabled?: boolean; // Si está habilitada la notificación (default: false)
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  completed?: boolean;
  reminderDate?: string;
  notificationEnabled?: boolean;
  notificationId?: string;
}

// XP por tipo de meta
export const GOAL_XP_REWARDS = {
  monthly: 70,
  yearly: 150,
} as const;
