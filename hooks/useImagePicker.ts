import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { deleteProfileImage, saveProfileImage } from '../utils/imageUtils';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: 'image';
}

export interface UseImagePickerReturn {
  pickFromGallery: (oldImageUri?: string) => Promise<string | null>;
  pickFromCamera: (oldImageUri?: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para manejar selección de imágenes
 * Compatible con Expo Image Picker v16+
 */
export const useImagePicker = (): UseImagePickerReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Solicitar permisos de galería
   */
  const requestGalleryPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para seleccionar una foto de perfil.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error requesting gallery permissions:', error);
      return false;
    }
  };

  /**
   * Solicitar permisos de cámara
   */
  const requestCameraPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu cámara para tomar una foto de perfil.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error requesting camera permissions:', error);
      return false;
    }
  };

  /**
   * Procesar imagen seleccionada o tomada
   */
  const processImage = async (
    result: ImagePicker.ImagePickerResult,
    oldImageUri?: string
  ): Promise<string | null> => {
    try {
      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      
      if (!asset || !asset.uri) {
        throw new Error('No se pudo obtener la imagen');
      }

      // Guardar imagen en el sistema de archivos
      const savedUri = await saveProfileImage(asset.uri);

      // Eliminar imagen anterior si existe
      if (oldImageUri) {
        await deleteProfileImage(oldImageUri);
      }

      return savedUri;
    } catch (error) {
      console.error('❌ Error processing image:', error);
      throw error;
    }
  };

  /**
   * Seleccionar imagen desde la galería
   */
  const pickFromGallery = async (oldImageUri?: string): Promise<string | null> => {
    console.log('🖼️ [ImagePicker] Opening gallery...');
    setLoading(true);
    setError(null);

    try {
      // Solicitar permisos
      const hasPermission = await requestGalleryPermissions();
      if (!hasPermission) {
        console.log('❌ [ImagePicker] No permission');
        setLoading(false);
        return null;
      }
      console.log('📸 [ImagePicker] Launching gallery...');
      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        allowsMultipleSelection: false,
      });
 console.log('✅ [ImagePicker] Gallery closed', { canceled: result.canceled });
      // Procesar imagen
      const savedUri = await processImage(result, oldImageUri);
      setLoading(false);
      console.log('💾 [ImagePicker] Image saved:', savedUri);
      return savedUri;
    } catch (err) {
      console.error('❌ [ImagePicker] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al seleccionar imagen';
      setError(errorMessage);
      setLoading(false);
      
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta de nuevo.');
      return null;
    }
  };

  /**
   * Tomar foto con la cámara
   */
  const pickFromCamera = async (oldImageUri?: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si hay cámara disponible
      const isCameraAvailable = await ImagePicker.getCameraPermissionsAsync();
      
      if (Platform.OS === 'web' || !isCameraAvailable) {
        Alert.alert(
          'No disponible',
          'La cámara no está disponible en este dispositivo.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return null;
      }

      // Solicitar permisos
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      // Procesar imagen
      const savedUri = await processImage(result, oldImageUri);
      setLoading(false);
      return savedUri;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al tomar foto';
      setError(errorMessage);
      setLoading(false);
      
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
      return null;
    }
  };

  return {
    pickFromGallery,
    pickFromCamera,
    loading,
    error,
  };
};
