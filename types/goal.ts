export type GoalType = 'monthly' | 'yearly';

export interface Goal {
  id: number;
  userId: number;
  type: GoalType;
  title: string;
  description?: string;
  completed: boolean;
  xpReward: number; // 70 para mensuales, 150 para anuales
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  year: number; // Año al que pertenece
  month?: number; // Solo para metas mensuales (1-12)
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  type: GoalType;
  year: number;
  month?: number; // Requerido solo si type es 'monthly'
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

// XP por tipo de meta
export const GOAL_XP_REWARDS = {
  monthly: 70,
  yearly: 150,
} as const;
