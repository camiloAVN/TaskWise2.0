// components/AddTaskModal.tsx

import { useTaskStore } from '@/stores/taskStore';
import { CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskFormData, TaskFormModal } from './modals/TaskFormModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  primary: '#d9f434',
  background: '#000000',
  modalBackground: '#1a1a1a',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  taskToEdit?: any; // Task a editar (opcional)
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose, taskToEdit }) => {
  const { createTask, updateTask } = useTaskStore();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = React.useState(false);


  useEffect(() => {
    if (visible) {
      // Mostrar el modal y luego animar
      setShowModal(true);
      
      // Pequeño delay para asegurar que el modal esté montado
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 10);
    } else {
      // Animar salida y luego ocultar el modal
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Ocultar el modal después de la animación
        setShowModal(false);
        // Resetear las animaciones para la próxima apertura
        slideAnim.setValue(SCREEN_HEIGHT);
        overlayOpacity.setValue(0);
      });
    }
  }, [visible]);

    const handleSave = async (data: TaskFormData) => {
    try {
      if (taskToEdit) {
        // Modo edición
        const updateData: UpdateTaskInput = {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          category: data.category,
          priority: data.priority,
          dueDate: data.dueDate,
          dueTime: data.dueTime,
          estimatedTime: data.estimatedTime,
        };
        
        await updateTask(taskToEdit.id, updateData);
        console.log('✅ Task updated');
      } else {
        // Modo crear
        const createData: CreateTaskInput = {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          category: data.category,
          priority: data.priority,
          dueDate: data.dueDate,
          dueTime: data.dueTime,
          estimatedTime: data.estimatedTime,
        };
        
        await createTask(createData);
        console.log('✅ Task created');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error al guardar la tarea');
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!showModal) {
    return null;
  }

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Overlay oscuro */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Contenido del modal */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

              <TaskFormModal
                visible={visible}
                task={taskToEdit}
                onClose={onClose}
                onSave={handleSave}
              />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.modalBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(217, 244, 52, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});