import { Directory, File, Paths } from 'expo-file-system';

/**
 * Directorio donde se guardarán las imágenes de perfil
 * Paths.document es un objeto, necesitamos acceder a su URI
 */
const PROFILE_IMAGES_DIR = `${Paths.document.uri}/profile-images`;

/**
 * Inicializar directorio de imágenes de perfil
 * Usa la API oficial de expo-file-system v54+
 */
export const initializeImageDirectory = async (): Promise<void> => {
  try {
    // Crear instancia del directorio
    const dir = new Directory(PROFILE_IMAGES_DIR);
    
    // Verificar si el directorio existe (es una propiedad)
    if (!dir.exists) {
      // Crear el directorio si no existe
      await dir.create();
      console.log('✅ Profile images directory created:', PROFILE_IMAGES_DIR);
    } else {
      console.log('ℹ️ Profile images directory already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing image directory:', error);
    throw error;
  }
};

/**
 * Guardar imagen en el sistema de archivos local
 * @param sourceUri - URI de la imagen seleccionada/tomada
 * @returns URI local permanente de la imagen guardada
 */
export const saveProfileImage = async (sourceUri: string): Promise<string> => {
  try {
    // Asegurar que el directorio existe
    await initializeImageDirectory();
    
    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const filename = `profile_${timestamp}.jpg`;
    
    // Crear archivo de origen
    const sourceFile = new File(sourceUri);
    
    // Crear archivo de destino usando la ruta completa
    const destinationUri = `${PROFILE_IMAGES_DIR}/${filename}`;
    const destinationFile = new File(destinationUri);
    
    // Copiar la imagen al directorio permanente
    await sourceFile.copy(destinationFile);
    
    console.log('✅ Profile image saved:', destinationUri);
    return destinationUri;
  } catch (error) {
    console.error('❌ Error saving profile image:', error);
    throw error;
  }
};

/**
 * Eliminar imagen de perfil anterior
 * @param imageUri - URI de la imagen a eliminar
 */
export const deleteProfileImage = async (imageUri: string): Promise<void> => {
  try {
    // Verificar que la URI es de nuestro directorio
    if (!imageUri.includes('profile-images')) {
      console.log('⚠️ Image is not in our directory, skipping deletion');
      return;
    }
    
    // Crear instancia del archivo
    const file = new File(imageUri);
    
    // Verificar si existe (es una propiedad)
    if (file.exists) {
      // Eliminar el archivo
      await file.delete();
      console.log('✅ Old profile image deleted');
    }
  } catch (error) {
    console.error('❌ Error deleting profile image:', error);
    // No lanzar error, ya que es una operación de limpieza
  }
};

/**
 * Limpiar todas las imágenes de perfil antiguas excepto la actual
 * @param currentImageUri - URI de la imagen actual a preservar
 */
export const cleanupOldProfileImages = async (currentImageUri?: string): Promise<void> => {
  try {
    // Crear instancia del directorio
    const dir = new Directory(PROFILE_IMAGES_DIR);
    
    // Verificar si existe (es una propiedad)
    if (!dir.exists) {
      console.log('ℹ️ Profile images directory does not exist yet');
      return;
    }
    
    // Listar archivos en el directorio
    const files = await dir.list();
    
    for (const filename of files) {
      // Crear URI completa del archivo
      const fileUri = `${PROFILE_IMAGES_DIR}/${filename}`;
      
      // No eliminar la imagen actual
      if (currentImageUri && fileUri === currentImageUri) {
        continue;
      }
      
      // Eliminar archivo
      const file = new File(fileUri);
      await file.delete();
      console.log('🗑️ Cleaned up old image:', filename);
    }
    
    console.log('✅ Old profile images cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up old images:', error);
  }
};

/**
 * Validar que una imagen existe en el sistema de archivos
 * @param imageUri - URI de la imagen a validar
 * @returns true si existe, false si no
 */
export const validateImageExists = async (imageUri: string): Promise<boolean> => {
  try {
    const file = new File(imageUri);
    return file.exists; // Es una propiedad
  } catch (error) {
    console.error('❌ Error validating image:', error);
    return false;
  }
};