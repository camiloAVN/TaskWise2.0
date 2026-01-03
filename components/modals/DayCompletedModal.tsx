import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import LottieView from 'lottie-react-native'; // Descomentar cuando tengas la animación

interface DayCompletedModalProps {
  visible: boolean;
  onClose: () => void;
  streakCount: number;
  tasksCompleted: number;
}

export const DayCompletedModal: React.FC<DayCompletedModalProps> = ({
  visible,
  onClose,
  streakCount,
  tasksCompleted,
}) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset para la próxima vez
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

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
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
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
              paddingTop: insets.top + 40,
              paddingBottom: Math.max(insets.bottom, 20) + 20,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* Animation Container */}
          <View style={styles.animationContainer}>
            {/* TODO: Reemplazar con tu animación Lottie */}
            {/* <LottieView
              source={require('../../assets/animations/celebration.json')}
              autoPlay
              loop
              style={styles.lottie}
            /> */}

            {/* Placeholder mientras tanto */}
            <View style={styles.placeholderAnimation}>
              <Text style={styles.placeholderEmoji}>🎉</Text>
              <Text style={styles.placeholderEmoji}>🔥</Text>
              <Text style={styles.placeholderEmoji}>⭐</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>¡Día Completado!</Text>

          {/* Message */}
          <Text style={styles.message}>
            Has completado todas tus {tasksCompleted} tareas de hoy
          </Text>

          {/* Streak Info */}
          <View style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={32} color="#FF6B35" />
              <Text style={styles.streakNumber}>{streakCount}</Text>
            </View>
            <Text style={styles.streakLabel}>
              {streakCount === 1 ? 'día de racha' : 'días de racha'}
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Sigue Progresando</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d9f434',
    shadowColor: '#d9f434',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#000',
    zIndex: 10,
  },
  animationContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  placeholderAnimation: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d9f434',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#d9f434',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9f434',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    width: '100%',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
