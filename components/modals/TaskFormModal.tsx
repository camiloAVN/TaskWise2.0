import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CATEGORY_INFO,
  DIFFICULTY_POINTS,
  PRIORITY_INFO,
  Task,
  TaskCategory,
  TaskDifficulty,
  TaskPriority,
} from '../../types/task';
import { formatDateToCalendar, formatTimeToCalendar, getTodayDate, parseCalendarDate } from '../../utils/dateUtils';

interface TaskFormModalProps {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
}

export interface TaskFormData {
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  estimatedTime?: number;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  task,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const isEditMode = !!task;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedTime, setEstimatedTime] = useState('');

  // ✅ Date & Time state (usando Date objects)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasTime, setHasTime] = useState(false);

  // Animation
  const slideAnim = React.useRef(new Animated.Value(1000)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  // Cargar datos si es modo edición
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDifficulty(task.difficulty);
      setCategory(task.category);
      setPriority(task.priority);
      setEstimatedTime(task.estimatedTime?.toString() || '');

      // ✅ Cargar fecha
      if (task.dueDate) {
        const date = parseCalendarDate(task.dueDate);
        setSelectedDate(date);
      }

      // ✅ Cargar hora
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':');
        const time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes));
        setSelectedTime(time);
        setHasTime(true);
      } else {
        setHasTime(false);
      }
    } else {
      resetForm();
    }
  }, [task, visible]);

  // Animaciones
  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('medium');
    setCategory('personal');
    setPriority('medium');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setHasTime(false);
    setEstimatedTime('');
  };

  // Handlers para DateTimePicker
  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // En iOS mantener abierto
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
      setHasTime(true);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor ingresa un título');
      return;
    }
      const formattedDate = formatDateToCalendar(selectedDate);
      const formattedTime = hasTime ? formatTimeToCalendar(selectedTime) : undefined;

      console.log('💾 Saving task:'); // Debug
      console.log('  Date:', formattedDate); // Debug
      console.log('  Time:', formattedTime); // Debug
      console.log('  Today:', getTodayDate()); // Debug

    const formData: TaskFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      category,
      priority,
      dueDate: formattedDate,
      dueTime: formattedTime,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
    };

    onSave(formData);
    if (!isEditMode) {
      resetForm();
    }
    onClose();
  };

  const handleClose = () => {
    if (!isEditMode) {
      resetForm();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
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
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Completar informe mensual"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Agrega detalles adicionales..."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={styles.label}>Dificultad</Text>
            <View style={styles.optionsGrid}>
              {(Object.keys(DIFFICULTY_POINTS) as TaskDifficulty[]).map((diff) => {
                const info = DIFFICULTY_POINTS[diff];
                const isSelected = difficulty === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => setDifficulty(diff)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionIcon}>{info.icon}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                    <Text
                      style={[
                        styles.optionPoints,
                        isSelected && styles.optionPointsSelected,
                      ]}
                    >
                      {info.basePoints} XP
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Categoría</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {(Object.keys(CATEGORY_INFO) as TaskCategory[]).map((cat) => {
                const info = CATEGORY_INFO[cat];
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipIcon}>{info.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {info.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.optionsRow}>
              {(Object.keys(PRIORITY_INFO) as TaskPriority[]).map((prio) => {
                const info = PRIORITY_INFO[prio];
                const isSelected = priority === prio;
                return (
                  <TouchableOpacity
                    key={prio}
                    style={[
                      styles.priorityButton,
                      isSelected && styles.priorityButtonSelected,
                    ]}
                    onPress={() => setPriority(prio)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.priorityIcon}>{info.icon}</Text>
                    <Text
                      style={[
                        styles.priorityText,
                        isSelected && styles.priorityTextSelected,
                      ]}
                    >
                      {info.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date & Time con DateTimePicker */}
          <View style={styles.section}>
            <Text style={styles.label}>Fecha y Hora</Text>

            {/* Date Picker */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color="#d9f434" />
              <Text style={styles.dateTimeButtonText}>
                {formatDateToCalendar(selectedDate)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                themeVariant="dark"
              />
            )}

            {/* Time Picker */}
            <View style={styles.timePickerContainer}>
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  { flex: 1 },
                  !hasTime && styles.dateTimeButtonDisabled,
                ]}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={hasTime ? '#d9f434' : '#666'}
                />
                <Text
                  style={[
                    styles.dateTimeButtonText,
                    !hasTime && styles.dateTimeButtonTextDisabled,
                  ]}
                >
                  {hasTime ? formatTimeToCalendar(selectedTime) : 'Sin hora'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {hasTime && (
                <TouchableOpacity
                  style={styles.clearTimeButton}
                  onPress={() => setHasTime(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                themeVariant="dark"
              />
            )}
          </View>

          {/* Estimated Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Tiempo Estimado (minutos)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 30"
              placeholderTextColor="#666"
              value={estimatedTime}
              onChangeText={setEstimatedTime}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isEditMode ? 'checkmark-circle' : 'add-circle'}
              size={24}
              color="#000"
            />
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Guardar Cambios' : 'Crear Tarea'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    height: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  optionCardSelected: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionTextSelected: {
    color: '#000',
  },
  optionPoints: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  optionPointsSelected: {
    color: '#000',
  },
  horizontalScroll: {
    gap: 8,
    paddingRight: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipSelected: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  chipTextSelected: {
    color: '#000',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  priorityButtonSelected: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  priorityIcon: {
    fontSize: 14,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  priorityTextSelected: {
    color: '#000',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  dateTimeButtonDisabled: {
    opacity: 0.5,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  dateTimeButtonTextDisabled: {
    color: '#666',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearTimeButton: {
    padding: 8,
  },
  footer: {
    padding: 24,
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