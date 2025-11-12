
import { create } from 'zustand';
import {
    AchievementRepository,
    StatsRepository,
    StreakRepository,
    UserRepository,
} from '../database/repositories';
import { Achievement } from '../types/achievement';
import { Streak } from '../types/streak';
import { CreateUserInput, UpdateUserInput, User } from '../types/user';
import { checkAllAchievements } from '../utils/achievementUtils';
import {
    didCategoryChange,
    didLevelUp,
    getLevelsGained
} from '../utils/levelUtils';
import {
    calculateNewStreak,
    isStreakActive,
} from '../utils/streakUtils';

interface UserStore {
  // ==================== ESTADO ====================
  
  // Usuario actual
  user: User | null;
  
  // Logros
  achievements: Achievement[];
  
  // Racha
  streak: Streak | null;
  
  // Estado UI
  loading: boolean;
  error: string | null;
  
  // Notificaciones de eventos (para mostrar al usuario)
  levelUpNotification: {
    show: boolean;
    newLevel: number;
    newCategory: string;
  } | null;
  
  achievementUnlockedNotification: {
    show: boolean;
    achievement: Achievement;
  } | null;
  
  // ==================== ACCIONES ====================
  
  // Inicialización
  loadUser: () => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<void>;
  updateUser: (input: UpdateUserInput) => Promise<User>;
  
  // XP y Niveles
  addXP: (xpToAdd: number) => Promise<void>;
  
  // Tareas
  incrementTasksCompleted: () => Promise<void>;
  
  // Rachas
  updateStreak: (date: string) => Promise<void>;
  
  // Logros
  loadAchievements: () => Promise<void>;
  checkAndUpdateAchievements: () => Promise<Achievement[]>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  
  // Estadísticas
  recalculateStats: () => Promise<void>;
  
  // Reset diario/semanal/mensual
  resetDailyCounters: () => Promise<void>;
  resetWeeklyCounters: () => Promise<void>;
  resetMonthlyCounters: () => Promise<void>;
  
  // Notificaciones
  dismissLevelUpNotification: () => void;
  dismissAchievementNotification: () => void;
  
  // Limpieza
  clearError: () => void;
  
  // ==================== HELPERS ====================
  
  // Obtener progreso del nivel actual
  getLevelProgress: () => {
    currentLevel: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progressPercentage: number;
  } | null;
  
  // Obtener logros por categoría
  getAchievementsByCategory: (category: string) => Achievement[];
  
  // Obtener logros desbloqueados
  getUnlockedAchievements: () => Achievement[];
  
  // Verificar si racha está activa
  isStreakActive: () => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // ==================== ESTADO INICIAL ====================
  
  user: null,
  achievements: [],
  streak: null,
  loading: false,
  error: null,
  levelUpNotification: null,
  achievementUnlockedNotification: null,
  
  // ==================== INICIALIZACIÓN ====================
  
  /**
   * Cargar usuario (el primero de la base de datos)
   */
  loadUser: async () => {
    set({ loading: true, error: null });
    
    try {
      const user = await UserRepository.getFirstUser();
      
      if (!user) {
        console.log('⚠️ No user found, need to create one');
        set({ loading: false });
        return;
      }
      
      // Cargar achievements IDs
      const achievementIds = await AchievementRepository.getUnlockedIds(user.id);
      user.achievementsUnlocked = achievementIds;
      
      set({ user, loading: false });
      console.log('✅ User loaded:', user.id);
      
      // Cargar datos relacionados
      await get().loadAchievements();
      
      // Cargar o crear streak
      let streak = await StreakRepository.findByUserId(user.id);
      if (!streak) {
        streak = await StreakRepository.create(user.id);
      }
      set({ streak });
      
    } catch (error) {
      console.error('❌ Error loading user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar usuario',
        loading: false,
      });
    }
  },
  
  /**
   * Crear nuevo usuario
   */
  createUser: async (input: CreateUserInput) => {
    set({ loading: true, error: null });
    
    try {
      const newUser = await UserRepository.create(input);
      
      // Inicializar logros para el usuario
      await AchievementRepository.initializeForUser(newUser.id);
      
      // Crear streak para el usuario
      const streak = await StreakRepository.create(newUser.id);
      
      // Crear stats para el usuario
      await StatsRepository.create(newUser.id);
      
      set({ user: newUser, streak, loading: false });
      console.log('✅ User created:', newUser.id);
      
      // Cargar logros
      await get().loadAchievements();
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear usuario',
        loading: false,
      });
      throw error;
    }
  },
  
  /**
   * Actualizar usuario
   */
  updateUser: async (input: UpdateUserInput) => {
    const user = get().user;
    if (!user) {
      throw new Error('No user loaded');
    }
    
    set({ loading: true, error: null });
    
    try {
      const updatedUser = await UserRepository.update(user.id, input);
      
      // Mantener achievements unlocked
      updatedUser.achievementsUnlocked = user.achievementsUnlocked;
      
      set({ user: updatedUser, loading: false });
      console.log('✅ User updated:', user.id);
      
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar usuario',
        loading: false,
      });
      throw error;
    }
  },
  
  // ==================== XP Y NIVELES ====================
  
  /**
   * Agregar XP al usuario
   */
  addXP: async (xpToAdd: number) => {
    const user = get().user;
    if (!user) {
      throw new Error('No user loaded');
    }
    
    try {
      const previousXP = user.totalXP;
      const previousLevel = user.currentLevel;
      
      // Agregar XP en la base de datos
      const updatedUser = await UserRepository.addXP(user.id, xpToAdd);
      
      // Mantener achievements unlocked
      updatedUser.achievementsUnlocked = user.achievementsUnlocked;
      
      set({ user: updatedUser });
      
      // Verificar si subió de nivel
      if (didLevelUp(previousXP, updatedUser.totalXP)) {
        const levelsGained = getLevelsGained(previousXP, updatedUser.totalXP);
        const categoryChanged = didCategoryChange(previousLevel, updatedUser.currentLevel);
        
        console.log(`🎉 LEVEL UP! +${levelsGained} nivel(es)`);
        
        // Mostrar notificación de level up
        set({
          levelUpNotification: {
            show: true,
            newLevel: updatedUser.currentLevel,
            newCategory: updatedUser.category,
          },
        });
        
        // Verificar logros de nivel
        await get().checkAndUpdateAchievements();
      }
      
      console.log(`✅ Added ${xpToAdd} XP. Total: ${updatedUser.totalXP}`);
    } catch (error) {
      console.error('❌ Error adding XP:', error);
      set({ error: error instanceof Error ? error.message : 'Error al agregar XP' });
      throw error;
    }
  },
  
  // ==================== TAREAS ====================
  
  /**
   * Incrementar contador de tareas completadas
   */
  incrementTasksCompleted: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const updatedUser = await UserRepository.incrementTasksCompleted(user.id);
      updatedUser.achievementsUnlocked = user.achievementsUnlocked;
      
      set({ user: updatedUser });
      
      // Verificar logros relacionados con tareas
      await get().checkAndUpdateAchievements();
      
      console.log('✅ Tasks completed counter incremented');
    } catch (error) {
      console.error('❌ Error incrementing tasks:', error);
    }
  },
  
  // ==================== RACHAS ====================
  
  /**
   * Actualizar racha del usuario
   */
  updateStreak: async (date: string) => {
    const user = get().user;
    const currentStreak = get().streak;
    
    if (!user || !currentStreak) return;
    
    try {
      // Calcular nueva racha
      const newStreakCount = calculateNewStreak(
        currentStreak.currentStreak,
        currentStreak.lastActivityDate
      );
      
      const isActive = isStreakActive(date);
      
      // Actualizar en DB
      const updatedStreak = await StreakRepository.update(user.id, {
        currentStreak: newStreakCount,
        lastActivityDate: date,
        isActive,
      });
      
      // Actualizar también en user
      await UserRepository.updateStreak(user.id, newStreakCount, date);
      
      const updatedUser = await UserRepository.findById(user.id);
      if (updatedUser) {
        updatedUser.achievementsUnlocked = user.achievementsUnlocked;
        set({ user: updatedUser });
      }
      
      set({ streak: updatedStreak });
      
      console.log(`🔥 Streak updated: ${newStreakCount} days`);
      
      // Verificar logros de racha
      await get().checkAndUpdateAchievements();
      
    } catch (error) {
      console.error('❌ Error updating streak:', error);
    }
  },
  
  // ==================== LOGROS ====================
  
  /**
   * Cargar logros del usuario
   */
  loadAchievements: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const achievements = await AchievementRepository.findByUserId(user.id);
      set({ achievements });
      console.log(`✅ Loaded ${achievements.length} achievements`);
    } catch (error) {
      console.error('❌ Error loading achievements:', error);
    }
  },
  
  /**
   * Verificar y actualizar logros basados en el progreso actual
   */
  checkAndUpdateAchievements: async () => {
    const user = get().user;
    const achievements = get().achievements;
    
    if (!user || achievements.length === 0) {
      return [];
    }
    
    try {
      // Necesitamos las tareas para verificar algunos logros
      const { TaskRepository } = await import('../database/repositories');
      const tasks = await TaskRepository.findByUserId(user.id);
      
      // Verificar todos los logros
      const { updatedAchievements, newlyUnlocked } = checkAllAchievements(
        achievements,
        user,
        tasks
      );
      
      // Actualizar logros en DB y store
      for (const achievement of newlyUnlocked) {
        await AchievementRepository.unlock(user.id, achievement.id);
        
        // Agregar XP de recompensa
        await get().addXP(achievement.xpReward);
        
        // Agregar a la lista de desbloqueados del usuario
        await UserRepository.addAchievement(user.id, achievement.id);
        
        console.log(`🏆 Achievement unlocked: ${achievement.name} (+${achievement.xpReward} XP)`);
        
        // Mostrar notificación (solo del primer logro si hay varios)
        if (!get().achievementUnlockedNotification) {
          set({
            achievementUnlockedNotification: {
              show: true,
              achievement,
            },
          });
        }
      }
      
      // Actualizar lista de logros
      set({ achievements: updatedAchievements });
      
      // Actualizar usuario con nuevos achievement IDs
      if (newlyUnlocked.length > 0) {
        const updatedUser = await UserRepository.findById(user.id);
        if (updatedUser) {
          const achievementIds = await AchievementRepository.getUnlockedIds(user.id);
          updatedUser.achievementsUnlocked = achievementIds;
          set({ user: updatedUser });
        }
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
      return [];
    }
  },
  
  /**
   * Desbloquear un logro específico
   */
  unlockAchievement: async (achievementId: string) => {
    const user = get().user;
    if (!user) return;
    
    try {
      const unlockedAchievement = await AchievementRepository.unlock(user.id, achievementId);
      
      // Agregar XP de recompensa
      await get().addXP(unlockedAchievement.xpReward);
      
      // Actualizar lista de logros
      await get().loadAchievements();
      
      // Actualizar usuario
      await UserRepository.addAchievement(user.id, achievementId);
      const updatedUser = await UserRepository.findById(user.id);
      if (updatedUser) {
        const achievementIds = await AchievementRepository.getUnlockedIds(user.id);
        updatedUser.achievementsUnlocked = achievementIds;
        set({ user: updatedUser });
      }
      
      // Mostrar notificación
      set({
        achievementUnlockedNotification: {
          show: true,
          achievement: unlockedAchievement,
        },
      });
      
      console.log(`🏆 Achievement unlocked: ${unlockedAchievement.name}`);
    } catch (error) {
      console.error('❌ Error unlocking achievement:', error);
    }
  },
  
  // ==================== ESTADÍSTICAS ====================
  
  /**
   * Recalcular todas las estadísticas
   */
  recalculateStats: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      await StatsRepository.recalculate(user.id);
      console.log('✅ Stats recalculated');
    } catch (error) {
      console.error('❌ Error recalculating stats:', error);
    }
  },
  
  // ==================== RESETS ====================
  
  /**
   * Resetear contadores diarios
   */
  resetDailyCounters: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const updatedUser = await UserRepository.resetDailyCounters(user.id);
      updatedUser.achievementsUnlocked = user.achievementsUnlocked;
      set({ user: updatedUser });
      console.log('✅ Daily counters reset');
    } catch (error) {
      console.error('❌ Error resetting daily counters:', error);
    }
  },
  
  /**
   * Resetear contadores semanales
   */
  resetWeeklyCounters: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const updatedUser = await UserRepository.resetWeeklyCounters(user.id);
      updatedUser.achievementsUnlocked = user.achievementsUnlocked;
      set({ user: updatedUser });
      console.log('✅ Weekly counters reset');
    } catch (error) {
      console.error('❌ Error resetting weekly counters:', error);
    }
  },
  
  /**
   * Resetear contadores mensuales
   */
  resetMonthlyCounters: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const updatedUser = await UserRepository.resetMonthlyCounters(user.id);
      updatedUser.achievementsUnlocked = user.achievementsUnlocked;
      set({ user: updatedUser });
      console.log('✅ Monthly counters reset');
    } catch (error) {
      console.error('❌ Error resetting monthly counters:', error);
    }
  },
  
  // ==================== NOTIFICACIONES ====================
  
  dismissLevelUpNotification: () => {
    set({ levelUpNotification: null });
  },
  
  dismissAchievementNotification: () => {
    set({ achievementUnlockedNotification: null });
  },
  
  // ==================== LIMPIEZA ====================
  
  clearError: () => set({ error: null }),
  
  // ==================== HELPERS ====================
  
  /**
   * Obtener progreso del nivel actual
   */
  getLevelProgress: () => {
    const user = get().user;
    if (!user) return null;
    
    return {
      currentLevel: user.currentLevel,
      currentLevelXP: user.currentLevelXP,
      nextLevelXP: user.nextLevelXP,
      progressPercentage: Math.floor((user.currentLevelXP / user.nextLevelXP) * 100),
    };
  },
  
  /**
   * Obtener logros por categoría
   */
  getAchievementsByCategory: (category: string) => {
    return get().achievements.filter(a => a.category === category);
  },
  
  /**
   * Obtener logros desbloqueados
   */
  getUnlockedAchievements: () => {
    return get().achievements.filter(a => a.unlocked);
  },
  
  /**
   * Verificar si racha está activa
   */
  isStreakActive: () => {
    const streak = get().streak;
    if (!streak) return false;
    return streak.isActive;
  },
}));