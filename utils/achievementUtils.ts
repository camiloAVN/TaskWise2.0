import { Achievement, ACHIEVEMENTS_DEFINITIONS } from '../types/achievement';
import { Task } from '../types/task';
import { User } from '../types/user';

/**
 * Inicializa los logros con el estado del usuario
 */
export const initializeAchievements = (user: User): Achievement[] => {
  return ACHIEVEMENTS_DEFINITIONS.map(def => ({
    ...def,
    unlocked: user.achievementsUnlocked.includes(def.id),
    unlockedAt: undefined,
    progress: 0,
    currentValue: 0,
  }));
};

/**
 * Verifica si un logro debe desbloquearse
 */
export const checkAchievementUnlock = (
  achievement: Achievement,
  currentValue: number
): boolean => {
  return !achievement.unlocked && currentValue >= achievement.requirementValue;
};

/**
 * Actualiza el progreso de un logro
 */
export const updateAchievementProgress = (
  achievement: Achievement,
  currentValue: number
): Achievement => {
  const progress = Math.min(
    100,
    Math.floor((currentValue / achievement.requirementValue) * 100)
  );
  
  return {
    ...achievement,
    currentValue,
    progress,
    unlocked: currentValue >= achievement.requirementValue,
    unlockedAt: currentValue >= achievement.requirementValue && !achievement.unlocked
      ? new Date().toISOString()
      : achievement.unlockedAt,
  };
};

/**
 * Verifica todos los logros y retorna los nuevos desbloqueados
 */
export const checkAllAchievements = (
  achievements: Achievement[],
  user: User,
  tasks: Task[]
): {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
} => {
  const completedTasks = tasks.filter(t => t.completed);
  const hardTasks = completedTasks.filter(t => t.difficulty === 'hard');
  const extremeTasks = completedTasks.filter(t => t.difficulty === 'extreme');
  
  const newlyUnlocked: Achievement[] = [];
  
  const updatedAchievements = achievements.map(achievement => {
    let currentValue = 0;
    
    // Calcular el valor actual según el tipo de logro
    switch (achievement.id) {
      case 'first_task':
      case 'tasks_5_day':
      case 'tasks_50':
      case 'tasks_100':
        currentValue = user.totalTasksCompleted;
        break;
        
      case 'streak_3':
      case 'streak_7':
      case 'streak_30':
        currentValue = user.currentStreak;
        break;
        
      case 'hard_10':
        currentValue = hardTasks.length;
        break;
        
      case 'extreme_5':
        currentValue = extremeTasks.length;
        break;
        
      case 'level_10':
      case 'level_25':
      case 'level_50':
        currentValue = user.currentLevel;
        break;
        
      case 'daily_missions_7':
        currentValue = user.dailyMissionsStreak;
        break;
        
      // Logros secretos requieren lógica especial
      case 'secret_night_owl':
      case 'secret_early_bird':
        // Estos se verifican al completar tareas
        currentValue = achievement.currentValue;
        break;
    }
    
    const updated = updateAchievementProgress(achievement, currentValue);
    
    // Si se desbloqueó ahora, agregarlo a la lista
    if (updated.unlocked && !achievement.unlocked) {
      newlyUnlocked.push(updated);
    }
    
    return updated;
  });
  
  return {
    updatedAchievements,
    newlyUnlocked,
  };
};

/**
 * Calcula el XP total de logros desbloqueados
 */
export const calculateAchievementXP = (achievements: Achievement[]): number => {
  return achievements
    .filter(a => a.unlocked)
    .reduce((total, a) => total + a.xpReward, 0);
};

/**
 * Obtiene logros por categoría
 */
export const getAchievementsByCategory = (
  achievements: Achievement[],
  category: Achievement['category']
): Achievement[] => {
  return achievements.filter(a => a.category === category);
};

/**
 * Obtiene logros por rareza
 */
export const getAchievementsByRarity = (
  achievements: Achievement[],
  rarity: Achievement['rarity']
): Achievement[] => {
  return achievements.filter(a => a.rarity === rarity);
};

/**
 * Obtiene estadísticas de logros
 */
export const getAchievementStats = (achievements: Achievement[]) => {
  const total = achievements.length;
  const unlocked = achievements.filter(a => a.unlocked).length;
  const inProgress = achievements.filter(a => !a.unlocked && a.progress > 0).length;
  const locked = total - unlocked - inProgress;
  
  return {
    total,
    unlocked,
    inProgress,
    locked,
    percentage: Math.floor((unlocked / total) * 100),
  };
};