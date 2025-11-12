import { DIFFICULTY_POINTS, Task, TaskDifficulty, TaskStatus } from '../types/task';
import { getTodayDate, isOverdue, wasCompletedEarly } from './dateUtils';

/**
 * Determina el estado de una tarea
 */
export const getTaskStatus = (task: Task): TaskStatus => {
  if (task.completed) return 'completed';
  if (task.status === 'cancelled') return 'cancelled';
  if (task.dueDate && isOverdue(task.dueDate, task.dueTime)) {
    return 'overdue';
  }
  return 'pending';
};

/**
 * Verifica si la tarea se completó antes de tiempo
 */
export const isTaskCompletedEarly = (task: Task): boolean => {
  if (!task.completed || !task.completedAt || !task.dueDate) {
    return false;
  }
  return wasCompletedEarly(task.completedAt, task.dueDate, task.dueTime);
};

/**
 * Obtiene el tiempo restante en formato legible
 */
export const getTimeRemaining = (dueDate: string, dueTime?: string): string => {
  const now = new Date();
  const due = dueTime 
    ? new Date(`${dueDate}T${dueTime}:00`)
    : new Date(`${dueDate}T23:59:59`);
  
  const diff = due.getTime() - now.getTime();
  
  if (diff < 0) return 'Vencida';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Ordena tareas por prioridad y fecha
 */
export const sortTasks = (tasks: Task[]): Task[] => {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  
  return [...tasks].sort((a, b) => {
    // Primero por estado (pendientes primero)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Luego por prioridad
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Luego por fecha de vencimiento
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    // Finalmente por fecha de creación
    return b.createdAt.localeCompare(a.createdAt);
  });
};

/**
 * Filtra tareas por estado
 */
export const filterTasksByStatus = (tasks: Task[], status: TaskStatus): Task[] => {
  return tasks.filter(task => getTaskStatus(task) === status);
};

/**
 * Filtra tareas de hoy
 */
export const getTodayTasks = (tasks: Task[]): Task[] => {
  const today = getTodayDate();
  return tasks.filter(task => task.dueDate === today);
};

/**
 * Filtra tareas vencidas
 */
export const getOverdueTasks = (tasks: Task[]): Task[] => {
  return filterTasksByStatus(tasks, 'overdue');
};

/**
 * Cuenta tareas por dificultad
 */
export const countTasksByDifficulty = (
  tasks: Task[]
): Record<TaskDifficulty, number> => {
  return tasks.reduce((acc, task) => {
    acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<TaskDifficulty, number>);
};

/**
 * Calcula el progreso general (% de tareas completadas)
 */
export const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.completed).length;
  return Math.floor((completed / tasks.length) * 100);
};

/**
 * Obtiene estadísticas rápidas de tareas
 */
export const getTasksQuickStats = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed && getTaskStatus(t) === 'pending').length;
  const overdue = getOverdueTasks(tasks).length;
  const today = getTodayTasks(tasks).length;
  
  return {
    total,
    completed,
    pending,
    overdue,
    today,
    progress: calculateProgress(tasks),
  };
};

/**
 * Obtiene el emoji según la dificultad
 */
export const getDifficultyEmoji = (difficulty: TaskDifficulty): string => {
  return DIFFICULTY_POINTS[difficulty].icon;
};

/**
 * Obtiene el color según la dificultad
 */
export const getDifficultyColor = (difficulty: TaskDifficulty): string => {
  return DIFFICULTY_POINTS[difficulty].color;
};