// components/AddTaskModal.tsx

import { useTaskStore } from '@/stores/taskStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient'; // ✅ Necesitarás instalar esto
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_INFO, Task, TaskCategory, TaskDifficulty, TaskPriority } from '../types/task';
import { getTodayDate } from '../utils/dateUtils';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  taskToEdit,
}) => {
  const insets = useSafeAreaInsets();
  const { createTask, updateTask } = useTaskStore();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [dueDate, setDueDate] = useState(getTodayDate());
  const [dueTime, setDueTime] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Animation
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // ✅ NUEVO: Estados para mostrar/ocultar indicadores de scroll
  const [showDifficultyIndicator, setShowDifficultyIndicator] = useState(true);
  const [showPriorityIndicator, setShowPriorityIndicator] = useState(false); // Priority tiene 3, no necesita
  const [showCategoryIndicator, setShowCategoryIndicator] = useState(true);

  useEffect(() => {
    if (visible) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setDifficulty(taskToEdit.difficulty);
        setPriority(taskToEdit.priority);
        setCategory(taskToEdit.category);
        setDueDate(taskToEdit.dueDate || getTodayDate());
        setDueTime(taskToEdit.dueTime || '');
        setEstimatedTime(taskToEdit.estimatedTime?.toString() || '');
      } else {
        resetForm();
      }

      // Reset indicators
      setShowDifficultyIndicator(true);
      setShowCategoryIndicator(true);

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
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1000,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, taskToEdit]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('medium');
    setPriority('medium');
    setCategory('personal');
    setDueDate(getTodayDate());
    setDueTime('');
    setEstimatedTime('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        priority,
        category,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      };

      if (taskToEdit) {
        await updateTask(taskToEdit.id, taskData);
      } else {
        await createTask(taskData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'No se pudo guardar la tarea');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setDueTime(`${hours}:${minutes}`);
    }
  };

  // ✅ NUEVO: Handler para detectar cuando se llega al final del scroll
  const handleScrollEnd = (
    event: any,
    setIndicator: (value: boolean) => void
  ) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 10;
    setIndicator(!isAtEnd);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              paddingTop: insets.top + 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {taskToEdit ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 90, 110) },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ej: Terminar informe mensual"
                placeholderTextColor="#666"
                maxLength={100}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Agrega detalles sobre la tarea..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* ✅ Difficulty con indicador */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Dificultad</Text>
                {showDifficultyIndicator && (
                  <View style={styles.scrollHint}>
                    <Text style={styles.scrollHintText}>Desliza</Text>
                    <Ionicons name="chevron-forward" size={14} color="#666" />
                  </View>
                )}
              </View>
              <View style={styles.horizontalScrollContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                  onScroll={(e) => handleScrollEnd(e, setShowDifficultyIndicator)}
                  scrollEventThrottle={16}
                >
                  {(['easy', 'medium', 'hard', 'extreme'] as TaskDifficulty[]).map((diff) => (
                    <TouchableOpacity
                      key={diff}
                      style={[
                        styles.horizontalOption,
                        difficulty === diff && styles.horizontalOptionActive,
                      ]}
                      onPress={() => setDifficulty(diff)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.horizontalOptionText,
                          difficulty === diff && styles.horizontalOptionTextActive,
                        ]}
                      >
                        {diff === 'easy' && '😊 Fácil'}
                        {diff === 'medium' && '💪 Media'}
                        {diff === 'hard' && '🔥 Difícil'}
                        {diff === 'extreme' && '⚡ Extrema'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {/* ✅ Gradiente indicador */}
                {showDifficultyIndicator && (
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(217,244,52,0.4)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 2, y: 0 }}
                    style={styles.scrollGradient}
                    pointerEvents="none"
                  />
                )}
              </View>
            </View>

            {/* Priority - Sin indicador (solo 3 opciones visibles) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prioridad</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {(['low', 'medium', 'high'] as TaskPriority[]).map((prio) => (
                  <TouchableOpacity
                    key={prio}
                    style={[
                      styles.horizontalOption,
                      priority === prio && styles.horizontalOptionActive,
                    ]}
                    onPress={() => setPriority(prio)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.horizontalOptionText,
                        priority === prio && styles.horizontalOptionTextActive,
                      ]}
                    >
                      {prio === 'low' && '🔵 Baja'}
                      {prio === 'medium' && '🟡 Media'}
                      {prio === 'high' && '🔴 Alta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ✅ Category con indicador */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Categoría</Text>
                {showCategoryIndicator && (
                  <View style={styles.scrollHint}>
                    <Text style={styles.scrollHintText}>Desliza</Text>
                    <Ionicons name="chevron-forward" size={14} color="#666" />
                  </View>
                )}
              </View>
              <View style={styles.horizontalScrollContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                  onScroll={(e) => handleScrollEnd(e, setShowCategoryIndicator)}
                  scrollEventThrottle={16}
                >
                  {(Object.keys(CATEGORY_INFO) as TaskCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.horizontalOption,
                        category === cat && styles.horizontalOptionActive,
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.horizontalOptionText,
                          category === cat && styles.horizontalOptionTextActive,
                        ]}
                      >
                        {CATEGORY_INFO[cat].icon} {CATEGORY_INFO[cat].name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {/* ✅ Gradiente indicador */}
                {showCategoryIndicator && (
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(217,244,52,0.4)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 2, y: 0 }}
                    style={styles.scrollGradient}
                    pointerEvents="none"
                  />
                )}
              </View>
            </View>

            {/* Date and Time */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Fecha</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color="#d9f434" />
                  <Text style={styles.dateButtonText}>{dueDate}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hora</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={20} color="#d9f434" />
                  <Text style={styles.dateButtonText}>
                    {dueTime || 'Sin hora'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Estimated Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiempo Estimado (minutos)</Text>
              <TextInput
                style={styles.input}
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                placeholder="Ej: 30"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={24} color="#000" />
              <Text style={styles.saveButtonText}>
                {taskToEdit ? 'Guardar Cambios' : 'Crear Tarea'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '95%',
    backgroundColor: '#000',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#d9f434',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  // ✅ NUEVO: Row para label + hint
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // ✅ NUEVO: Hint de scroll
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrollHintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  // ✅ NUEVO: Contenedor con gradiente
  horizontalScrollContainer: {
    position: 'relative',
  },
  horizontalScroll: {
    gap: 8,
    paddingRight: 24,
  },
  horizontalOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
  },
  horizontalOptionActive: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  horizontalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  horizontalOptionTextActive: {
    color: '#000',
  },
  // ✅ NUEVO: Gradiente en el borde derecho
  scrollGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9f434',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});