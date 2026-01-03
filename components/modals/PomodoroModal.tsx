import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PomodoroModalProps {
  visible: boolean;
  onClose: () => void;
  taskTitle?: string;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

// Obtener dimensiones de la pantalla
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calcular tamaños responsive
const isSmallScreen = SCREEN_HEIGHT < 700;
const TIMER_SIZE = isSmallScreen ? 180 : 210;
const TIMER_FONT_SIZE = isSmallScreen ? 40 : 50;
const POMODORO_COUNT_SIZE = isSmallScreen ? 20 : 30;

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  visible,
  onClose,
  taskTitle = 'Tarea',
}) => {
  const insets = useSafeAreaInsets();

  // Estados del temporizador
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showSettings, setShowSettings] = useState(false);

  // Configuraciones personalizables
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  // Estados temporales para inputs
  const [workDurationInput, setWorkDurationInput] = useState('25');
  const [shortBreakDurationInput, setShortBreakDurationInput] = useState('5');
  const [longBreakDurationInput, setLongBreakDurationInput] = useState('15');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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

  // Temporizador
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Limpiar al cerrar
  useEffect(() => {
    if (!visible) {
      handleReset();
    }
  }, [visible]);

  // Sincronizar inputs con valores cuando se abre settings
  useEffect(() => {
    if (showSettings) {
      setWorkDurationInput(workDuration.toString());
      setShortBreakDurationInput(shortBreakDuration.toString());
      setLongBreakDurationInput(longBreakDuration.toString());
    }
  }, [showSettings]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === 'work') {
      const newCount = pomodorosCompleted + 1;
      setPomodorosCompleted(newCount);

      Alert.alert(
        '🎉 ¡Pomodoro Completado!',
        `Has completado ${newCount} pomodoro${newCount > 1 ? 's' : ''}. ¿Tomar un descanso?`,
        [
          {
            text: 'Continuar Trabajando',
            onPress: () => {
              setMode('work');
              setTimeLeft(workDuration * 60);
            },
          },
          {
            text: newCount % 4 === 0 ? 'Descanso Largo' : 'Descanso Corto',
            onPress: () => {
              if (newCount % 4 === 0) {
                setMode('longBreak');
                setTimeLeft(longBreakDuration * 60);
              } else {
                setMode('shortBreak');
                setTimeLeft(shortBreakDuration * 60);
              }
              setIsRunning(true);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '✅ ¡Descanso Terminado!',
        '¿Listo para otro pomodoro?',
        [
          {
            text: 'Más Descanso',
            onPress: () => {
              setTimeLeft(
                mode === 'shortBreak'
                  ? shortBreakDuration * 60
                  : longBreakDuration * 60
              );
            },
          },
          {
            text: 'Empezar',
            onPress: () => {
              setMode('work');
              setTimeLeft(workDuration * 60);
              setIsRunning(true);
            },
          },
        ]
      );
    }
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(workDuration * 60);
    setMode('work');
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);

    switch (newMode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
    }
  };

  const handleSaveSettings = () => {
    const newWorkDuration = parseInt(workDurationInput) || 25;
    const newShortBreak = parseInt(shortBreakDurationInput) || 5;
    const newLongBreak = parseInt(longBreakDurationInput) || 15;

    const validWorkDuration = Math.max(1, Math.min(120, newWorkDuration));
    const validShortBreak = Math.max(1, Math.min(60, newShortBreak));
    const validLongBreak = Math.max(1, Math.min(120, newLongBreak));

    setWorkDuration(validWorkDuration);
    setShortBreakDuration(validShortBreak);
    setLongBreakDuration(validLongBreak);

    setWorkDurationInput(validWorkDuration.toString());
    setShortBreakDurationInput(validShortBreak.toString());
    setLongBreakDurationInput(validLongBreak.toString());

    handleModeChange(mode);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let totalSeconds = workDuration * 60;
    if (mode === 'shortBreak') totalSeconds = shortBreakDuration * 60;
    if (mode === 'longBreak') totalSeconds = longBreakDuration * 60;

    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return '#d9f434';
      case 'shortBreak':
        return '#4CAF50';
      case 'longBreak':
        return '#2196F3';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work':
        return '🎯 Tiempo de Trabajo';
      case 'shortBreak':
        return '☕ Descanso Corto';
      case 'longBreak':
        return '🌟 Descanso Largo';
    }
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
            onPress={onClose}
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
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>⏱️ Pomodoro</Text>
              <Text style={styles.taskTitle}>{taskTitle}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowSettings(!showSettings)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={showSettings ? '#d9f434' : '#fff'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Panel */}
          {showSettings ? (
            <ScrollView style={styles.settingsPanel} showsVerticalScrollIndicator={false}>
              <Text style={styles.settingsTitle}>⚙️ Configuración</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Tiempo de Trabajo (min)</Text>
                <TextInput
                  style={styles.settingInput}
                  value={workDurationInput}
                  onChangeText={setWorkDurationInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="25"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Descanso Corto (min)</Text>
                <TextInput
                  style={styles.settingInput}
                  value={shortBreakDurationInput}
                  onChangeText={setShortBreakDurationInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="5"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Descanso Largo (min)</Text>
                <TextInput
                  style={styles.settingInput}
                  value={longBreakDurationInput}
                  onChangeText={setLongBreakDurationInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="15"
                  placeholderTextColor="#666"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveSettings}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Guardar Configuración</Text>
              </TouchableOpacity>

              <Text style={styles.hint}>
                Valores válidos: 1-120 min para trabajo, 1-60 min para descansos
              </Text>
            </ScrollView>
          ) : (
            <>
              {/* Mode Selector */}
              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'work' && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeChange('work')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === 'work' && styles.modeButtonTextActive,
                    ]}
                  >
                    Trabajo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'shortBreak' && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeChange('shortBreak')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === 'shortBreak' && styles.modeButtonTextActive,
                    ]}
                  >
                    Descanso
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'longBreak' && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeChange('longBreak')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === 'longBreak' && styles.modeButtonTextActive,
                    ]}
                  >
                    Largo
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Timer Display con ScrollView */}
              <ScrollView
                style={styles.timerScrollView}
                contentContainerStyle={styles.timerContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modeLabel}>{getModeLabel()}</Text>

                {/* Circular Progress */}
                <View style={[styles.circularProgress, { width: TIMER_SIZE, height: TIMER_SIZE }]}>
                  <View style={[styles.progressBackground, { width: TIMER_SIZE, height: TIMER_SIZE, borderRadius: TIMER_SIZE / 2 }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          height: `${getProgress()}%`,
                          backgroundColor: getModeColor(),
                          borderRadius: TIMER_SIZE / 2,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.timerText, { color: getModeColor(), fontSize: TIMER_FONT_SIZE }]}
                  >
                    {formatTime(timeLeft)}
                  </Text>
                </View>

                {/* Pomodoros Completed */}
                <View style={styles.pomodorosContainer}>
                  <Text style={styles.pomodorosLabel}>Pomodoros Completados</Text>
                  <Text style={[styles.pomodorosCount, { fontSize: POMODORO_COUNT_SIZE }]}>
                    {pomodorosCompleted}
                  </Text>
                </View>
              </ScrollView>

              {/* Controls */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={24} color="#fff" />
                  <Text style={styles.resetButtonText}>Reiniciar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.playButton,
                    { backgroundColor: getModeColor() },
                  ]}
                  onPress={handlePlayPause}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isRunning ? 'pause' : 'play'}
                    size={48}
                    color="#000"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    setIsRunning(false);
                    setTimeLeft(0);
                    handleTimerComplete();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="play-skip-forward" size={24} color="#fff" />
                  <Text style={styles.skipButtonText}>Saltar</Text>
                </TouchableOpacity>
              </View>
            </>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  taskTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  modeButtonActive: {
    backgroundColor: '#d9f434',
    borderColor: '#d9f434',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#000',
  },
  timerScrollView: {
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 20 : 40,
    minHeight: isSmallScreen ? 400 : 500,
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: isSmallScreen ? 20 : 40,
  },
  circularProgress: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallScreen ? 20 : 40,
  },
  progressBackground: {
    position: 'absolute',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#333',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  timerText: {
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  pomodorosContainer: {
    alignItems: 'center',
  },
  pomodorosLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pomodorosCount: {
    fontWeight: 'bold',
    color: '#d9f434',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    alignItems: 'center',
    gap: 4,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  skipButton: {
    alignItems: 'center',
    gap: 4,
  },
  skipButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  settingsPanel: {
    flex: 1,
    padding: 24,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
  },
  settingInput: {
    width: 80,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d9f434',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  saveButton: {
    backgroundColor: '#d9f434',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
});