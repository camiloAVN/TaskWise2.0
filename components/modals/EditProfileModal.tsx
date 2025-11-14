import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from '../../types/user';

interface EditProfileModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onSave: (data: { name: string; age?: number; email?: string }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  const {height} = useWindowDimensions();
  
  // Form states
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age?.toString() || '');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    age?: string;
    email?: string;
  }>({});

  // Animations
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (visible) {
      setName(user.name);
      setAge(user.age?.toString() || '');
      setEmail(user.email || '');
      setErrors({});

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
  }, [visible, user]);

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validar nombre
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    }

    // Validar edad (opcional)
    if (age.trim()) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum)) {
        newErrors.age = 'La edad debe ser un número';
      } else if (ageNum < 1 || ageNum > 120) {
        newErrors.age = 'Ingresa una edad válida (1-120)';
      }
    }

    // Validar email (opcional)
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Ingresa un correo válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar guardado
   */
  const handleSave = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data: { name: string; age?: number; email?: string } = {
        name: name.trim(),
      };

      // Solo incluir edad si hay valor
      if (age.trim()) {
        data.age = parseInt(age);
      } else {
        data.age = undefined;
      }

      // Solo incluir email si hay valor
      if (email.trim()) {
        data.email = email.trim();
      } else {
        data.email = undefined;
      }

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar cierre
   */
  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  /**
   * Detectar cambios
   */
  const hasChanges = () => {
    const ageChanged = age.trim() 
      ? parseInt(age) !== user.age 
      : user.age !== undefined;
    
    const emailChanged = email.trim() !== (user.email || '');
    
    return name.trim() !== user.name || ageChanged || emailChanged;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                  styles.modalContainer,
                  {
                    paddingBottom: insets.bottom || 20,
                    transform: [{ translateY: slideAnim }],
                    height: height*0.8
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.handle} />
                  
                  <View style={styles.headerContent}>
                    <Text style={styles.title}>Editar Perfil</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleClose}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form */}
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* Nombre */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Ionicons name="person-outline" size={20} color="#d9f434" />
                      <Text style={styles.label}>Nombre</Text>
                      <Text style={styles.required}>*</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.name && styles.inputError,
                      ]}
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (errors.name) {
                          setErrors({ ...errors, name: undefined });
                        }
                      }}
                      placeholder="Tu nombre"
                      placeholderTextColor="#666"
                      maxLength={50}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                    {errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                  </View>

                  {/* Edad */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Ionicons name="calendar-outline" size={20} color="#d9f434" />
                      <Text style={styles.label}>Edad</Text>
                      <Text style={styles.optional}>(opcional)</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.age && styles.inputError,
                      ]}
                      value={age}
                      onChangeText={(text) => {
                        // Solo permitir números
                        const numericText = text.replace(/[^0-9]/g, '');
                        setAge(numericText);
                        if (errors.age) {
                          setErrors({ ...errors, age: undefined });
                        }
                      }}
                      placeholder="Ej: 25"
                      placeholderTextColor="#666"
                      keyboardType="number-pad"
                      maxLength={3}
                      returnKeyType="next"
                    />
                    {errors.age && (
                      <Text style={styles.errorText}>{errors.age}</Text>
                    )}
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Ionicons name="mail-outline" size={20} color="#d9f434" />
                      <Text style={styles.label}>Correo Electrónico</Text>
                      <Text style={styles.optional}>(opcional)</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.email && styles.inputError,
                      ]}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) {
                          setErrors({ ...errors, email: undefined });
                        }
                      }}
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor="#666"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleSave}
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>
                      Tu información es privada y se guarda solo en tu dispositivo
                    </Text>
                  </View>
                </ScrollView>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (!hasChanges() || loading) && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!hasChanges() || loading}
                    activeOpacity={0.7}
                  >
                    {loading ? (
                      <Text style={styles.saveButtonText}>Guardando...</Text>
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#000" />
                        <Text style={styles.saveButtonText}>Guardar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  required: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  optional: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    fontSize: 13,
    color: '#F44336',
    marginTop: 6,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#d9f434',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#4a4a3a',
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});