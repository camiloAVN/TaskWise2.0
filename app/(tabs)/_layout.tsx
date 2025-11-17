import { CustomTabBar } from '@/components/CustomTabBar';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, UIManager } from 'react-native';

// ⭐ Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);  // ⭐ DESACTIVAR
}

const _layout = () => {
  const { setUserId, loadEssentialTasks, loadRecentCompleted } = useTaskStore();
  const { loadUser } = useUserStore();

  useEffect(() => {
    const initializeStores = async () => {
      try {
        await loadUser();
        const user = useUserStore.getState().user;
        
        if (user) {
          setUserId(user.id);
          await loadEssentialTasks();
          await loadRecentCompleted();
          console.log('✅ Stores initialized');
        }
      } catch (error) {
        console.error('❌ Error initializing stores:', error);
      }
    };
    
    initializeStores();
  }, []);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // ⭐ AGREGAR ESTAS OPCIONES CRÍTICAS
        tabBarHideOnKeyboard: false,
        lazy: false,
        freezeOnBlur: true,
        animation: 'none',
      }}
    >
      <Tabs.Screen
        name="Home/index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="Stats/index"
        options={{
          title: 'Estadísticas',
        }}
      />
      <Tabs.Screen
        name="Agenda/index"
        options={{
          title: 'Agenda',
        }}
      />
      <Tabs.Screen
        name="Profile/index"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
};

export default _layout;