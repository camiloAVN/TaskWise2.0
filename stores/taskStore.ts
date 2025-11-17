
import { create } from 'zustand';
import { TaskRepository } from '../database/repositories/taskRepository';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { getTodayDate } from '../utils/dateUtils';
import { scheduleTaskNotification, cancelTaskNotification } from '../utils/notificationUtils';

interface TaskStore {
  // ==================== ESTADO ====================
  
  // Tareas activas (siempre en memoria)
  pendingTasks: Task[];
  todayTasks: Task[];
  
  // Tareas completadas recientes (caché limitado)
  recentCompleted: Task[];

  monthTasks: Task[];
  currentMonth: { year: number; month: number } | null;
  
  // Estado de UI
  loading: boolean;
  error: string | null;
  
  // Configuración
  MAX_RECENT_COMPLETED: number;
  userId: number | null;
  
  // ==================== ACCIONES ====================
  
  // Inicialización
  setUserId: (userId: number) => void;
  
  // Carga de datos
  loadEssentialTasks: () => Promise<void>;
  loadRecentCompleted: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshMonthTasks: () => Promise<void>;
  loadMonthTasks: (year: number, month: number) => Promise<void>;
  loadTasksByDateRange: (startDate: string, endDate: string) => Promise<void>;
  
  // CRUD de tareas
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: number, input: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  
  // Acciones especiales
  completeTask: (
    id: number,
    earnedPoints: number,
    bonusMultiplier: number,
    flags: {
      completedEarly: boolean;
      isFirstTaskOfDay: boolean;
      completedDuringStreak: boolean;
    }
  ) => Promise<Task>;
  toggleTask: (id: number) => Promise<Task>;
  
  // Limpieza
  clearError: () => void;
  clearCache: () => void;
  
  // ==================== HELPERS ====================
  
  // Obtener todas las tareas activas
  getAllActiveTasks: () => Task[];
  
  // Buscar tarea por ID en caché
  getTaskById: (id: number) => Task | undefined;
  
  // Obtener tareas por filtros
  getTasksByCategory: (category: string) => Task[];
  getTasksByDifficulty: (difficulty: string) => Task[];
  getCompletedTasks: () => Task[];
  
  // Estadísticas rápidas
  getQuickStats: () => {
    total: number;
    pending: number;
    today: number;
    completed: number;
  };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // ==================== ESTADO INICIAL ====================
  
  pendingTasks: [],
  todayTasks: [],
  recentCompleted: [],
  monthTasks: [],
  currentMonth: null, 
  loading: false,
  error: null,
  MAX_RECENT_COMPLETED: 30,
  userId: null,
  
  // ==================== INICIALIZACIÓN ====================
  
  setUserId: (userId: number) => {
    set({ userId });
    console.log('✅ User ID set:', userId);
  },
  
  // ==================== CARGA DE DATOS ====================
  
  /**
   * Cargar tareas esenciales (pendientes + hoy)
   */
  loadEssentialTasks: async () => {
    const userId = get().userId;
    if (!userId) {
      console.warn('⚠️ No user ID set - waiting for user initialization');
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const today = getTodayDate();
      console.log('📅 Loading tasks for today:', today); // Debug
      
      // Cargar en paralelo para mejor performance
      const [pending, todayTasks] = await Promise.all([
        TaskRepository.findPending(userId),
        TaskRepository.findByDate(userId, today),
      ]);

    console.log('📋 Pending tasks:', pending.length); // Debug
    console.log('📋 Today tasks:', todayTasks.length); // Debug
      
      // Remover duplicados (tareas que están en ambas listas)
      const todayIds = new Set(todayTasks.map(t => t.id));
      const uniquePending = pending.filter(t => !todayIds.has(t.id));
      
      set({ 
        pendingTasks: uniquePending,
        todayTasks,
        loading: false,
      });
      
      console.log(`✅ Loaded ${uniquePending.length} pending + ${todayTasks.length} today tasks`);
    } catch (error) {
      console.error('❌ Error loading essential tasks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tareas',
        loading: false,
      });
    }
  },
  
  /**
   * Cargar tareas completadas recientes
   */
  loadRecentCompleted: async () => {
    const userId = get().userId;
    if (!userId) return;
    
    try {
      const completed = await TaskRepository.findCompleted(userId);
      
      set({ 
        recentCompleted: completed.slice(0, get().MAX_RECENT_COMPLETED),
      });
      
      console.log(`✅ Loaded ${Math.min(completed.length, get().MAX_RECENT_COMPLETED)} recent completed tasks`);
    } catch (error) {
      console.error('❌ Error loading recent completed:', error);
    }
  },
    loadMonthTasks: async (year: number, month: number) => {
    const userId = get().userId;
    if (!userId) {
      console.warn('⚠️ No user ID set - waiting for user initialization');
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const monthTasks = await TaskRepository.findByMonth(userId, year, month);
      
      set({ 
        monthTasks,
        currentMonth: { year, month },
        loading: false,
      });
      
      console.log(`✅ Loaded ${monthTasks.length} tasks for ${year}-${month}`);
    } catch (error) {
      console.error('❌ Error loading month tasks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tareas del mes',
        loading: false,
      });
    }
  },
   loadTasksByDateRange: async (startDate: string, endDate: string) => {
    const userId = get().userId;
    if (!userId) {
      console.warn('⚠️ No user ID set - waiting for user initialization');
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const tasks = await TaskRepository.findByDateRange(userId, startDate, endDate);
      
      set({ 
        monthTasks: tasks,
        loading: false,
      });
      
      console.log(`✅ Loaded ${tasks.length} tasks for range ${startDate} to ${endDate}`);
    } catch (error) {
      console.error('❌ Error loading tasks by date range:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tareas',
        loading: false,
      });
    }
  },
   refreshMonthTasks: async () => {
    const userId = get().userId;
    const currentMonth = get().currentMonth;
    
    if (!userId || !currentMonth) {
      console.log('⚠️ No user or current month to refresh');
      return;
    }
    
    console.log('🔄 Forcing refresh of current month:', currentMonth);
    
    try {
      const monthTasks = await TaskRepository.findByMonth(
        userId, 
        currentMonth.year, 
        currentMonth.month
      );
      
      set({ monthTasks });
      
      console.log(`✅ Refreshed ${monthTasks.length} tasks for month`);
    } catch (error) {
      console.error('❌ Error refreshing month tasks:', error);
    }
  },
  /**
   * Refrescar todas las tareas
   */
  refreshTasks: async () => {
    await Promise.all([
      get().loadEssentialTasks(),
      get().loadRecentCompleted(),
    ]);
  },
  
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Crear nueva tarea
   */
  createTask: async (input: CreateTaskInput) => {
    const userId = get().userId;
    if (!userId) {
      throw new Error('No user ID set');
    }

    set({ loading: true, error: null });

    try {
      const newTask = await TaskRepository.create(userId, input);

      // Programar notificación si es necesario
      if (newTask.hasReminder && newTask.dueDate && newTask.dueTime) {
        const notificationId = await scheduleTaskNotification(
          newTask.id,
          newTask.title,
          newTask.dueDate,
          newTask.dueTime
        );

        if (notificationId) {
          await TaskRepository.updateNotificationId(newTask.id, notificationId);
          newTask.notificationId = notificationId;
          console.log('🔔 Notification scheduled:', notificationId);
        }
      }

      const today = getTodayDate();

      // Agregar a la lista correspondiente
      if (input.dueDate === today) {
        set((state) => ({
          todayTasks: [newTask, ...state.todayTasks],
          loading: false,
        }));
      } else {
        set((state) => ({
          pendingTasks: [newTask, ...state.pendingTasks],
          loading: false,
        }));
      }

      console.log('✅ Task created:', newTask.id);
      return newTask;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      set({
        error: error instanceof Error ? error.message : 'Error al crear tarea',
        loading: false,
      });
      throw error;
    }
  },
  
  /**
   * Actualizar tarea
   */
  updateTask: async (id: number, input: UpdateTaskInput) => {
    set({ loading: true, error: null });

    try {
      const oldTask = get().getTaskById(id);
      const updatedTask = await TaskRepository.update(id, input);

      // Manejar cambios en notificaciones
      const hasDateTimeChanged =
        (input.dueDate !== undefined && input.dueDate !== oldTask?.dueDate) ||
        (input.dueTime !== undefined && input.dueTime !== oldTask?.dueTime);

      const hasReminderChanged =
        input.hasReminder !== undefined && input.hasReminder !== oldTask?.hasReminder;

      // Si hay cambios en recordatorio o fecha/hora, reprogramar
      if (hasReminderChanged || hasDateTimeChanged) {
        // Cancelar notificación anterior si existe
        if (oldTask?.notificationId) {
          await cancelTaskNotification(oldTask.notificationId);
          await TaskRepository.updateNotificationId(id, null);
        }

        // Programar nueva notificación si es necesario
        if (updatedTask.hasReminder && updatedTask.dueDate && updatedTask.dueTime) {
          const notificationId = await scheduleTaskNotification(
            updatedTask.id,
            updatedTask.title,
            updatedTask.dueDate,
            updatedTask.dueTime
          );

          if (notificationId) {
            await TaskRepository.updateNotificationId(updatedTask.id, notificationId);
            updatedTask.notificationId = notificationId;
            console.log('🔔 Notification rescheduled:', notificationId);
          }
        }
      }

      // Actualizar en todas las listas donde pueda estar
      set((state) => ({
        pendingTasks: state.pendingTasks.map(t => t.id === id ? updatedTask : t),
        todayTasks: state.todayTasks.map(t => t.id === id ? updatedTask : t),
        recentCompleted: state.recentCompleted.map(t => t.id === id ? updatedTask : t),
        loading: false,
      }));

      console.log('✅ Task updated:', id);
      return updatedTask;
    } catch (error) {
      console.error('❌ Error updating task:', error);
      set({
        error: error instanceof Error ? error.message : 'Error al actualizar tarea',
        loading: false,
      });
      throw error;
    }
  },
  
  /**
   * Eliminar tarea
   */
  deleteTask: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const task = get().getTaskById(id);

      // Cancelar notificación si existe
      if (task?.notificationId) {
        await cancelTaskNotification(task.notificationId);
        console.log('🔕 Notification cancelled for deleted task:', id);
      }

      await TaskRepository.delete(id);

      // Remover de todas las listas
      set((state) => ({
        pendingTasks: state.pendingTasks.filter(t => t.id !== id),
        todayTasks: state.todayTasks.filter(t => t.id !== id),
        recentCompleted: state.recentCompleted.filter(t => t.id !== id),
        loading: false,
      }));

      console.log('✅ Task deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      set({
        error: error instanceof Error ? error.message : 'Error al eliminar tarea',
        loading: false,
      });
      throw error;
    }
  },
  
  // ==================== ACCIONES ESPECIALES ====================
  
  /**
   * Completar tarea con puntos y bonificaciones
   */
  completeTask: async (
    id: number,
    earnedPoints: number,
    bonusMultiplier: number,
    flags: {
      completedEarly: boolean;
      isFirstTaskOfDay: boolean;
      completedDuringStreak: boolean;
    }
  ) => {
    try {
      const task = get().getTaskById(id);

      // Cancelar notificación si existe
      if (task?.notificationId) {
        await cancelTaskNotification(task.notificationId);
        console.log('🔕 Notification cancelled for completed task:', id);
      }

      const completedTask = await TaskRepository.complete(
        id,
        earnedPoints,
        bonusMultiplier,
        flags
      );

      // Remover de listas activas y agregar a completadas
      set((state) => {
        const newRecentCompleted = [
          completedTask,
          ...state.recentCompleted.slice(0, state.MAX_RECENT_COMPLETED - 1),
        ];

        return {
          pendingTasks: state.pendingTasks.filter(t => t.id !== id),
          todayTasks: state.todayTasks.filter(t => t.id !== id),
          recentCompleted: newRecentCompleted,
        };
      });

      console.log(`✅ Task completed: ${id} (+${earnedPoints} XP)`);
      return completedTask;
    } catch (error) {
      console.error('❌ Error completing task:', error);
      set({ error: error instanceof Error ? error.message : 'Error al completar tarea' });
      throw error;
    }
  },
  
  /**
   * Toggle estado completado
   */
toggleTask: async (id: number) => {
  try {
    const updatedTask = await TaskRepository.toggleCompleted(id);
    
    // Actualizar en TODAS las listas inmediatamente
    set((state) => {
      // Si se completó, mover a completadas
      if (updatedTask.completed) {
        return {
          pendingTasks: state.pendingTasks.filter(t => t.id !== id),
          todayTasks: state.todayTasks.filter(t => t.id !== id),
          recentCompleted: [
            updatedTask, 
            ...state.recentCompleted.slice(0, state.MAX_RECENT_COMPLETED - 1)
          ],
        };
      } else {
        // Si se descompletó, mover de vuelta a la lista correspondiente
        const today = getTodayDate();
        const newRecentCompleted = state.recentCompleted.filter(t => t.id !== id);
        
        if (updatedTask.dueDate === today) {
          return {
            todayTasks: [updatedTask, ...state.todayTasks],
            recentCompleted: newRecentCompleted,
          };
        } else {
          return {
            pendingTasks: [updatedTask, ...state.pendingTasks],
            recentCompleted: newRecentCompleted,
          };
        }
      }
    });
    
    console.log(`✅ Task toggled: ${id}`);
    return updatedTask;
  } catch (error) {
    console.error('❌ Error toggling task:', error);
    set({ error: error instanceof Error ? error.message : 'Error al cambiar tarea' });
    throw error;
  }
},
  
  // ==================== LIMPIEZA ====================
  
  clearError: () => set({ error: null }),
  
  clearCache: () => {
    set({ 
      pendingTasks: [],
      todayTasks: [],
      recentCompleted: [],
    });
    console.log('🗑️ Task cache cleared');
  },
  
  // ==================== HELPERS ====================
  
  /**
   * Obtener todas las tareas activas (sin duplicados)
   */
  getAllActiveTasks: () => {
    const { pendingTasks, todayTasks } = get();
    const allTasks = [...todayTasks, ...pendingTasks];
    
    // Remover duplicados usando Map
    const uniqueTasks = Array.from(
      new Map(allTasks.map(t => [t.id, t])).values()
    );
    
    return uniqueTasks;
  },
  
  /**
   * Buscar tarea por ID en caché
   */
  getTaskById: (id: number) => {
    const { pendingTasks, todayTasks, recentCompleted } = get();
    return [...todayTasks, ...pendingTasks, ...recentCompleted].find(t => t.id === id);
  },
  
  /**
   * Filtrar tareas por categoría
   */
  getTasksByCategory: (category: string) => {
    return get().getAllActiveTasks().filter(t => t.category === category);
  },
  
  /**
   * Filtrar tareas por dificultad
   */
  getTasksByDifficulty: (difficulty: string) => {
    return get().getAllActiveTasks().filter(t => t.difficulty === difficulty);
  },
  
  /**
   * Obtener tareas completadas (del caché)
   */
  getCompletedTasks: () => {
    return get().recentCompleted;
  },
  
  /**
   * Estadísticas rápidas
   */
  getQuickStats: () => {
    const { pendingTasks, todayTasks, recentCompleted } = get();
    
    return {
      total: pendingTasks.length + todayTasks.length,
      pending: pendingTasks.length,
      today: todayTasks.length,
      completed: recentCompleted.length,
    };
  },
}));