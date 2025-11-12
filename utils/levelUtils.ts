import { CATEGORY_INFO, UserCategory } from '../types/user';

/**
 * Calcula el XP necesario para alcanzar un nivel específico
 */
export const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(level * 100 + Math.pow(level, 1.5) * 50);
};

/**
 * Calcula el XP total acumulado hasta un nivel
 */
export const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

/**
 * Calcula el nivel basado en el XP total
 */
export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  let xpRequired = 0;
  
  while (xpRequired <= totalXP && level < 100) {
    level++;
    xpRequired += getXPForLevel(level);
  }
  
  return level - 1;
};

/**
 * Calcula el XP actual en el nivel y el XP necesario para el siguiente nivel
 */
export const calculateLevelProgress = (totalXP: number): {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercentage: number;
} => {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
  const currentLevelXP = totalXP - xpForCurrentLevel;
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const progressPercentage = Math.floor((currentLevelXP / nextLevelXP) * 100);
  
  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progressPercentage,
  };
};

/**
 * Obtiene la categoría basada en el nivel
 */
export const getCategoryFromLevel = (level: number): UserCategory => {
  if (level <= 10) return 'novato';
  if (level <= 25) return 'aprendiz';
  if (level <= 40) return 'competente';
  if (level <= 60) return 'experto';
  if (level <= 80) return 'maestro';
  return 'leyenda';
};

/**
 * Obtiene información completa de la categoría
 */
export const getCategoryInfo = (level: number) => {
  const category = getCategoryFromLevel(level);
  return {
    category,
    ...CATEGORY_INFO[category],
  };
};

/**
 * Calcula cuánto XP falta para el siguiente nivel
 */
export const getXPToNextLevel = (totalXP: number): number => {
  const { currentLevelXP, nextLevelXP } = calculateLevelProgress(totalXP);
  return nextLevelXP - currentLevelXP;
};

/**
 * Verifica si el usuario subió de nivel después de ganar XP
 */
export const didLevelUp = (previousXP: number, newXP: number): boolean => {
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newXP);
  return newLevel > previousLevel;
};

/**
 * Obtiene los niveles ganados
 */
export const getLevelsGained = (previousXP: number, newXP: number): number => {
  const previousLevel = calculateLevel(previousXP);
  const newLevel = calculateLevel(newXP);
  return Math.max(0, newLevel - previousLevel);
};

/**
 * Verifica si cambió de categoría
 */
export const didCategoryChange = (previousLevel: number, newLevel: number): boolean => {
  return getCategoryFromLevel(previousLevel) !== getCategoryFromLevel(newLevel);
};