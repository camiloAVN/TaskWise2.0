import { GoalRepository } from '@/database/repositories';
import { useUserStore } from '@/stores/userStore';
import { Goal, GoalType } from '@/types/goal';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditProfileModal } from '../../../components/modals/EditProfileModal';
import { ImagePickerSheet } from '../../../components/modals/ImagePickerSheet';
import { AchievementsSection } from '../../../components/profile/AchievementsSection';
import { GoalsCard } from '../../../components/profile/GoalsCard';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { UserInfoCard } from '../../../components/profile/UserInfoCard';
import { useImagePicker } from '../../../hooks/useImagePicker';

const Profile = () => {
  const insets = useSafeAreaInsets();
  const { user, achievements, loading, loadUser, updateAvatar, updateUser, addXP } = useUserStore();

  useEffect(() => {
    console.log('🖼️ Profile Screen - Insets changed:', insets);
  }, [insets]);

  useEffect(() => {
    console.log('📱 Profile Screen - Mounted');
    return () => {
      console.log('📱 Profile Screen - Unmounted');
    };
  }, []);

  // Estado para el modal de selección de imagen
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Hook para manejar imágenes
  const { pickFromGallery, pickFromCamera, loading: imageLoading } = useImagePicker();

  const [showEditProfile, setShowEditProfile] = useState(false);

  // Estado para las metas
  const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
  const [yearlyGoals, setYearlyGoals] = useState<Goal[]>([]);

  // Cargar metas
  const loadGoals = async () => {
    if (!user) return;

    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const [monthly, yearly] = await Promise.all([
        GoalRepository.findMonthlyByYearMonth(user.id, currentYear, currentMonth),
        GoalRepository.findYearlyByYear(user.id, currentYear),
      ]);

      setMonthlyGoals(monthly);
      setYearlyGoals(yearly);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  // Cargar metas al montar el componente
  useEffect(() => {
    loadGoals();
  }, [user]);

  const handleRefresh = async () => {
    await loadUser();
    await loadGoals();
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
      Keyboard.dismiss();
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
      Keyboard.dismiss();
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

  // Handlers para metas
  const handleAddGoal = async (type: GoalType, title: string, description?: string) => {
    if (!user) return;

    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const newGoal = await GoalRepository.create(user.id, {
        type,
        title,
        description,
        year: currentYear,
        month: type === 'monthly' ? currentMonth : undefined,
      });

      // Actualizar el estado local
      if (type === 'monthly') {
        setMonthlyGoals([newGoal, ...monthlyGoals]);
      } else {
        setYearlyGoals([newGoal, ...yearlyGoals]);
      }

      Alert.alert('¡Listo!', 'Meta creada exitosamente');
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'No se pudo crear la meta');
    }
  };

  const handleToggleGoal = async (id: number) => {
    try {
      const updatedGoal = await GoalRepository.toggleCompleted(id);

      // Si la meta se completó, dar XP al usuario
      if (updatedGoal.completed) {
        await addXP(updatedGoal.xpReward);
        Alert.alert(
          '¡Meta Completada!',
          `Has ganado ${updatedGoal.xpReward} XP por completar esta meta.`
        );
      }

      // Actualizar el estado local
      if (updatedGoal.type === 'monthly') {
        setMonthlyGoals(monthlyGoals.map(g => (g.id === id ? updatedGoal : g)));
      } else {
        setYearlyGoals(yearlyGoals.map(g => (g.id === id ? updatedGoal : g)));
      }
    } catch (error) {
      console.error('Error toggling goal:', error);
      Alert.alert('Error', 'No se pudo actualizar la meta');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await GoalRepository.delete(id);

      // Actualizar el estado local
      setMonthlyGoals(monthlyGoals.filter(g => g.id !== id));
      setYearlyGoals(yearlyGoals.filter(g => g.id !== id));

      Alert.alert('¡Listo!', 'Meta eliminada');
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'No se pudo eliminar la meta');
    }
  };

  const handleEditGoal = async (id: number, title: string, description?: string) => {
    try {
      const updatedGoal = await GoalRepository.update(id, { title, description });

      // Actualizar el estado local
      if (updatedGoal.type === 'monthly') {
        setMonthlyGoals(monthlyGoals.map(g => (g.id === id ? updatedGoal : g)));
      } else {
        setYearlyGoals(yearlyGoals.map(g => (g.id === id ? updatedGoal : g)));
      }

      Alert.alert('¡Listo!', 'Meta actualizada');
    } catch (error) {
      console.error('Error editing goal:', error);
      Alert.alert('Error', 'No se pudo actualizar la meta');
    }
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
        contentContainerStyle={styles.scrollContent}
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

        {/* Goals Card */}
        <GoalsCard
          monthlyGoals={monthlyGoals}
          yearlyGoals={yearlyGoals}
          onAddGoal={handleAddGoal}
          onToggleGoal={handleToggleGoal}
          onDeleteGoal={handleDeleteGoal}
          onEditGoal={handleEditGoal}
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
    paddingBottom: 120
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