import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import { TaskRepository } from '@/database/repositories/taskRepository';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_INFO, Task, TaskCategory, TaskDifficulty, TaskPriority } from '../../types/task';
import { getCurrentWeekRange, getWeekDayDate, DAY_NAMES_SHORT } from '../../utils/weekUtils';
import { rescheduleWeeklyPlanningNotification } from '../../utils/weeklyNotificationService';

interface WeeklyTaskForm {
  id: string;
  title: string;
  time: string;
  selectedDays: boolean[]; // [Dom, Lun, Mar, Mié, Jue, Vie, Sáb]
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  category: TaskCategory;
  expanded: boolean;
}

interface WeeklyTasksModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WeeklyTasksModal: React.FC<WeeklyTasksModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { createTask } = useTaskStore();
  const { user, updateWeeklyModalShown } = useUserStore();

  // State
  const [existingTasks, setExistingTasks] = useState<Task[]>([]);
  const [showExistingTasks, setShowExistingTasks] = useState(true);
  const [newTasks, setNewTasks] = useState<WeeklyTaskForm[]>([]);
  const [loading, setLoading] = useState(false);

  // Time picker
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState(new Date());

  // Animation
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Load existing tasks for current week
  useEffect(() => {
    if (visible && user) {
      loadWeekTasks();
      initializeNewTask();
      animateIn();
    } else if (!visible) {
      resetState();
    }
  }, [visible, user]);

  const loadWeekTasks = async () => {
    if (!user) return;

    try {
      const { startDate, endDate } = getCurrentWeekRange();
      const tasks = await TaskRepository.findByDateRange(user.id, startDate, endDate);
      setExistingTasks(tasks);
    } catch (error) {
      console.error('Error loading week tasks:', error);
    }
  };

  const initializeNewTask = () => {
    setNewTasks([createEmptyTaskForm()]);
  };

  const createEmptyTaskForm = (): WeeklyTaskForm => ({
    id: Math.random().toString(),
    title: '',
    time: '',
    selectedDays: [false, false, false, false, false, false, false],
    difficulty: 'medium',
    priority: 'medium',
    category: 'personal',
    expanded: false,
  });

  const resetState = () => {
    setExistingTasks([]);
    setNewTasks([]);
    setShowExistingTasks(true);
    setShowTimePicker(null);
  };

  const animateIn = () => {
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
  };

  const animateOut = (callback?: () => void) => {
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
    ]).start(() => callback?.());
  };

  const handleClose = () => {
    animateOut(onClose);
  };

  const handleAddTask = () => {
    setNewTasks([...newTasks, createEmptyTaskForm()]);
  };

  const handleRemoveTask = (id: string) => {
    setNewTasks(newTasks.filter((t) => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<WeeklyTaskForm>) => {
    setNewTasks(
      newTasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const toggleDay = (taskId: string, dayIndex: number) => {
    setNewTasks(
      newTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              selectedDays: t.selectedDays.map((selected, i) =>
                i === dayIndex ? !selected : selected
              ),
            }
          : t
      )
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(null);
      return;
    }

    if (selectedTime && showTimePicker) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      updateTask(showTimePicker, { time: timeString });
      setShowTimePicker(null);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate
    const validTasks = newTasks.filter(
      (t) => t.title.trim() && t.selectedDays.some((d) => d)
    );

    if (validTasks.length === 0) {
      Alert.alert(
        'Sin tareas',
        'Agrega al menos una tarea con un día seleccionado'
      );
      return;
    }

    setLoading(true);

    try {
      // Create tasks
      for (const taskForm of validTasks) {
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          if (taskForm.selectedDays[dayIndex]) {
            const dueDate = getWeekDayDate(dayIndex);

            await createTask({
              title: taskForm.title.trim(),
              difficulty: taskForm.difficulty,
              priority: taskForm.priority,
              category: taskForm.category,
              dueDate,
              dueTime: taskForm.time || undefined,
              hasReminder: false,
            });
          }
        }
      }

      // Update last shown date
      await updateWeeklyModalShown();

      // Reschedule notification
      if (user) {
        await rescheduleWeeklyPlanningNotification(
          user.id,
          user.weeklyPlanningNotificationId
        );
      }

      handleClose();
    } catch (error) {
      console.error('Error saving weekly tasks:', error);
      Alert.alert('Error', 'No se pudieron guardar las tareas');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.container}>
        {/* Overlay */}
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              paddingBottom: insets.bottom || 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Planifica tu Semana</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Existing Tasks Section */}
            {existingTasks.length > 0 && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setShowExistingTasks(!showExistingTasks)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>
                    Tareas de esta semana ({existingTasks.length})
                  </Text>
                  <Ionicons
                    name={
                      showExistingTasks
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {showExistingTasks && (
                  <View style={styles.existingTasksList}>
                    {existingTasks.map((task) => (
                      <View key={task.id} style={styles.existingTask}>
                        <Ionicons
                          name={
                            task.completed
                              ? 'checkmark-circle'
                              : 'ellipse-outline'
                          }
                          size={20}
                          color={task.completed ? '#d9f434' : '#666'}
                        />
                        <Text
                          style={[
                            styles.existingTaskText,
                            task.completed &&
                              styles.existingTaskTextCompleted,
                          ]}
                        >
                          {task.title}
                        </Text>
                        {task.dueTime && (
                          <Text style={styles.existingTaskTime}>
                            {task.dueTime}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* New Tasks Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {existingTasks.length > 0
                  ? 'Agregar Nuevas Tareas'
                  : 'No tienes tareas para esta semana'}
              </Text>

              {newTasks.map((task, index) => (
                <View key={task.id} style={styles.taskForm}>
                  {/* Day Checkboxes */}
                  <View style={styles.daysContainer}>
                    {DAY_NAMES_SHORT.map((dayName, dayIndex) => (
                      <TouchableOpacity
                        key={dayIndex}
                        style={[
                          styles.dayButton,
                          task.selectedDays[dayIndex] &&
                            styles.dayButtonActive,
                        ]}
                        onPress={() => toggleDay(task.id, dayIndex)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            task.selectedDays[dayIndex] &&
                              styles.dayTextActive,
                          ]}
                        >
                          {dayName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Title and Time */}
                  <View style={styles.titleRow}>
                    <TextInput
                      style={styles.titleInput}
                      placeholder="Nombre de la tarea"
                      placeholderTextColor="#666"
                      value={task.title}
                      onChangeText={(text) =>
                        updateTask(task.id, { title: text })
                      }
                      maxLength={100}
                    />

                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => {
                        setShowTimePicker(task.id);
                        const [hours, minutes] = task.time
                          ? task.time.split(':')
                          : ['12', '00'];
                        const date = new Date();
                        date.setHours(parseInt(hours), parseInt(minutes));
                        setTempTime(date);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="time-outline" size={20} color="#d9f434" />
                      {task.time && (
                        <Text style={styles.timeText}>{task.time}</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Expandable Section */}
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() =>
                      updateTask(task.id, { expanded: !task.expanded })
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.expandText}>
                      Dificultad, Prioridad, Categoría
                    </Text>
                    <Ionicons
                      name={
                        task.expanded
                          ? 'chevron-up'
                          : 'chevron-down'
                      }
                      size={18}
                      color="#666"
                    />
                  </TouchableOpacity>

                  {task.expanded && (
                    <View style={styles.expandedSection}>
                      {/* Difficulty */}
                      <Text style={styles.label}>Dificultad</Text>
                      <View style={styles.optionsRow}>
                        {(['easy', 'medium', 'hard', 'extreme'] as TaskDifficulty[]).map(
                          (diff) => (
                            <TouchableOpacity
                              key={diff}
                              style={[
                                styles.option,
                                task.difficulty === diff &&
                                  styles.optionActive,
                              ]}
                              onPress={() =>
                                updateTask(task.id, { difficulty: diff })
                              }
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.optionText,
                                  task.difficulty === diff &&
                                    styles.optionTextActive,
                                ]}
                              >
                                {diff === 'easy'
                                  ? 'Fácil'
                                  : diff === 'medium'
                                  ? 'Media'
                                  : diff === 'hard'
                                  ? 'Difícil'
                                  : 'Extrema'}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>

                      {/* Priority */}
                      <Text style={styles.label}>Prioridad</Text>
                      <View style={styles.optionsRow}>
                        {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(
                          (pri) => (
                            <TouchableOpacity
                              key={pri}
                              style={[
                                styles.option,
                                task.priority === pri &&
                                  styles.optionActive,
                              ]}
                              onPress={() =>
                                updateTask(task.id, { priority: pri })
                              }
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.optionText,
                                  task.priority === pri &&
                                    styles.optionTextActive,
                                ]}
                              >
                                {pri === 'low'
                                  ? 'Baja'
                                  : pri === 'medium'
                                  ? 'Media'
                                  : pri === 'high'
                                  ? 'Alta'
                                  : 'Urgente'}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>

                      {/* Category */}
                      <Text style={styles.label}>Categoría</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScroll}
                      >
                        {Object.entries(CATEGORY_INFO).map(
                          ([key, info]) => (
                            <TouchableOpacity
                              key={key}
                              style={[
                                styles.categoryChip,
                                task.category === key &&
                                  styles.categoryChipActive,
                              ]}
                              onPress={() =>
                                updateTask(task.id, {
                                  category: key as TaskCategory,
                                })
                              }
                              activeOpacity={0.7}
                            >
                              <Text style={styles.categoryIcon}>
                                {info.icon}
                              </Text>
                              <Text
                                style={[
                                  styles.categoryText,
                                  task.category === key &&
                                    styles.categoryTextActive,
                                ]}
                              >
                                {info.name}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </ScrollView>
                    </View>
                  )}

                  {/* Delete Button */}
                  {newTasks.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleRemoveTask(task.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                      <Text style={styles.deleteText}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Add Task Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTask}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={24} color="#d9f434" />
                <Text style={styles.addText}>Agregar otra tarea</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.saveText}>
                {loading ? 'GUARDANDO...' : 'GUARDAR'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={true}
            onChange={handleTimeChange}
          />
        )}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  existingTasksList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
  },
  existingTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  existingTaskText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#fff',
  },
  existingTaskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  existingTaskTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  taskForm: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 4,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  dayTextActive: {
    color: '#000',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  titleInput: {
    flex: 1,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#d9f434',
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 13,
    color: '#666',
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#000',
  },
  categoriesScroll: {
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#000',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  deleteText: {
    fontSize: 13,
    color: '#ff4444',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#d9f434',
    borderRadius: 12,
    paddingVertical: 14,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d9f434',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#d9f434',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
