import { useUserStore } from '@/stores/userStore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditProfileModal } from '../../../components/modals/EditProfileModal';
import { ImagePickerSheet } from '../../../components/modals/ImagePickerSheet';
import { AchievementsSection } from '../../../components/profile/AchievementsSection';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { ProfileStatsGrid } from '../../../components/profile/ProfileStatsGrid';
import { UserInfoCard } from '../../../components/profile/UserInfoCard';
import { useImagePicker } from '../../../hooks/useImagePicker';

const Profile = () => {
  const insets = useSafeAreaInsets();
  const { user, achievements, loading, loadUser, updateAvatar, updateUser } = useUserStore();
  
  // Estado para el modal de selección de imagen
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  // Hook para manejar imágenes
  const { pickFromGallery, pickFromCamera, loading: imageLoading } = useImagePicker();

  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleRefresh = async () => {
    await loadUser();
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  /**
   * Abrir modal de selección de imagen
   */
  const handleEditAvatar = () => {
    setShowImagePicker(true);
  };

  /**
   * Seleccionar imagen de la galería
   */
  const handleSelectFromGallery = async () => {
    try {
      const imageUri = await pickFromGallery(user?.avatar);
      
      if (imageUri) {
        await updateAvatar(imageUri);
        Alert.alert('¡Listo!', 'Tu foto de perfil se actualizó correctamente');
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    }
  };

  /**
   * Tomar foto con la cámara
   */
  const handleTakePhoto = async () => {
    try {
      const imageUri = await pickFromCamera(user?.avatar);
      
      if (imageUri) {
        await updateAvatar(imageUri);
        Alert.alert('¡Listo!', 'Tu foto de perfil se actualizó correctamente');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    }
  };

  /**
   * Eliminar foto de perfil actual
   */
  const handleRemovePhoto = () => {
    Alert.alert(
      'Eliminar Foto',
      '¿Estás seguro de que quieres eliminar tu foto de perfil?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateAvatar(null);
              Alert.alert('¡Listo!', 'Tu foto de perfil se eliminó correctamente');
            } catch (error) {
              console.error('Error removing photo:', error);
              Alert.alert('Error', 'No se pudo eliminar la foto de perfil');
            }
          },
        },
      ]
    );
  };

  const handleSeeAllAchievements = () => {
    // TODO: Navegar a pantalla de todos los logros
    Alert.alert('Ver Logros', 'Función próximamente disponible');
  };

  const handleSaveProfile = async (data: { name: string; age?: number; email?: string }) => {
  try {
    await updateUser(data);
    Alert.alert('¡Listo!', 'Tu perfil se actualizó correctamente');
  } catch (error) {
    console.error('Error saving profile:', error);
    Alert.alert('Error', 'No se pudo actualizar el perfil');
  }
};
  // Loading state inicial
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d9f434" />
        </View>
      </SafeAreaView>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#d9f434"
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          avatar={user.avatar}
          name={user.name}
          onEditPress={handleEditProfile}
          onAvatarPress={handleEditAvatar}
        />

        {/* User Info Card */}
        <UserInfoCard user={user} />

        {/* Stats Grid */}
        <ProfileStatsGrid
          tasksCompleted={user.totalTasksCompleted}
          currentStreak={user.currentStreak}
          bestStreak={user.bestStreak}
          achievementsUnlocked={unlockedAchievements.length}
        />

        {/* Achievements */}
        <AchievementsSection
          achievements={achievements}
          onSeeAll={handleSeeAllAchievements}
        />
      </ScrollView>

      {/* Image Picker Sheet */}
      <ImagePickerSheet
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectCamera={handleTakePhoto}
        onSelectGallery={handleSelectFromGallery}
        onRemovePhoto={handleRemovePhoto}
        hasCurrentPhoto={!!user.avatar}
      />
      <EditProfileModal
        visible={showEditProfile}
        user={user}
        onClose={() => setShowEditProfile(false)}
        onSave={handleSaveProfile}
      />

      {/* Loading Overlay */}
      {imageLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#d9f434" />
            <Text style={styles.loadingText}> Procesando imagen...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  loadingText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});