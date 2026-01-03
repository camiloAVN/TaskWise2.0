import { create } from 'zustand';

interface UIStore {
  // Estado
  isAddTaskModalOpen: boolean;
  isWeeklyTasksModalOpen: boolean;

  // Acciones
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  toggleAddTaskModal: () => void;

  openWeeklyTasksModal: () => void;
  closeWeeklyTasksModal: () => void;
  toggleWeeklyTasksModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Estado inicial
  isAddTaskModalOpen: false,
  isWeeklyTasksModalOpen: false,

  // Abrir modal de agregar tarea
  openAddTaskModal: () => set({ isAddTaskModalOpen: true }),

  // Cerrar modal de agregar tarea
  closeAddTaskModal: () => set({ isAddTaskModalOpen: false }),

  // Toggle modal de agregar tarea
  toggleAddTaskModal: () => set((state) => ({
    isAddTaskModalOpen: !state.isAddTaskModalOpen
  })),

  // Abrir modal de tareas semanales
  openWeeklyTasksModal: () => set({ isWeeklyTasksModalOpen: true }),

  // Cerrar modal de tareas semanales
  closeWeeklyTasksModal: () => set({ isWeeklyTasksModalOpen: false }),

  // Toggle modal de tareas semanales
  toggleWeeklyTasksModal: () => set((state) => ({
    isWeeklyTasksModalOpen: !state.isWeeklyTasksModalOpen
  })),
}));