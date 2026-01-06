import { GoalRepository } from '@/database/repositories/goalRepository';
import { UserRepository } from '@/database/repositories/userRepository';
import { Goal } from '@/types/goal';

/**
 * Verifica metas vencidas y aplica penalización de XP
 * Retorna las metas que fueron marcadas como fallidas
 */
export const checkAndPenalizeExpiredGoals = async (
  userId: number
): Promise<Goal[]> => {
  try {
    // Obtener metas vencidas (fecha pasada, no completadas, no fallidas)
    const expiredGoals = await GoalRepository.findExpiredGoals(userId);

    if (expiredGoals.length === 0) {
      console.log('✅ No expired goals found');
      return [];
    }

    console.log(`⚠️ Found ${expiredGoals.length} expired goals, applying penalties...`);

    const failedGoals: Goal[] = [];

    for (const goal of expiredGoals) {
      // Marcar la meta como fallida
      const failedGoal = await GoalRepository.markAsFailed(goal.id);

      // Restar el XP del usuario
      const currentUser = await UserRepository.getFirstUser();
      if (currentUser) {
        const newXP = Math.max(0, currentUser.totalXP - goal.xpReward);
        await UserRepository.updateXP(currentUser.id, newXP);
        console.log(`❌ Goal "${goal.title}" failed. Penalized ${goal.xpReward} XP`);
      }

      failedGoals.push(failedGoal);
    }

    return failedGoals;
  } catch (error) {
    console.error('❌ Error checking expired goals:', error);
    return [];
  }
};

/**
 * Formatea el mensaje de penalización para mostrar al usuario
 */
export const formatPenaltyMessage = (failedGoals: Goal[]): string => {
  if (failedGoals.length === 0) {
    return '';
  }

  const totalPenalty = failedGoals.reduce((sum, goal) => sum + goal.xpReward, 0);

  if (failedGoals.length === 1) {
    return `La meta "${failedGoals[0].title}" no se cumplió a tiempo. Se restaron ${totalPenalty} XP.`;
  }

  return `${failedGoals.length} metas no se cumplieron a tiempo. Se restaron ${totalPenalty} XP en total.`;
};
