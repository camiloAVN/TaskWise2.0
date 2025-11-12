// app/(tabs)/Profile/index.tsx

import { useUserStore } from '@/stores/userStore';
import React from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AchievementsSection } from '../../../components/profile/AchievementsSection';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { ProfileStatsGrid } from '../../../components/profile/ProfileStatsGrid';
import { UserInfoCard } from '../../../components/profile/UserInfoCard';

const Profile = () => {
  const insets = useSafeAreaInsets();
  const { user, achievements, loading, loadUser } = useUserStore();

  const handleRefresh = async () => {
    await loadUser();
  };

  const handleEditProfile = () => {
    // TODO: Implementar edición de perfil
    Alert.alert('Editar Perfil', 'Función próximamente disponible');
  };

  const handleEditAvatar = () => {
    // TODO: Implementar cambio de avatar
    Alert.alert('Cambiar Avatar', 'Función próximamente disponible');
  };

  const handleSeeAllAchievements = () => {
    // TODO: Navegar a pantalla de todos los logros
    Alert.alert('Ver Logros', 'Función próximamente disponible');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer} />
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
    </SafeAreaView>
  );
}

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
});