import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  onRemovePhoto?: () => void;
  hasCurrentPhoto?: boolean;
}

export const ImagePickerSheet: React.FC<ImagePickerSheetProps> = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectGallery,
  onRemovePhoto,
  hasCurrentPhoto = false,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheet,
                {
                  paddingBottom: insets.bottom || 20,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.handle} />
                <Text style={styles.title}>Foto de Perfil</Text>
              </View>

              {/* Options */}
              <View style={styles.options}>
                {/* Tomar Foto */}
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelectCamera();
                    handleClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#d9f434' }]}>
                    <Ionicons name="camera" size={24} color="#000" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Tomar Foto</Text>
                    <Text style={styles.optionDescription}>
                      Usar la cámara para tomar una nueva foto
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                {/* Seleccionar de Galería */}
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelectGallery();
                    handleClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#4A90E2' }]}>
                    <Ionicons name="images" size={24} color="#fff" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Elegir de Galería</Text>
                    <Text style={styles.optionDescription}>
                      Seleccionar una foto existente
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                {/* Eliminar Foto (solo si hay foto actual) */}
                {hasCurrentPhoto && onRemovePhoto && (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      onRemovePhoto();
                      handleClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: '#F44336' }]}>
                      <Ionicons name="trash" size={24} color="#fff" />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionTitle, { color: '#F44336' }]}>
                        Eliminar Foto
                      </Text>
                      <Text style={styles.optionDescription}>
                        Remover la foto de perfil actual
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  options: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#888',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
