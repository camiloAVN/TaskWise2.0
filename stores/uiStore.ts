import { create } from 'zustand';

interface UIStore {
  // Estado
  isAddTaskModalOpen: boolean;
  
  // Acciones
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  toggleAddTaskModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Estado inicial
  isAddTaskModalOpen: false,
  
  // Abrir modal
  openAddTaskModal: () => set({ isAddTaskModalOpen: true }),
  
  // Cerrar modal
  closeAddTaskModal: () => set({ isAddTaskModalOpen: false }),
  
  // Toggle modal
  toggleAddTaskModal: () => set((state) => ({ 
    isAddTaskModalOpen: !state.isAddTaskModalOpen 
  })),
}));